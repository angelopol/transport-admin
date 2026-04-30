<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Collector;
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

        $buses = Bus::with(['owner', 'route', 'drivers', 'collectors', 'mobilePaymentAccount', 'transferAccount'])
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

        // Get devices not currently linked to any bus and owned by the current user
        $availableDevices = \App\Models\Device::whereDoesntHave('bus')
            ->where('is_active', true)
            ->where('owner_id', $user->id)
            ->get(['id', 'mac_address']);

        return Inertia::render('Buses/Create', [
            'routes' => Route::active()->forUser($user)->get(['id', 'name', 'origin', 'destination']),
            'drivers' => Driver::active()->forUser($user)->get(['id', 'name', 'cedula']),
            'collectors' => Collector::active()->forUser($user)->get(['id', 'name', 'cedula']),
            'availableDevices' => $availableDevices,
            'bankAccounts' => \App\Models\BankAccount::forUser($user)->get(['id', 'bank_name', 'account_number', 'phone_number']),
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
            'mobile_payment_account_id' => ['nullable', 'exists:bank_accounts,id'],
            'transfer_account_id' => ['nullable', 'exists:bank_accounts,id'],
            'driver_ids' => ['nullable', 'array'],
            'driver_ids.*' => ['exists:drivers,id'],
            'collector_ids' => ['nullable', 'array'],
            'collector_ids.*' => ['exists:collectors,id'],
        ]);

        $validated['owner_id'] = $request->user()->id; // TODO: Allow Admin to select owner
        $validated['api_token'] = Str::random(64);
        if (!empty($validated['device_mac'])) {
            $validated['device_mac'] = strtolower($validated['device_mac']);
        }

        $busInput = collect($validated)->except(['driver_ids', 'collector_ids'])->toArray();
        $bus = Bus::create($busInput);

        if (isset($validated['driver_ids'])) {
            $bus->drivers()->sync($validated['driver_ids']);
        }
        if (isset($validated['collector_ids'])) {
            $bus->collectors()->sync($validated['collector_ids']);
        }

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

        $bus->load(['owner', 'route', 'drivers', 'collectors', 'mobilePaymentAccount', 'transferAccount']);

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

        // Get available devices (unlinked) + the one currently linked to this bus, restricted to owner
        $availableDevices = \App\Models\Device::where(function ($q) use ($bus) {
            $q->whereDoesntHave('bus');
            if ($bus->device_mac) {
                $q->orWhere('mac_address', $bus->device_mac);
            }
        })->where('is_active', true)
            ->where('owner_id', $user->id)
            ->get(['id', 'mac_address']);

        $bus->load(['drivers:id', 'collectors:id']);

        return Inertia::render('Buses/Edit', [
            'bus' => $bus,
            'routes' => Route::active()->forUser($user)->get(['id', 'name', 'origin', 'destination']),
            'drivers' => Driver::active()->forUser($user)->get(['id', 'name', 'cedula']),
            'collectors' => Collector::active()->forUser($user)->get(['id', 'name', 'cedula']),
            'availableDevices' => $availableDevices,
            'bankAccounts' => \App\Models\BankAccount::forUser($user)->get(['id', 'bank_name', 'account_number', 'phone_number']),
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
            'mobile_payment_account_id' => ['nullable', 'exists:bank_accounts,id'],
            'transfer_account_id' => ['nullable', 'exists:bank_accounts,id'],
            'driver_ids' => ['nullable', 'array'],
            'driver_ids.*' => ['exists:drivers,id'],
            'collector_ids' => ['nullable', 'array'],
            'collector_ids.*' => ['exists:collectors,id'],
            'is_active' => ['boolean'],
        ]);

        if (!empty($validated['device_mac'])) {
            $validated['device_mac'] = strtolower($validated['device_mac']);
        }

        $busInput = collect($validated)->except(['driver_ids', 'collector_ids'])->toArray();
        $bus->update($busInput);

        if (array_key_exists('driver_ids', $validated)) {
            $bus->drivers()->sync($validated['driver_ids'] ?? []);
        }
        if (array_key_exists('collector_ids', $validated)) {
            $bus->collectors()->sync($validated['collector_ids'] ?? []);
        }

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

    /**
     * Display the payment poster for the bus.
     */
    public function paymentPoster(Request $request, Bus $bus): Response
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $bus->load(['route', 'mobilePaymentAccount', 'transferAccount']);

        return Inertia::render('Buses/PaymentPoster', [
            'bus' => $bus,
        ]);
    }

    /**
     * Get connections sessions for the bus.
     */
    public function connections(Request $request, Bus $bus)
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $month = $request->query('month', date('Y-m')); // Format: YYYY-MM
        
        try {
            $startDate = \Carbon\Carbon::parse($month . '-01')->startOfDay();
            $endDate = $startDate->copy()->endOfMonth()->endOfDay();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid month format'], 400);
        }

        // Fetch timestamps
        $events = $bus->telemetryEvents()
            ->whereBetween('event_timestamp', [$startDate, $endDate])
            ->orderBy('event_timestamp', 'asc')
            ->pluck('event_timestamp');

        $sessionsByDay = [];
        $currentSession = null;

        foreach ($events as $timestamp) {
            $dateStr = $timestamp->format('Y-m-d');
            
            if (!isset($sessionsByDay[$dateStr])) {
                $sessionsByDay[$dateStr] = [];
            }

            if ($currentSession === null) {
                $currentSession = [
                    'start' => $timestamp,
                    'end' => $timestamp,
                    'date' => $dateStr
                ];
            } else {
                $diffInMinutes = $currentSession['end']->diffInMinutes($timestamp);
                
                if ($diffInMinutes > 60 || $currentSession['date'] !== $dateStr) {
                    // Close previous session
                    $sessionsByDay[$currentSession['date']][] = [
                        'start' => $currentSession['start']->format('H:i:s'),
                        'end' => $currentSession['end']->format('H:i:s'),
                    ];
                    
                    // Start new
                    $currentSession = [
                        'start' => $timestamp,
                        'end' => $timestamp,
                        'date' => $dateStr
                    ];
                } else {
                    $currentSession['end'] = $timestamp;
                }
            }
        }

        if ($currentSession !== null) {
            $sessionsByDay[$currentSession['date']][] = [
                'start' => $currentSession['start']->format('H:i:s'),
                'end' => $currentSession['end']->format('H:i:s'),
            ];
        }

        return response()->json($sessionsByDay);
    }

    /**
     * Get inferred stops for a bus on a given date.
     * A "stop" is a cluster of boarding events within 1 min and ~100 m of each other.
     */
    public function stops(Request $request, Bus $bus)
    {
        $user = $request->user();

        if (!$user->isAdmin() && $bus->owner_id !== $user->id) {
            abort(403);
        }

        $date = $request->query('date', date('Y-m-d'));

        $events = $bus->telemetryEvents()
            ->whereDate('event_timestamp', $date)
            ->where('passenger_count', '>', 0)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('event_timestamp', 'asc')
            ->get(['event_timestamp', 'passenger_count', 'latitude', 'longitude']);

        $stops = [];
        $current = null;

        foreach ($events as $event) {
            $lat = (float) $event->latitude;
            $lon = (float) $event->longitude;

            if ($current === null) {
                $current = [
                    'first_time'  => $event->event_timestamp,
                    'last_time'   => $event->event_timestamp,
                    'lat_sum'     => $lat,
                    'lon_sum'     => $lon,
                    'n'           => 1,
                    'passengers'  => $event->passenger_count,
                ];
            } else {
                $avgLat   = $current['lat_sum'] / $current['n'];
                $avgLon   = $current['lon_sum'] / $current['n'];
                $timeDiff = $current['last_time']->diffInSeconds($event->event_timestamp);

                // ~0.001 deg ≈ 111 m
                $nearLat = abs($avgLat - $lat) < 0.001;
                $nearLon = abs($avgLon - $lon) < 0.001;
                $sameWindow = $timeDiff <= 60;

                if ($nearLat && $nearLon && $sameWindow) {
                    $current['lat_sum']    += $lat;
                    $current['lon_sum']    += $lon;
                    $current['n']++;
                    $current['passengers'] += $event->passenger_count;
                    $current['last_time']  = $event->event_timestamp;
                } else {
                    $stops[] = [
                        'time'       => $current['first_time']->format('H:i'),
                        'lat'        => round($current['lat_sum'] / $current['n'], 6),
                        'lon'        => round($current['lon_sum'] / $current['n'], 6),
                        'passengers' => $current['passengers'],
                    ];
                    $current = [
                        'first_time' => $event->event_timestamp,
                        'last_time'  => $event->event_timestamp,
                        'lat_sum'    => $lat,
                        'lon_sum'    => $lon,
                        'n'          => 1,
                        'passengers' => $event->passenger_count,
                    ];
                }
            }
        }

        if ($current !== null) {
            $stops[] = [
                'time'       => $current['first_time']->format('H:i'),
                'lat'        => round($current['lat_sum'] / $current['n'], 6),
                'lon'        => round($current['lon_sum'] / $current['n'], 6),
                'passengers' => $current['passengers'],
            ];
        }

        return response()->json([
            'date'        => $date,
            'total_stops' => count($stops),
            'stops'       => $stops,
        ]);
    }
}
