<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    /**
     * Display a listing of drivers.
     */
    public function index(Request $request): Response
    {
        $drivers = Driver::withCount('buses')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Drivers/Index', [
            'drivers' => $drivers,
        ]);
    }

    /**
     * Show the form for creating a new driver.
     */
    public function create(): Response
    {
        return Inertia::render('Drivers/Create');
    }

    /**
     * Store a newly created driver.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'cedula' => ['required', 'string', 'max:20', 'unique:drivers,cedula'],
            'phone' => ['nullable', 'string', 'max:20'],
            'license_number' => ['nullable', 'string', 'max:50'],
        ]);

        Driver::create($validated);

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor registrado exitosamente.');
    }

    /**
     * Show the form for editing the driver.
     */
    public function edit(Driver $driver): Response
    {
        return Inertia::render('Drivers/Edit', [
            'driver' => $driver,
        ]);
    }

    /**
     * Update the specified driver.
     */
    public function update(Request $request, Driver $driver): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'cedula' => ['required', 'string', 'max:20', Rule::unique('drivers')->ignore($driver->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $driver->update($validated);

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor actualizado exitosamente.');
    }

    /**
     * Remove the specified driver.
     */
    public function destroy(Driver $driver): RedirectResponse
    {
        $driver->delete();

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor eliminado exitosamente.');
    }
}
