<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MapController extends Controller
{
    /**
     * Display the maps interface.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get routes belonging to the owner
        $routes = Route::active()
            ->forUser($user)
            ->with([
                'buses' => function ($query) {
                    $query->where('is_active', true);
                }
            ])
            ->get(['id', 'name', 'origin', 'destination']);

        // Get buses belonging to the owner
        $buses = Bus::where('is_active', true)
            ->forUser($user)
            ->with('route:id,name')
            ->get(['id', 'plate', 'model', 'route_id']);

        return Inertia::render('Maps/Index', [
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }

    /**
     * Get live telemetry data for active buses.
     */
    public function live(Request $request)
    {
        $user = $request->user();

        // Get the latest telemetry event for each active bus owned by the user
        // Using a subquery approach to get the most recent event per bus
        $latestEventsSubquery = DB::table('telemetry_events')
            ->select('bus_id', DB::raw('MAX(event_timestamp) as latest_timestamp'))
            ->groupBy('bus_id');

        $liveBuses = DB::table('telemetry_events as te')
            ->joinSub($latestEventsSubquery, 'latest', function ($join) {
                $join->on('te.bus_id', '=', 'latest.bus_id')
                    ->on('te.event_timestamp', '=', 'latest.latest_timestamp');
            })
            ->join('buses as b', 'te.bus_id', '=', 'b.id')
            ->leftJoin('routes as r', 'b.route_id', '=', 'r.id')
            ->where('b.is_active', true)
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                return $query->where('b.owner_id', $user->id);
            })
            // Only consider events from the last 2 hours as "live" to avoid showing buses that have been offline for days
            ->where('te.event_timestamp', '>=', now()->subHours(2))
            ->select(
                'b.id as bus_id',
                'b.plate',
                'b.model',
                'r.name as route_name',
                'te.latitude',
                'te.longitude',
                'te.passenger_count',
                'te.event_timestamp'
            )
            ->get();

        return response()->json($liveBuses);
    }

    /**
     * Get historical telemetry data for a bus within a date range.
     */
    public function history(Request $request)
    {
        $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
        ]);

        $user = $request->user();
        $bus = Bus::findOrFail($request->bus_id);

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403, 'Unauthorized access to this bus.');
        }

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Limit range to maximum 24 hours to prevent huge payloads
        if ($startTime->diffInHours($endTime) > 24) {
            return response()->json(['message' => 'El rango de búsqueda de historial no puede exceder las 24 horas.'], 400);
        }

        $events = $bus->telemetryEvents()
            ->whereBetween('event_timestamp', [$startTime, $endTime])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('event_timestamp', 'asc')
            ->get(['id', 'latitude', 'longitude', 'passenger_count', 'event_timestamp']);

        // Process data for the frontend
        $path = [];
        $boardingEvents = [];

        foreach ($events as $event) {
            $path[] = [$event->latitude, $event->longitude];

            if ($event->passenger_count > 0) {
                $boardingEvents[] = [
                    'id' => $event->id,
                    'lat' => $event->latitude,
                    'lng' => $event->longitude,
                    'passengers' => $event->passenger_count,
                    'timestamp' => $event->event_timestamp->format('H:i:s Y-m-d'),
                ];
            }
        }

        return response()->json([
            'bus' => [
                'id' => $bus->id,
                'plate' => $bus->plate,
            ],
            'path' => $path,
            'boardingEvents' => $boardingEvents,
        ]);
    }
}
