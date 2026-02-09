<?php

namespace App\Http\Controllers;

use App\Models\Bus;
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
        $busesQuery = Bus::with(['route', 'driver'])
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

        // Calculate stats
        $totalPassengersToday = $todayEvents->sum('passenger_count');
        $onlineBuses = $buses->filter(fn($bus) => $bus->isOnline())->count();
        $totalBuses = $buses->count();

        // Hourly breakdown for chart
        $hourlyStats = TelemetryEvent::whereIn('bus_id', $busIds)
            ->where('event_timestamp', '>=', $todayStart)
            ->select(
                DB::raw('HOUR(event_timestamp) as hour'),
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
                'driver' => $bus->driver?->name,
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
                'onlineBuses' => $onlineBuses,
                'totalBuses' => $totalBuses,
                'estimatedRevenue' => number_format($estimatedRevenue, 2),
            ],
            'hourlyData' => $hourlyData,
            'buses' => $busesWithStats,
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
