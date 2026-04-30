<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DriverController extends Controller
{
    /**
     * Display a listing of drivers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $drivers = Driver::with(['buses:id,plate'])
            ->withCount('buses')
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
            'cedula' => ['required', 'string', new \App\Rules\VenezuelanDocument, 'unique:drivers,cedula'],
            'phone' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'], // 5MB
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'cedula.regex' => 'El formato de la Cédula o RIF es inválido. Ejemplos válidos: V-12345678, J-12345678-9, V12345678.',
            'phone.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        $validated['owner_id'] = $request->user()->id;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('drivers', 'public');
            $validated['photo_path'] = $path;
        }

        DB::transaction(function () use ($validated, $request) {
            $userId = null;
            if (!empty($validated['email']) && !empty($validated['password'])) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'operative',
                    'phone' => $validated['phone'],
                ]);
                $userId = $user->id;
            }
            $validated['user_id'] = $userId;
            unset($validated['email'], $validated['password']);

            Driver::create($validated);
        });

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

        $driver->load('user');

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
            'cedula' => ['required', 'string', new \App\Rules\VenezuelanDocument, Rule::unique('drivers')->ignore($driver->id)],
            'phone' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($driver->user_id)],
            'password' => ['nullable', 'string', 'min:8'],
        ], [
            'cedula.regex' => 'El formato de la Cédula o RIF es inválido. Ejemplos válidos: V-12345678, J-12345678-9, V12345678.',
            'phone.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        if ($request->hasFile('photo')) {
            if ($driver->photo_path) {
                Storage::disk('public')->delete($driver->photo_path);
            }
            $path = $request->file('photo')->store('drivers', 'public');
            $validated['photo_path'] = $path;
        }

        DB::transaction(function () use ($validated, $driver) {
            $userId = $driver->user_id;

            if ($driver->user_id) {
                // Update existing user
                $updateData = [
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                ];
                if (!empty($validated['email'])) {
                    $updateData['email'] = $validated['email'];
                }
                if (!empty($validated['password'])) {
                    $updateData['password'] = Hash::make($validated['password']);
                }
                User::where('id', $driver->user_id)->update($updateData);
            } else if (!empty($validated['email']) && !empty($validated['password'])) {
                // Create new user
                $newUser = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'operative',
                    'phone' => $validated['phone'],
                ]);
                $userId = $newUser->id;
            }

            $validated['user_id'] = $userId;
            unset($validated['email'], $validated['password']);

            $driver->update($validated);
        });

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

        DB::transaction(function () use ($driver) {
            $userId = $driver->user_id;
            $driver->delete();
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('drivers.index')
            ->with('success', 'Conductor eliminado exitosamente.');
    }
}
