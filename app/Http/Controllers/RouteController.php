<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RouteController extends Controller
{
    /**
     * Display a listing of routes.
     */
    public function index(Request $request): Response
    {
        $routes = Route::withCount('buses')
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
            'fare' => ['required', 'numeric', 'min:0'],
        ]);

        Route::create($validated);

        return redirect()->route('routes.index')
            ->with('success', 'Ruta creada exitosamente.');
    }

    /**
     * Show the form for editing the route.
     */
    public function edit(Route $route): Response
    {
        return Inertia::render('Routes/Edit', [
            'route' => $route,
        ]);
    }

    /**
     * Update the specified route.
     */
    public function update(Request $request, Route $route): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100'],
            'fare' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $route->update($validated);

        return redirect()->route('routes.index')
            ->with('success', 'Ruta actualizada exitosamente.');
    }

    /**
     * Remove the specified route.
     */
    public function destroy(Route $route): RedirectResponse
    {
        $route->delete();

        return redirect()->route('routes.index')
            ->with('success', 'Ruta eliminada exitosamente.');
    }
}
