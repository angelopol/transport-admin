<?php

namespace App\Http\Controllers;

use App\Models\ManualRevenueEntry;
use App\Models\Route;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Collector;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ManualRevenueEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $entries = ManualRevenueEntry::with(['route', 'bus'])
            ->forUser($user)
            ->when($user->isOperative(), function ($query) {
                $query->whereDate('registered_at', Carbon::today());
            })
            ->orderBy('registered_at', 'desc')
            ->paginate(15);

        return Inertia::render('ManualEntries/Index', [
            'entries' => $entries,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        $buses = collect();
        if ($user->isOperative()) {
            $driver = Driver::with('buses.route')->where('user_id', $user->id)->first();
            $collector = Collector::with('buses.route')->where('user_id', $user->id)->first();

            if ($driver) {
                $buses = $buses->merge($driver->buses);
            }
            if ($collector) {
                $buses = $buses->merge($collector->buses);
            }
            $buses = $buses->unique('id')->values();
        } else {
            $buses = Bus::active()->forUser($user)->with('route')->get();
        }

        return Inertia::render('ManualEntries/Create', [
            'buses' => $buses,
            'isOperative' => $user->isOperative(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'bus_id' => ['required', 'exists:buses,id'],
            'user_type' => ['required', 'in:general,student,senior,disabled'],
            'payment_method' => ['required', 'in:cash,digital'],
            'registered_at' => ['nullable', 'date'],
            'reference_number' => ['required_if:payment_method,digital', 'nullable', 'string', 'max:100'],
            'identification' => ['nullable', 'string', 'max:20'],
            'phone_or_account' => ['nullable', 'string', 'max:50'],
            'reference_image' => ['nullable', 'image', 'max:5120'],
        ];

        if ($request->user()->isOperative()) {
            $rules['reference_image'] = ['required_if:payment_method,digital', 'image', 'max:5120'];
        }

        $validated = $request->validate($rules);

        $bus = Bus::with('route')->findOrFail($validated['bus_id']);
        $route = $bus->route;

        if (!$route) {
            abort(400, 'El autobús seleccionado no tiene una ruta asignada. Por favor, asigne una ruta al autobús primero.');
        }

        $validated['route_id'] = $route->id;

        $user = $request->user();

        if ($user->isOperative()) {
            $validated['payment_method'] = 'digital';

            // Verify operative has access to this bus
            $buses = collect();
            $driver = \App\Models\Driver::with('buses')->where('user_id', $user->id)->first();
            $collector = \App\Models\Collector::with('buses')->where('user_id', $user->id)->first();

            if ($driver) {
                $buses = $buses->merge($driver->buses);
            }
            if ($collector) {
                $buses = $buses->merge($collector->buses);
            }

            if (!$buses->contains('id', $bus->id)) {
                abort(403, 'No tienes permiso para registrar pasajes en esta unidad.');
            }
        }

        $date = $validated['registered_at'] ? Carbon::parse($validated['registered_at']) : now();

        // Calculate amount
        $routeType = $request->input('route_type', 'suburban');
        $isUrban = $route->is_suburban && $routeType === 'urban';
        $activeFare = $isUrban ? ($route->fare_urban ?? $route->fare) : $route->fare;

        $baseFare = ($date->isSunday() && $route->fare_sunday > 0) ? $route->fare_sunday : $activeFare;
        $amount = $baseFare;

        if ($validated['user_type'] === 'student') {
            if ($route->is_student_percentage) {
                $discount = $route->fare_student ?? 0;
                $amount = $baseFare - ($baseFare * ($discount / 100));
            } else {
                $amount = $route->fare_student > 0 ? $route->fare_student : $baseFare;
            }
        } elseif ($validated['user_type'] === 'senior') {
            if ($route->is_senior_percentage) {
                $discount = $route->fare_senior ?? 0;
                $amount = $baseFare - ($baseFare * ($discount / 100));
            } else {
                $amount = $route->fare_senior > 0 ? $route->fare_senior : $baseFare;
            }
        } elseif ($validated['user_type'] === 'disabled') {
            if ($route->is_disabled_percentage) {
                $discount = $route->fare_disabled ?? 0;
                $amount = $baseFare - ($baseFare * ($discount / 100));
            } else {
                $amount = $route->fare_disabled > 0 ? $route->fare_disabled : $baseFare;
            }
        }

        $amount = max(0, $amount);

        $imagePath = null;
        if ($request->hasFile('reference_image')) {
            $imagePath = $request->file('reference_image')->store('reference_images', 'public');
        }

        ManualRevenueEntry::create([
            'owner_id' => $bus->owner_id, // Tie to the owner of the bus
            'user_id' => $user->id,       // The user who registered it
            'route_id' => $validated['route_id'],
            'bus_id' => $validated['bus_id'],
            'amount' => $amount,
            'user_type' => $validated['user_type'],
            'payment_method' => $validated['payment_method'],
            'registered_at' => $date,
            'reference_number' => $validated['reference_number'] ?? null,
            'identification' => $validated['identification'] ?? null,
            'phone_or_account' => $validated['phone_or_account'] ?? null,
            'reference_image_path' => $imagePath,
        ]);

        return redirect()->route('manual-entries.index')
            ->with('success', 'Ingreso registrado exitosamente. Monto: ' . number_format($amount, 2));
    }
}
