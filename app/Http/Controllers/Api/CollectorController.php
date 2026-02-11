<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Collector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectorController extends Controller
{
    /**
     * Get collectors with photos for exclusion list.
     */
    public function getExcludedFaces(Request $request): JsonResponse
    {
        // Simple Bearer Token Auth for Devices
        $token = $request->bearerToken();

        if (!$token) {
            // Fallback to header
            $token = $request->header('X-Device-Token');
        }

        if (!$token) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        $device = Device::where('api_token', $token)->first();

        if (!$device) {
            return response()->json(['message' => 'Unauthorized Device'], 401);
        }

        // Return all active collectors with photos
        $collectors = Collector::where('is_active', true)
            ->whereNotNull('photo_path')
            ->get()
            ->map(function ($collector) {
                return [
                    'id' => $collector->id,
                    'name' => $collector->name,
                    'photo_url' => $collector->photo_url,
                    'updated_at' => $collector->updated_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'count' => $collectors->count(),
            'collectors' => $collectors
        ]);
    }
}
