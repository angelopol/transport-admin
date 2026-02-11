<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    /**
     * Display a listing of drivers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $drivers = Driver::withCount('buses')
            ->forUser($user)
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
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'], // 5MB
        ]);

        $validated['owner_id'] = $request->user()->id;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('drivers', 'public');
            $validated['photo_path'] = $path;
        }

        Driver::create($validated);

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor registrado exitosamente.');
    }

    /**
     * Show the form for editing the driver.
     */
    public function edit(Request $request, Driver $driver): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && $driver->owner_id !== $user->id) {
            abort(403);
        }

        return Inertia::render('Drivers/Edit', [
            'driver' => $driver,
        ]);
    }

    /**
     * Update the specified driver.
     */
    public function update(Request $request, Driver $driver): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $driver->owner_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'cedula' => ['required', 'string', 'max:20', Rule::unique('drivers')->ignore($driver->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            if ($driver->photo_path) {
                Storage::disk('public')->delete($driver->photo_path);
            }
            $path = $request->file('photo')->store('drivers', 'public');
            $validated['photo_path'] = $path;
        }

        $driver->update($validated);

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor actualizado exitosamente.');
    }

    /**
     * Remove the specified driver.
     */
    public function destroy(Request $request, Driver $driver): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $driver->owner_id !== $user->id) {
            abort(403);
        }

        if ($driver->photo_path) {
            Storage::disk('public')->delete($driver->photo_path);
        }
        $driver->delete();

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor eliminado exitosamente.');
    }
}
