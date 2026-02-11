<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeviceAuthController extends Controller
{
    /**
     * Register or authenticate a device using its MAC address.
     * This endpoint is PUBLIC (no token required).
     *
     * Always returns the device's api_token so the monitor can use it.
     *
     * Flow:
     * 1. MAC not found → create device, return token + status "registered"
     * 2. Device exists, not linked to bus → return token + status "pending"
     * 3. Device exists, linked to active bus → return token + status "authenticated"
     * 4. Device inactive → return 403
     */
    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mac_address' => 'required|string|regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Formato de MAC inválido',
                'errors' => $validator->errors()
            ], 422);
        }

        $mac = strtolower($request->mac_address);

        // Always ensure a Device record exists
        $device = Device::where('mac_address', $mac)->first();
        $justRegistered = false;

        if (!$device) {
            $device = Device::create([
                'mac_address' => $mac,
                'is_active' => true,
                'last_seen_at' => now(),
            ]);
            $justRegistered = true;
        } else {
            $device->update(['last_seen_at' => now()]);
        }

        // Device is inactive
        if (!$device->is_active) {
            return response()->json([
                'success' => false,
                'status' => 'inactive',
                'message' => 'El dispositivo está inactivo. Contacte al administrador.',
            ], 403);
        }

        // Check if linked to a bus
        $bus = Bus::where('device_mac', $mac)->with(['owner', 'route'])->first();

        // Just registered — return token immediately
        if ($justRegistered) {
            return response()->json([
                'success' => true,
                'status' => 'registered',
                'message' => 'Dispositivo registrado exitosamente.',
                'token' => $device->api_token,
                'device' => [
                    'id' => $device->id,
                    'mac_address' => $device->mac_address,
                ]
            ]);
        }

        // Exists but not linked to any bus
        if (!$bus) {
            return response()->json([
                'success' => true,
                'status' => 'pending',
                'message' => 'Dispositivo registrado. Esperando vinculación con un autobús.',
                'token' => $device->api_token,
                'device' => [
                    'id' => $device->id,
                    'mac_address' => $device->mac_address,
                ]
            ]);
        }

        // Linked to bus but bus is inactive
        if (!$bus->is_active) {
            return response()->json([
                'success' => true,
                'status' => 'inactive',
                'message' => 'El autobús vinculado está inactivo.',
                'token' => $device->api_token,
            ]);
        }

        // Linked to active bus — fully authenticated
        return response()->json([
            'success' => true,
            'status' => 'authenticated',
            'message' => 'Dispositivo autenticado exitosamente.',
            'token' => $device->api_token,
            'device' => [
                'id' => $device->id,
                'mac_address' => $device->mac_address,
                'bus_id' => $bus->id,
                'plate' => $bus->plate,
                'owner' => $bus->owner?->name,
                'route' => $bus->route?->name,
            ]
        ]);
    }
}
