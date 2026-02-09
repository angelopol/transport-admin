<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user has the 'admin' role.
     * Owners and other roles will receive a 403 Forbidden response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Acceso denegado. Se requieren permisos de administrador.',
                ], 403);
            }

            abort(403, 'Acceso denegado. Se requieren permisos de administrador.');
        }

        return $next($request);
    }
}
