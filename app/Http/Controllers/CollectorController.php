<?php

namespace App\Http\Controllers;

use App\Models\Collector;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CollectorController extends Controller
{
    /**
     * Display a listing of collectors.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $collectors = Collector::with(['buses:id,plate'])
            ->forUser($user)
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Collectors/Index', [
            'collectors' => $collectors,
        ]);
    }

    /**
     * Show the form for creating a new collector.
     */
    public function create(): Response
    {
        return Inertia::render('Collectors/Create');
    }

    /**
     * Store a newly created collector.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'cedula' => ['required', 'string', new \App\Rules\VenezuelanDocument, 'unique:collectors,cedula'],
            'phone' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
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
            $path = $request->file('photo')->store('collectors', 'public');
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

            Collector::create($validated);
        });

        return redirect()->route('collectors.index')
            ->with('success', 'Colector registrado exitosamente.');
    }

    /**
     * Show the form for editing the collector.
     */
    public function edit(Request $request, Collector $collector): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && $collector->owner_id !== $user->id) {
            abort(403);
        }

        $collector->load('user');

        return Inertia::render('Collectors/Edit', [
            'collector' => $collector,
        ]);
    }

    /**
     * Update the specified collector.
     */
    public function update(Request $request, Collector $collector): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $collector->owner_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'cedula' => ['required', 'string', new \App\Rules\VenezuelanDocument, Rule::unique('collectors')->ignore($collector->id)],
            'phone' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($collector->user_id)],
            'password' => ['nullable', 'string', 'min:8'],
        ], [
            'cedula.regex' => 'El formato de la Cédula o RIF es inválido. Ejemplos válidos: V-12345678, J-12345678-9, V12345678.',
            'phone.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        if ($request->hasFile('photo')) {
            if ($collector->photo_path) {
                Storage::disk('public')->delete($collector->photo_path);
            }
            $path = $request->file('photo')->store('collectors', 'public');
            $validated['photo_path'] = $path;
        }

        DB::transaction(function () use ($validated, $collector) {
            $userId = $collector->user_id;

            if ($collector->user_id) {
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
                User::where('id', $collector->user_id)->update($updateData);
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

            $collector->update($validated);
        });

        return redirect()->route('collectors.index')
            ->with('success', 'Colector actualizado exitosamente.');
    }

    /**
     * Remove the specified collector.
     */
    public function destroy(Request $request, Collector $collector): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $collector->owner_id !== $user->id) {
            abort(403);
        }

        if ($collector->photo_path) {
            Storage::disk('public')->delete($collector->photo_path);
        }

        DB::transaction(function () use ($collector) {
            $userId = $collector->user_id;
            $collector->delete();
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        });

        return redirect()->route('collectors.index')
            ->with('success', 'Colector eliminado exitosamente.');
    }
}
