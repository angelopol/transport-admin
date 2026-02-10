<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $bus = Bus::where('api_token', $token)->first();

        if (!$bus) {
            return response()->json(['message' => 'Unauthorized Device'], 401);
        }

        // Validate payload
        try {
            $validated = $request->validate([
                'events' => 'required|array',
                'events.*.timestamp' => 'required|date',
                'events.*.count' => 'required|integer',
                'events.*.location' => 'nullable|array',
                'events.*.type' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Invalid data format', 'errors' => $e->errors()], 422);
        }

        $count = 0;
        foreach ($request->events as $eventData) {
            // Avoid duplicates based on timestamp for this bus
            // This is a simple check, could be optimized with composite keys or bulk inserts
            $exists = TelemetryEvent::where('bus_id', $bus->id)
                ->where('event_timestamp', $eventData['timestamp'])
                ->exists();

            if (!$exists) {
                TelemetryEvent::create([
                    'bus_id' => $bus->id,
                    'event_timestamp' => $eventData['timestamp'],
                    'passenger_count' => $eventData['count'],
                    'latitude' => $eventData['location']['lat'] ?? null,
                    'longitude' => $eventData['location']['lon'] ?? null,
                    'location_source' => 'gps',
                    'event_type' => $eventData['type'] ?? 'boarding',
                    'synced_at' => now(),
                ]);
                $count++;
            }
        }

        // Update last seen
        $bus->update(['last_seen_at' => now()]);

        return response()->json([
            'message' => 'Sync successful',
            'synced_count' => $count
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
