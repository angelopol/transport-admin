<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BusController extends Controller
{
    /**
     * Display a listing of buses.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $buses = Bus::with(['owner', 'route', 'driver'])
            ->forUser($user)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Buses/Index', [
            'buses' => $buses,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Show the form for creating a new bus.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Get devices not currently linked to any bus
        $availableDevices = \App\Models\Device::whereDoesntHave('bus')
            ->where('is_active', true)
            ->get(['id', 'mac_address']);

        return Inertia::render('Buses/Create', [
            'routes' => Route::active()->forUser($user)->get(['id', 'name', 'origin', 'destination']),
            'drivers' => Driver::active()->forUser($user)->get(['id', 'name', 'cedula']),
            'availableDevices' => $availableDevices,
        ]);
    }

    /**
     * Store a newly created bus.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'device_mac' => ['nullable', 'string', 'max:17', 'unique:buses,device_mac'],
            'plate' => ['required', 'string', 'max:10', 'unique:buses,plate'],
            'model' => ['nullable', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'route_id' => ['nullable', 'exists:routes,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
        ]);

        $validated['owner_id'] = $request->user()->id; // TODO: Allow Admin to select owner
        $validated['api_token'] = Str::random(64);
        if (!empty($validated['device_mac'])) {
            $validated['device_mac'] = strtolower($validated['device_mac']);
        }

        $bus = Bus::create($validated);

        return redirect()->route('buses.show', $bus)
            ->with('success', 'Unidad registrada exitosamente.');
    }

    /**
     * Display the specified bus.
     */
    public function show(Request $request, Bus $bus): Response
    {
        $user = $request->user();

        // Authorization
        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $bus->load(['owner', 'route', 'driver']);

        // Get recent events
        $recentEvents = $bus->telemetryEvents()
            ->orderBy('event_timestamp', 'desc')
            ->limit(50)
            ->get();

        // Today's stats
        $todayStats = [
            'passengers' => $bus->getTodayPassengerCount(),
            'revenue' => $bus->route ? $bus->getTodayPassengerCount() * $bus->route->fare : 0,
        ];

        return Inertia::render('Buses/Show', [
            'bus' => $bus,
            'recentEvents' => $recentEvents,
            'todayStats' => $todayStats,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Show the form for editing the bus.
     */
    public function edit(Request $request, Bus $bus): Response
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        // Get available devices (unlinked) + the one currently linked to this bus
        $availableDevices = \App\Models\Device::where(function ($q) use ($bus) {
            $q->whereDoesntHave('bus');
            if ($bus->device_mac) {
                $q->orWhere('mac_address', $bus->device_mac);
            }
        })->where('is_active', true)->get(['id', 'mac_address']);

        return Inertia::render('Buses/Edit', [
            'bus' => $bus,
            'routes' => Route::active()->forUser($user)->get(['id', 'name', 'origin', 'destination']),
            'drivers' => Driver::active()->forUser($user)->get(['id', 'name', 'cedula']),
            'availableDevices' => $availableDevices,
        ]);
    }

    /**
     * Update the specified bus.
     */
    public function update(Request $request, Bus $bus): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'device_mac' => ['nullable', 'string', 'max:17', Rule::unique('buses')->ignore($bus->id)],
            'plate' => ['required', 'string', 'max:10', Rule::unique('buses')->ignore($bus->id)],
            'model' => ['nullable', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'route_id' => ['nullable', 'exists:routes,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($validated['device_mac'])) {
            $validated['device_mac'] = strtolower($validated['device_mac']);
        }

        $bus->update($validated);

        return redirect()->route('buses.show', $bus)
            ->with('success', 'Unidad actualizada exitosamente.');
    }

    /**
     * Remove the specified bus.
     */
    public function destroy(Request $request, Bus $bus): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $bus->delete();

        return redirect()->route('buses.index')
            ->with('success', 'Unidad eliminada exitosamente.');
    }

    /**
     * Regenerate API token for the bus.
     */
    public function regenerateToken(Request $request, Bus $bus): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $bus->regenerateToken();

        return redirect()->route('buses.show', $bus)
            ->with('success', 'Token regenerado exitosamente.');
    }
}
