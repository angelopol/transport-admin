<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Throwable;

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
     * Uses last_latitude/last_longitude stored on the bus record, which is
     * updated on every heartbeat, making the map reactive even when no
     * passenger events are being generated.
     */
    public function live(Request $request)
    {
        $user = $request->user();

        $liveBuses = DB::table('buses as b')
            ->leftJoin('routes as r', 'b.route_id', '=', 'r.id')
            // Get the latest passenger_count and timestamp from the exact most recent event record
            ->leftJoinSub(
                DB::table('telemetry_events as te')
                    ->whereIn('id', function($query) {
                        $query->select(DB::raw('MAX(id)'))
                            ->from('telemetry_events')
                            ->groupBy('bus_id');
                    }),
                'latest_event',
                'b.id',
                '=',
                'latest_event.bus_id'
            )
            ->where('b.is_active', true)
            ->whereNotNull('b.last_latitude')
            ->whereNotNull('b.last_longitude')
            // Only consider buses seen in the last 2 hours as "live"
            ->where('b.last_seen_at', '>=', now()->subHours(2))
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                return $query->where('b.owner_id', $user->id);
            })
            ->select(
                'b.id as bus_id',
                'b.plate',
                'b.model',
                'r.name as route_name',
                'b.last_latitude as latitude',
                'b.last_longitude as longitude',
                DB::raw('COALESCE(latest_event.passenger_count, 0) as passenger_count'),
                'b.last_seen_at as event_timestamp'
            )
            ->get();

        $liveBuses = $liveBuses->map(function ($bus) {
            $bus->address = $this->resolveLiveAddress($bus->latitude, $bus->longitude);
            $bus->event_timestamp = $bus->event_timestamp
                ? Carbon::parse($bus->event_timestamp, 'UTC')->toIso8601String()
                : null;

            return $bus;
        });

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

    private function resolveLiveAddress($latitude, $longitude): ?string
    {
        if ($latitude === null || $longitude === null) {
            return null;
        }

        $lat = number_format((float) $latitude, 4, '.', '');
        $lng = number_format((float) $longitude, 4, '.', '');
        $cacheKey = "maps:reverse-geocode:{$lat}:{$lng}";
        $cacheTtl = now()->addMinutes(config('services.nominatim.cache_minutes', 30));

        return Cache::remember($cacheKey, $cacheTtl, function () use ($lat, $lng) {
            try {
                $response = Http::acceptJson()
                    ->timeout(5)
                    ->withHeaders([
                        'User-Agent' => sprintf('%s transport-admin/1.0', config('app.name', 'SIMCI-TU')),
                        'Referer' => config('app.url'),
                    ])
                    ->get(rtrim(config('services.nominatim.endpoint'), '/') . '/reverse', array_filter([
                        'format' => 'jsonv2',
                        'lat' => $lat,
                        'lon' => $lng,
                        'zoom' => 18,
                        'addressdetails' => 1,
                        'email' => config('services.nominatim.email'),
                    ]));

                if (!$response->successful()) {
                    return null;
                }

                $payload = $response->json();
                $address = data_get($payload, 'address', []);

                $parts = array_filter([
                    $address['road'] ?? null,
                    $address['suburb'] ?? ($address['neighbourhood'] ?? null),
                    $address['city'] ?? ($address['town'] ?? ($address['village'] ?? null)),
                    $address['state'] ?? null,
                ]);

                if (!empty($parts)) {
                    return implode(', ', array_unique($parts));
                }

                return data_get($payload, 'display_name');
            } catch (Throwable $exception) {
                report($exception);

                return null;
            }
        });
    }
}
