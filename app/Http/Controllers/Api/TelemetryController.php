<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Bus;
use App\Models\TelemetryEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelemetryController extends Controller
{
    public function sync(Request $request)
    {
        // Simple Bearer Token Auth for Devices
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        // Find Device by token
        $device = Device::where('api_token', $token)->first();

        if (!$device) {
            return response()->json(['message' => 'Unauthorized Device'], 401);
        }

        // Find linked Bus
        $bus = Bus::where('device_mac', $device->mac_address)
            ->where('is_active', true)
            ->first();

        if (!$bus) {
            return response()->json(['message' => 'Device not linked to an active bus'], 403);
        }

        // Validate payload
        try {
            $validated = $request->validate([
                'events'           => 'present|array',
                'events.*.timestamp' => 'required|date',
                'events.*.count'   => 'required|integer',
                'events.*.location' => 'nullable|array',
                'events.*.type'    => 'nullable|string',
                // Top-level location for heartbeats
                'location'         => 'nullable|array',
                // Relax validation to allow manual sanitization
                'location.lat'     => 'nullable',
                'location.lon'     => 'nullable',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Invalid data format', 'errors' => $e->errors()], 422);
        }

        $count = 0;
        $lastLat = null;
        $lastLon = null;

        foreach ($request->events as $eventData) {
            // Avoid duplicates based on timestamp for this bus
            $exists = TelemetryEvent::where('bus_id', $bus->id)
                ->where('event_timestamp', $eventData['timestamp'])
                ->exists();

            if (!$exists) {
                // Sanitizar y validar coordenadas (Test 6)
                $lat_raw = $eventData['location']['lat'] ?? null;
                $lon_raw = $eventData['location']['lon'] ?? null;
                
                $lat = is_numeric($lat_raw) ? (float) $lat_raw : null;
                $lon = is_numeric($lon_raw) ? (float) $lon_raw : null;
                
                // Aplicar valores nulos seguros si están fuera del rango topográfico
                if ($lat !== null && ($lat < -90 || $lat > 90)) $lat = null;
                if ($lon !== null && ($lon < -180 || $lon > 180)) $lon = null;

                try {
                    TelemetryEvent::create([
                        'bus_id'           => $bus->id,
                        'event_timestamp'  => $eventData['timestamp'],
                        'passenger_count'  => $eventData['count'],
                        'latitude'         => $lat,
                        'longitude'        => $lon,
                        'location_source'  => 'gps',
                        'event_type'       => $eventData['type'] ?? 'boarding',
                        'synced_at'        => now(),
                    ]);
                    $count++;

                    // Track most recent valid coords from events
                    if ($lat !== null && $lon !== null) {
                        $lastLat = $lat;
                        $lastLon = $lon;
                    }
                } catch (\Illuminate\Database\QueryException $e) {
                    // Check if it's a unique constraint violation (Error 1062 in MySQL)
                    if ($e->errorInfo[1] == 1062 || $e->getCode() == 23000) {
                        Log::warning("Concurrent duplicate telemetry event rejected for bus {$bus->id} at {$eventData['timestamp']}");
                    } else {
                        throw $e;
                    }
                }
            }
        }

        // Prefer top-level heartbeat location if provided
        $topLat = $request->input('location.lat');
        $topLon = $request->input('location.lon');
        if ($topLat !== null && $topLon !== null) {
            $lastLat = $topLat;
            $lastLon = $topLon;
        }

        // Build update payload
        $busUpdate = ['last_seen_at' => now()];
        if ($lastLat !== null && $lastLon !== null) {
            $busUpdate['last_latitude']  = $lastLat;
            $busUpdate['last_longitude'] = $lastLon;
        }
        $bus->update($busUpdate);

        // If no passenger events were recorded but the device sent a heartbeat,
        // store a heartbeat event so the connection calendar reflects the ping.
        if ($count === 0) {
            $hbLat = $lastLat ?? null;
            $hbLon = $lastLon ?? null;

            $nowTs = now();
            $alreadyHasHeartbeatToday = TelemetryEvent::where('bus_id', $bus->id)
                ->whereDate('event_timestamp', $nowTs->toDateString())
                ->where('event_type', 'heartbeat')
                ->exists();

            if (!$alreadyHasHeartbeatToday) {
                try {
                    TelemetryEvent::create([
                        'bus_id'          => $bus->id,
                        'event_timestamp' => $nowTs,
                        'passenger_count' => 0,
                        'latitude'        => $hbLat,
                        'longitude'       => $hbLon,
                        'location_source' => 'gps',
                        'event_type'      => 'heartbeat',
                        'synced_at'       => $nowTs,
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    Log::warning("Could not store heartbeat for bus {$bus->id}: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message'      => 'Sync successful',
            'synced_count' => $count,
        ]);
    }

    public function status()
    {
        return response()->json([
            'status' => 'online',
            'time' => now()->toIso8601String(),
            'version' => '1.0.0'
        ]);
    }
}
