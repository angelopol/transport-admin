<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RouteController extends Controller
{
    /**
     * Display a listing of routes.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $routes = Route::with(['buses:id,plate,route_id'])
            ->withCount('buses')
            ->forUser($user)
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Routes/Index', [
            'routes' => $routes,
        ]);
    }

    /**
     * Show the form for creating a new route.
     */
    public function create(): Response
    {
        return Inertia::render('Routes/Create');
    }

    /**
     * Store a newly created route.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100'],
            'is_suburban' => ['boolean'],
            'fare' => ['required', 'numeric', 'min:0'],
            'fare_urban' => ['nullable', 'numeric', 'min:0'],
            'fare_student' => ['nullable', 'numeric', 'min:0'],
            'fare_senior' => ['nullable', 'numeric', 'min:0'],
            'fare_disabled' => ['nullable', 'numeric', 'min:0'],
            'fare_sunday' => ['nullable', 'numeric', 'min:0'],
            'is_student_percentage' => ['boolean'],
            'is_senior_percentage' => ['boolean'],
            'is_disabled_percentage' => ['boolean'],
            'official_gazette' => ['nullable', 'image', 'max:2048'],
        ]);

        $validated['owner_id'] = $request->user()->id;

        $fareFields = ['fare_urban', 'fare_student', 'fare_senior', 'fare_disabled', 'fare_sunday'];
        foreach ($fareFields as $field) {
            $validated[$field] = $validated[$field] ?? 0;
        }

        if ($request->hasFile('official_gazette')) {
            $validated['official_gazette_path'] = $request->file('official_gazette')->store('gazettes', 'public');
        }

        Route::create($validated);

        return redirect()->route('routes.index')
            ->with('success', 'Ruta creada exitosamente.');
    }

    /**
     * Show the form for editing the route.
     */
    public function edit(Request $request, Route $route): Response
    {
        $user = $request->user();
        if (!$user->isAdmin() && $route->owner_id !== $user->id) {
            abort(403);
        }

        return Inertia::render('Routes/Edit', [
            'route' => $route,
        ]);
    }

    /**
     * Update the specified route.
     */
    public function update(Request $request, Route $route): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $route->owner_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100'],
            'is_suburban' => ['boolean'],
            'fare' => ['required', 'numeric', 'min:0'],
            'fare_urban' => ['nullable', 'numeric', 'min:0'],
            'fare_student' => ['nullable', 'numeric', 'min:0'],
            'fare_senior' => ['nullable', 'numeric', 'min:0'],
            'fare_disabled' => ['nullable', 'numeric', 'min:0'],
            'fare_sunday' => ['nullable', 'numeric', 'min:0'],
            'is_student_percentage' => ['boolean'],
            'is_senior_percentage' => ['boolean'],
            'is_disabled_percentage' => ['boolean'],
            'is_active' => ['boolean'],
            'official_gazette' => ['nullable', 'image', 'max:2048'],
        ]);

        $fareFields = ['fare_urban', 'fare_student', 'fare_senior', 'fare_disabled', 'fare_sunday'];
        foreach ($fareFields as $field) {
            $validated[$field] = $validated[$field] ?? 0;
        }

        if ($request->hasFile('official_gazette')) {
            if ($route->official_gazette_path) {
                Storage::disk('public')->delete($route->official_gazette_path);
            }
            $validated['official_gazette_path'] = $request->file('official_gazette')->store('gazettes', 'public');
        }

        $route->update($validated);

        return redirect()->route('routes.index')
            ->with('success', 'Ruta actualizada exitosamente.');
    }

    /**
     * Remove the specified route.
     */
    public function destroy(Request $request, Route $route): RedirectResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $route->owner_id !== $user->id) {
            abort(403);
        }

        $route->delete();

        return redirect()->route('routes.index')
            ->with('success', 'Ruta eliminada exitosamente.');
    }
}
