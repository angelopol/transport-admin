<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Device;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    /**
     * Display all devices, showing linked bus info.
     */
    public function index(Request $request): Response
    {
        $filter = $request->get('filter', 'all');

        $query = Device::orderBy('created_at', 'desc');

        if ($filter === 'pending') {
            // Devices NOT linked to any bus
            $query->whereDoesntHave('bus');
        } elseif ($filter === 'linked') {
            // Devices linked to a bus
            $query->whereHas('bus');
        }

        $devices = $query->paginate(20);

        // Manually append bus info for each device
        $devices->getCollection()->transform(function ($device) {
            $bus = Bus::where('device_mac', $device->mac_address)->with(['owner', 'route'])->first();
            $device->linked_bus = $bus;
            return $device;
        });

        // Stats
        $totalDevices = Device::count();
        $linkedCount = Device::whereHas('bus')->count();

        $stats = [
            'total' => $totalDevices,
            'pending' => $totalDevices - $linkedCount,
            'linked' => $linkedCount,
        ];

        return Inertia::render('Devices/Index', [
            'devices' => $devices,
            'stats' => $stats,
            'currentFilter' => $filter,
        ]);
    }

    /**
     * Toggle device active status.
     */
    public function toggleStatus(Device $device): RedirectResponse
    {
        $device->update(['is_active' => !$device->is_active]);

        $status = $device->is_active ? 'activado' : 'desactivado';
        return redirect()->route('devices.index')
            ->with('success', "Dispositivo {$status}.");
    }

    /**
     * Remove a device.
     */
    public function destroy(Device $device): RedirectResponse
    {
        // Also unlink from any bus
        Bus::where('device_mac', $device->mac_address)->update(['device_mac' => null]);

        $device->delete();

        return redirect()->route('devices.index')
            ->with('success', 'Dispositivo eliminado.');
    }
}
