<?php

namespace App\Http\Controllers;

use App\Models\Collector;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class CollectorController extends Controller
{
    /**
     * Display a listing of collectors.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $collectors = Collector::forUser($user)
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
            'cedula' => ['required', 'string', 'max:20', 'unique:collectors,cedula'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'], // 5MB
        ]);

        $validated['owner_id'] = $request->user()->id;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('collectors', 'public');
            $validated['photo_path'] = $path;
        }

        Collector::create($validated);

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
            'cedula' => ['required', 'string', 'max:20', Rule::unique('collectors')->ignore($collector->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            if ($collector->photo_path) {
                Storage::disk('public')->delete($collector->photo_path);
            }
            $path = $request->file('photo')->store('collectors', 'public');
            $validated['photo_path'] = $path;
        }

        $collector->update($validated);

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
        $collector->delete();

        return redirect()->route('collectors.index')
            ->with('success', 'Colector eliminado exitosamente.');
    }
}
