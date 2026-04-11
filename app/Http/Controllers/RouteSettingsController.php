<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\Route;

class RouteSettingsController extends Controller
{
    /**
     * Guarda los valores por defecto del precio de rutas para el dueño activo.
     */
    public function saveDefaults(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'default_route_fare' => ['nullable', 'numeric', 'min:0'],
            'default_route_fare_urban' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();
        
        if (!$user->isOwner() && !$user->isAdmin()) {
            abort(403);
        }

        $user->update($validated);

        return back()->with('success', 'Configuraciones de rutas predeterminadas actualizadas con éxito.');
    }

    /**
     * Actualiza masivamente el precio de determinadas rutas del dueño activo.
     */
    public function bulkUpdateFares(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isOwner() && !$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'fare' => ['required', 'numeric', 'min:0'],
            'fare_urban' => ['nullable', 'numeric', 'min:0'],
            'route_ids' => ['required', 'array', 'min:1'],
            'route_ids.*' => ['integer', 'exists:routes,id'],
        ]);

        // Verificar que las rutas pertenezcan al dueño actual (si no es admin global)
        $routesQuery = Route::whereIn('id', $validated['route_ids']);
        if (!$user->isAdmin()) {
            $routesQuery->where('owner_id', $user->id);
        }

        $routesToUpdate = $routesQuery->get();

        foreach ($routesToUpdate as $route) {
            $route->update([
                'fare' => $validated['fare'],
                'fare_urban' => $route->is_suburban ? ($validated['fare_urban'] ?? $route->fare_urban) : null,
            ]);
        }

        return back()->with('success', count($routesToUpdate) . ' rutas han sido actualizadas exitosamente con los nuevos precios masivos.');
    }
}
