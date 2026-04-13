<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Route;
use App\Models\TelemetryEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdvancedReportController extends Controller
{
    /**
     * Display the index of advanced reports
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isOwner()) {
            abort(403);
        }

        return Inertia::render('AdvancedReports/Index');
    }

    /**
     * Unit Spacing Report
     */
    public function unitSpacing(Request $request): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isOwner()) {
            abort(403);
        }

        $routesQuery = Route::active();
        if (!$user->isAdmin()) {
            $routesQuery->where('owner_id', $user->id);
        }
        $routes = $routesQuery->get(['id', 'name']);

        $selectedRouteId = $request->input('route_id');
        $busesData = [];

        if ($selectedRouteId) {
            $buses = Bus::where('route_id', $selectedRouteId)
                ->where('is_active', true)
                ->with([
                    'telemetryEvents' => function ($query) {
                        $query->withLocation()->latest('event_timestamp')->limit(1);
                    }
                ])
                ->get();

            // Prepare sorting and data formatting
            foreach ($buses as $bus) {
                $latestEvent = $bus->telemetryEvents->first();
                if ($latestEvent) {
                    $busesData[] = [
                        'id' => $bus->id,
                        'plate' => $bus->plate,
                        'lat' => $latestEvent->latitude,
                        'lng' => $latestEvent->longitude,
                        'last_seen' => $latestEvent->event_timestamp,
                        'last_seen_formatted' => $latestEvent->event_timestamp->format('Y-m-d H:i:s'),
                    ];
                }
            }

            // To figure out the spacing, we ideally sort them along the route. 
            // For now, sorting them by last_seen to show the gap between them.
            usort($busesData, function ($a, $b) {
                return $a['last_seen'] <=> $b['last_seen'];
            });

            // Calculate differences
            for ($i = 0; $i < count($busesData); $i++) {
                if ($i > 0) {
                    $prev = $busesData[$i - 1];
                    $curr = $busesData[$i];

                    // Simple Haversine
                    $distance = $this->haversineGreatCircleDistance($curr['lat'], $curr['lng'], $prev['lat'], $prev['lng']);
                    $timeDiff = $curr['last_seen']->diffInMinutes($prev['last_seen']);

                    $busesData[$i]['distance_to_prev'] = round($distance, 2); // meters
                    $busesData[$i]['time_to_prev'] = abs($timeDiff); // minutes
                } else {
                    $busesData[$i]['distance_to_prev'] = 0;
                    $busesData[$i]['time_to_prev'] = 0;
                }
            }
        }

        return Inertia::render('AdvancedReports/UnitSpacing', [
            'routes' => $routes,
            'busesData' => $busesData,
            'selectedRouteId' => $selectedRouteId
        ]);
    }

    /**
     * Passengers per Area Report
     */
    public function passengersPerArea(Request $request): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isOwner()) {
            abort(403);
        }

        $bounds = $request->input('bounds'); // ['minLat', 'maxLat', 'minLng', 'maxLng']
        $dateStr = $request->input('date', today()->toDateString());
        $date = Carbon::parse($dateStr);

        $stats = [
            'total_passengers' => 0,
            'total_events' => 0,
            'average_passengers_per_stop' => 0
        ];

        // Base query for the day
        $query = TelemetryEvent::withLocation()->whereDate('event_timestamp', $date);

        // Scope to user's buses if not admin
        if (!$user->isAdmin()) {
            $query->whereHas('bus', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            });
        }

        // Apply bounds filter if provided
        if ($bounds && isset($bounds['minLat'], $bounds['maxLat'], $bounds['minLng'], $bounds['maxLng'])) {
            $query->whereBetween('latitude', [$bounds['minLat'], $bounds['maxLat']])
                ->whereBetween('longitude', [$bounds['minLng'], $bounds['maxLng']]);
        }

        $events = $query->with('bus:id,plate')->get(['id', 'bus_id', 'latitude', 'longitude', 'passenger_count', 'event_timestamp']);

        if ($events->count() > 0) {
            $stats['total_events'] = $events->count();
            $stats['total_passengers'] = $events->sum('passenger_count');
            $stats['average_passengers_per_stop'] = round($stats['total_passengers'] / $stats['total_events'], 2);
        }

        return Inertia::render('AdvancedReports/PassengersPerArea', [
            'stats' => $stats,
            'selectedDate' => $dateStr,
            'bounds' => $bounds,
            'events' => $events
        ]);
    }

    /**
     * Route Average Times Report
     */
    public function routeTimes(Request $request): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isOwner()) {
            abort(403);
        }

        $dateStr = $request->input('date', today()->toDateString());
        $date = Carbon::parse($dateStr);

        $reportTimezone = 'America/Caracas';

        $routesQuery = Route::active();
        if (!$user->isAdmin()) {
            $routesQuery->where('owner_id', $user->id);
        }
        $routes = $routesQuery->get(['id', 'name', 'origin', 'destination']);

        $routeStats = [];

        foreach ($routes as $route) {
            $buses = Bus::where('route_id', $route->id)
                ->where('is_active', true)
                ->get(['id', 'plate', 'model']);

            if ($buses->isEmpty()) {
                continue;
            }

            $busDurations = [];
            $busEventCounts = [];
            $busPassengers = [];
            $startSeconds = [];
            $endSeconds = [];
            $earliestStart = null;
            $latestEnd = null;
            $units = [];

            foreach ($buses as $bus) {
                $events = TelemetryEvent::where('bus_id', $bus->id)
                    ->whereDate('event_timestamp', $date)
                    ->orderBy('event_timestamp', 'asc')
                    ->get(['event_timestamp', 'passenger_count']);

                if ($events->count() < 2) {
                    continue;
                }

                $firstEvent = $events->first();
                $lastEvent = $events->last();

                if (!$firstEvent || !$lastEvent || $firstEvent->event_timestamp->eq($lastEvent->event_timestamp)) {
                    continue;
                }

                $minutes = $firstEvent->event_timestamp->diffInMinutes($lastEvent->event_timestamp);

                if ($minutes <= 10 || $minutes >= 1200) {
                    continue;
                }

                $firstLocal = $firstEvent->event_timestamp->copy()->timezone($reportTimezone);
                $lastLocal = $lastEvent->event_timestamp->copy()->timezone($reportTimezone);
                $eventCount = $events->count();
                $passengers = (int) $events->sum('passenger_count');

                $busDurations[] = $minutes;
                $busEventCounts[] = $eventCount;
                $busPassengers[] = $passengers;

                $startOfDay = $firstLocal->copy()->startOfDay();
                $startSeconds[] = $startOfDay->diffInSeconds($firstLocal);
                $endSeconds[] = $startOfDay->diffInSeconds($lastLocal);

                $earliestStart = $earliestStart === null || $firstLocal->lt($earliestStart) ? $firstLocal : $earliestStart;
                $latestEnd = $latestEnd === null || $lastLocal->gt($latestEnd) ? $lastLocal : $latestEnd;

                $units[] = [
                    'id' => $bus->id,
                    'plate' => $bus->plate,
                    'model' => $bus->model,
                    'duration_minutes' => $minutes,
                    'event_count' => $eventCount,
                    'passengers' => $passengers,
                    'first_seen' => $firstLocal->format('H:i'),
                    'last_seen' => $lastLocal->format('H:i'),
                ];
            }

            if (count($busDurations) > 0) {
                $avgMinutes = array_sum($busDurations) / count($busDurations);
                $avgStartSeconds = (int) round(array_sum($startSeconds) / count($startSeconds));
                $avgEndSeconds = (int) round(array_sum($endSeconds) / count($endSeconds));

                $routeStats[] = [
                    'id' => $route->id,
                    'name' => $route->name,
                    'origin' => $route->origin,
                    'destination' => $route->destination,
                    'active_buses' => count($busDurations),
                    'average_duration_minutes' => round($avgMinutes),
                    'min_duration_minutes' => min($busDurations),
                    'max_duration_minutes' => max($busDurations),
                    'average_event_count' => round(array_sum($busEventCounts) / count($busEventCounts), 1),
                    'total_events' => array_sum($busEventCounts),
                    'total_passengers' => array_sum($busPassengers),
                    'average_passengers_per_active_bus' => round(array_sum($busPassengers) / count($busPassengers), 1),
                    'average_start_time' => Carbon::createFromTime(0, 0, 0, $reportTimezone)->addSeconds($avgStartSeconds)->format('H:i'),
                    'average_end_time' => Carbon::createFromTime(0, 0, 0, $reportTimezone)->addSeconds($avgEndSeconds)->format('H:i'),
                    'earliest_start_time' => $earliestStart?->format('H:i'),
                    'latest_end_time' => $latestEnd?->format('H:i'),
                    'units' => collect($units)->sortBy('first_seen')->values()->all(),
                ];
            }
        }

        return Inertia::render('AdvancedReports/RouteTimes', [
            'routeStats' => $routeStats,
            'selectedDate' => $dateStr
        ]);
    }

    /**
     * Comparative Report (Unit Performance)
     */
    public function comparative(Request $request): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isOwner()) {
            abort(403);
        }

        $monthParam = $request->input('month', now()->timezone('America/Caracas')->format('Y-m'));
        try {
            $monthStart = Carbon::createFromFormat('Y-m', $monthParam, 'America/Caracas')->startOfMonth();
        } catch (\Exception $e) {
            $monthStart = now()->timezone('America/Caracas')->startOfMonth();
        }

        $monthEnd = $monthStart->copy()->endOfMonth()->endOfDay();
        $startUtc = $monthStart->copy()->setTimezone('UTC');
        $endUtc = $monthEnd->copy()->setTimezone('UTC');

        // Scope buses
        $busesQuery = Bus::active();
        if (!$user->isAdmin()) {
            $busesQuery->where('owner_id', $user->id);
        }
        $buses = $busesQuery->get(['id', 'plate']);
        $busIds = $buses->pluck('id');

        // Fetch aggregates
        $telemetryCounts = TelemetryEvent::whereIn('bus_id', $busIds)
            ->whereBetween('event_timestamp', [$startUtc, $endUtc])
            ->selectRaw('bus_id, SUM(passenger_count) as total_telemetry_passengers')
            ->groupBy('bus_id')
            ->get()
            ->keyBy('bus_id');

        $manualCounts = DB::table('manual_revenue_entries')
            ->whereIn('bus_id', $busIds)
            ->whereBetween('registered_at', [$startUtc, $endUtc])
            ->selectRaw('bus_id, COUNT(*) as total_manual_passengers, SUM(amount) as total_revenue')
            ->groupBy('bus_id')
            ->get()
            ->keyBy('bus_id');

        $comparativeData = $buses->map(function ($bus) use ($telemetryCounts, $manualCounts) {
            $telemetry = $telemetryCounts->get($bus->id)?->total_telemetry_passengers ?? 0;
            $manual = $manualCounts->get($bus->id)?->total_manual_passengers ?? 0;
            $revenue = $manualCounts->get($bus->id)?->total_revenue ?? 0;

            // Simple evasion estimate per unit
            $evasionCount = max(0, $telemetry - $manual);
            $totalPassengers = max($telemetry, $manual);
            $evasionRate = $totalPassengers > 0 ? ($evasionCount / $totalPassengers) * 100 : 0;

            return [
                'id' => $bus->id,
                'plate' => $bus->plate,
                'total_telemetry_passengers' => (int) $telemetry,
                'total_manual_passengers' => (int) $manual,
                'evasion_rate' => round($evasionRate, 1),
                'total_revenue' => (float) $revenue,
            ];
        });

        // Filter out buses with 0 passengers entirely and sort by revenue
        $comparativeData = $comparativeData->filter(function ($item) {
            return $item['total_telemetry_passengers'] > 0 || $item['total_manual_passengers'] > 0;
        })->sortByDesc('total_revenue')->values();

        return Inertia::render('AdvancedReports/Comparative', [
            'comparativeData' => $comparativeData,
            'currentMonth' => $monthStart->format('Y-m'),
        ]);
    }

    /**
     * Helper to compute distance (Haversine)
     */
    private function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000)
    {
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $angle * $earthRadius;
    }
}
