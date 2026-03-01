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
        if (!$user->isAdmin() && $user->role !== 'manager') {
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
        if (!$user->isAdmin() && $user->role !== 'manager') {
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
        if (!$user->isAdmin() && $user->role !== 'manager') {
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
        if (!$user->isAdmin() && $user->role !== 'manager') {
            abort(403);
        }

        $dateStr = $request->input('date', today()->toDateString());
        $date = Carbon::parse($dateStr);

        $routesQuery = Route::active();
        if (!$user->isAdmin()) {
            $routesQuery->where('owner_id', $user->id);
        }
        $routes = $routesQuery->get(['id', 'name']);

        $routeStats = [];

        foreach ($routes as $route) {
            // Get all active buses for this route
            $buses = Bus::where('route_id', $route->id)->get(['id']);
            $busIds = $buses->pluck('id');

            if ($busIds->isEmpty()) {
                continue;
            }

            // For each bus, find their first and last telemetry event for the given day
            $busDurations = [];

            foreach ($busIds as $busId) {
                $firstEvent = TelemetryEvent::where('bus_id', $busId)
                    ->whereDate('event_timestamp', $date)
                    ->orderBy('event_timestamp', 'asc')
                    ->first(['event_timestamp']);

                $lastEvent = TelemetryEvent::where('bus_id', $busId)
                    ->whereDate('event_timestamp', $date)
                    ->orderBy('event_timestamp', 'desc')
                    ->first(['event_timestamp']);

                if ($firstEvent && $lastEvent && $firstEvent->event_timestamp->ne($lastEvent->event_timestamp)) {
                    $minutes = $firstEvent->event_timestamp->diffInMinutes($lastEvent->event_timestamp);
                    // Filter out implausible durations (e.g. less than 10 mins or more than 20 hours)
                    if ($minutes > 10 && $minutes < 1200) {
                        $busDurations[] = $minutes;
                    }
                }
            }

            if (count($busDurations) > 0) {
                $avgMinutes = array_sum($busDurations) / count($busDurations);
                $routeStats[] = [
                    'id' => $route->id,
                    'name' => $route->name,
                    'active_buses' => count($busDurations),
                    'average_duration_minutes' => round($avgMinutes)
                ];
            }
        }

        return Inertia::render('AdvancedReports/RouteTimes', [
            'routeStats' => $routeStats,
            'selectedDate' => $dateStr
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
