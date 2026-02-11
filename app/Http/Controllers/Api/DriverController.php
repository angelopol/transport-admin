<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * Get drivers with photos for exclusion list.
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

        // Return all active drivers with photos
        $drivers = Driver::where('is_active', true)
            ->whereNotNull('photo_path')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'photo_url' => $driver->photo_url,
                    'updated_at' => $driver->updated_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'count' => $drivers->count(),
            'drivers' => $drivers
        ]);
    }
}
