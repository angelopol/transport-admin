<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\ManualRevenueEntry;
use App\Models\TelemetryEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with fleet statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get buses based on role
        $busesQuery = Bus::with(['route', 'drivers'])
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                $query->where('owner_id', $user->id);
            });

        $buses = $busesQuery->get();
        $busIds = $buses->pluck('id');

        // Today's stats
        $todayStart = now()->startOfDay();
        $todayEvents = TelemetryEvent::whereIn('bus_id', $busIds)
            ->where('event_timestamp', '>=', $todayStart)
            ->get();

        $todayManualEntries = ManualRevenueEntry::whereIn('bus_id', $busIds)
            ->where('registered_at', '>=', $todayStart)
            ->get();

        // Calculate stats
        $totalPassengersToday = $todayEvents->sum('passenger_count'); // Telemetry Enters
        $totalManualPassengersToday = $todayManualEntries->count(); // Paid Passengers
        
        // Evasion Calculation for Today
        $evasionCount = max(0, $totalPassengersToday - $totalManualPassengersToday);
        $totalSystemPassengers = max($totalPassengersToday, $totalManualPassengersToday);
        $evasionRate = $totalSystemPassengers > 0 ? ($evasionCount / $totalSystemPassengers) * 100 : 0;

        $actualRevenue = $todayManualEntries->sum('amount');

        $onlineBuses = $buses->filter(fn($bus) => $bus->isOnline())->count();
        $totalBuses = $buses->count();

        // Calculate Alerts (Early Warnings)
        $alerts = [];
        
        // 1. Offline buses (> 30 mins)
        foreach ($buses as $bus) {
            if (!$bus->isOnline()) {
                $lastSeen = $bus->last_seen_at ? $bus->last_seen_at->diffForHumans() : 'Nunca';
                $alerts[] = [
                    'id' => 'offline_' . $bus->id,
                    'type' => 'warning',
                    'title' => 'Unidad Desconectada',
                    'message' => "La unidad {$bus->plate} no reporta métricas. Última conexión: {$lastSeen}."
                ];
            }
        }

        // 2. High Evasion Rate (> 15%)
        // Let's compute evasion per bus for today using $todayEvents and $todayManualEntries
        $eventsByBus = $todayEvents->groupBy('bus_id');
        $manualByBus = $todayManualEntries->groupBy('bus_id');

        foreach ($buses as $bus) {
            $telemetry = $eventsByBus->get($bus->id)?->sum('passenger_count') ?? 0;
            $manual = $manualByBus->get($bus->id)?->count() ?? 0;
            $totalPax = max($telemetry, $manual);
            $evasionCountBus = max(0, $telemetry - $manual);
            
            if ($totalPax > 0) {
                $rate = ($evasionCountBus / $totalPax) * 100;
                if ($rate > 15) {
                    $alerts[] = [
                        'id' => 'evasion_' . $bus->id,
                        'type' => 'danger',
                        'title' => 'Alta Tasa de Evasión',
                        'message' => "La unidad {$bus->plate} presenta " . round($rate, 1) . "% de evasión detectada hoy."
                    ];
                }
            }
        }

        // Hourly breakdown for chart
        $driver = DB::connection()->getDriverName();
        $hourExpression = $driver === 'sqlite'
            ? "CAST(strftime('%H', event_timestamp) AS INTEGER)"
            : "HOUR(event_timestamp)";

        $hourlyStats = TelemetryEvent::whereIn('bus_id', $busIds)
            ->where('event_timestamp', '>=', $todayStart)
            ->select(
                DB::raw("$hourExpression as hour"),
                DB::raw('SUM(passenger_count) as passengers')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->keyBy('hour');

        // Fill in missing hours
        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourlyData[] = [
                'hour' => sprintf('%02d:00', $h),
                'passengers' => $hourlyStats->get($h)?->passengers ?? 0,
            ];
        }

        // Buses with today's stats
        $busesWithStats = $buses->map(function ($bus) use ($todayStart) {
            $todayPassengers = $bus->telemetryEvents()
                ->where('event_timestamp', '>=', $todayStart)
                ->sum('passenger_count');

            return [
                'id' => $bus->id,
                'plate' => $bus->plate,
                'model' => $bus->model,
                'route' => $bus->route?->name,
                'driver' => $bus->drivers->pluck('name')->join(', '),
                'is_online' => $bus->isOnline(),
                'last_seen' => $bus->last_seen_at?->diffForHumans(),
                'today_passengers' => $todayPassengers,
                'capacity' => $bus->capacity,
            ];
        });

        // Revenue calculation (if routes have fares)
        $estimatedRevenue = 0;
        foreach ($buses as $bus) {
            if ($bus->route?->fare) {
                $busPassengers = $todayEvents->where('bus_id', $bus->id)->sum('passenger_count');
                $estimatedRevenue += $busPassengers * $bus->route->fare;
            }
        }

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalPassengersToday' => $totalPassengersToday,
                'totalManualPassengersToday' => $totalManualPassengersToday,
                'evasionRate' => round($evasionRate, 1),
                'evasionCount' => $evasionCount,
                'actualRevenue' => number_format($actualRevenue, 2),
                'estimatedRevenue' => number_format($estimatedRevenue, 2),
                'onlineBuses' => $onlineBuses,
                'totalBuses' => $totalBuses,
            ],
            'alerts' => $alerts,
            'hourlyData' => $hourlyData,
            'buses' => $busesWithStats,
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
