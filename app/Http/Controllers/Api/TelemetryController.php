<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\TelemetryEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TelemetryController extends Controller
{
    /**
     * Sync telemetry events from edge device.
     * 
     * POST /api/v1/sync
     * 
     * Expects:
     * - Header: X-Device-Token (API token of the bus)
     * - Body: { "device_mac": "xx:xx:xx:xx:xx:xx", "events": [...] }
     */
    public function sync(Request $request): JsonResponse
    {
        // Get API token from header
        $token = $request->header('X-Device-Token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'error' => 'Missing X-Device-Token header',
            ], 401);
        }

        // Find bus by token
        $bus = Bus::findByToken($token);

        if (!$bus) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid device token',
            ], 401);
        }

        if (!$bus->is_active) {
            return response()->json([
                'success' => false,
                'error' => 'Device is deactivated',
            ], 403);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'device_mac' => 'required|string',
            'events' => 'required|array',
            'events.*.timestamp' => 'required|string',
            'events.*.passenger_count' => 'required|integer|min:1',
            'events.*.latitude' => 'nullable|numeric',
            'events.*.longitude' => 'nullable|numeric',
            'events.*.location_source' => 'nullable|string|in:gps,serial,ip,none',
            'events.*.face_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'details' => $validator->errors(),
            ], 422);
        }

        // Verify MAC matches
        $deviceMac = strtolower($request->input('device_mac'));
        if (strtolower($bus->device_mac) !== $deviceMac) {
            return response()->json([
                'success' => false,
                'error' => 'Device MAC mismatch',
            ], 403);
        }

        // Process events in batch
        $events = $request->input('events');
        $syncedAt = now();
        $insertedCount = 0;

        foreach ($events as $eventData) {
            try {
                TelemetryEvent::create([
                    'bus_id' => $bus->id,
                    'event_timestamp' => $eventData['timestamp'],
                    'passenger_count' => $eventData['passenger_count'],
                    'latitude' => $eventData['latitude'] ?? null,
                    'longitude' => $eventData['longitude'] ?? null,
                    'location_source' => $eventData['location_source'] ?? 'none',
                    'event_type' => $eventData['event_type'] ?? 'boarding',
                    'face_id' => $eventData['face_id'] ?? null,
                    'synced_at' => $syncedAt,
                ]);
                $insertedCount++;
            } catch (\Exception $e) {
                // Log error but continue processing
                \Log::warning("Failed to insert telemetry event: " . $e->getMessage());
            }
        }

        // Update bus last seen timestamp
        $bus->markAsSeen();

        return response()->json([
            'success' => true,
            'message' => "Synced {$insertedCount} events",
            'synced_count' => $insertedCount,
            'server_time' => $syncedAt->toIso8601String(),
        ]);
    }

    /**
     * Get server status and time.
     * 
     * GET /api/v1/status
     */
    public function status(Request $request): JsonResponse
    {
        $token = $request->header('X-Device-Token');
        $busInfo = null;

        if ($token) {
            $bus = Bus::findByToken($token);
            if ($bus) {
                $busInfo = [
                    'id' => $bus->id,
                    'plate' => $bus->plate,
                    'is_active' => $bus->is_active,
                    'last_seen_at' => $bus->last_seen_at?->toIso8601String(),
                    'today_passengers' => $bus->getTodayPassengerCount(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'server_time' => now()->toIso8601String(),
            'timezone' => config('app.timezone'),
            'bus' => $busInfo,
        ]);
    }

    /**
     * Get telemetry events for a bus (for admins/owners).
     * 
     * GET /api/v1/events/{bus}
     */
    public function events(Request $request, Bus $bus): JsonResponse
    {
        // Check authorization (handled by middleware)
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        $query = $bus->telemetryEvents()
            ->orderBy('event_timestamp', 'desc');

        // Apply date filter if provided
        if ($request->has('date')) {
            $query->whereDate('event_timestamp', $request->input('date'));
        }

        // Limit results
        $limit = min($request->input('limit', 100), 1000);
        $events = $query->limit($limit)->get();

        return response()->json([
            'success' => true,
            'bus_id' => $bus->id,
            'events' => $events,
            'count' => $events->count(),
        ]);
    }
}
