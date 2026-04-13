<?php

namespace App\Http\Middleware;

use App\Helpers\AuditLogger;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class AuditMutatingRequests
{
    /**
     * Friendly labels for auditable resources.
     *
     * @var array<string, string>
     */
    private array $resourceLabels = [
        'buses' => 'Autobús',
        'bank-accounts' => 'Cuenta bancaria',
        'routes' => 'Ruta',
        'drivers' => 'Conductor',
        'collectors' => 'Colector',
        'manual-entries' => 'Ingreso manual',
        'users' => 'Usuario',
        'devices' => 'Dispositivo',
        'profile' => 'Perfil',
        'ocr' => 'Referencia OCR',
        'maps' => 'Mapa',
        'advanced-reports' => 'Reporte avanzado',
        'reports' => 'Reporte',
        'audit-logs' => 'Bitácora de auditoría',
    ];

    /**
     * Capture authenticated write operations for the audit log.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$request->user()) {
            return $response;
        }

        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $response;
        }

        if ($response->getStatusCode() >= 400) {
            return $response;
        }

        $route = $request->route();
        $routeName = $route?->getName() ?? $request->path();

        AuditLogger::log($this->buildActionLabel($request, $routeName), [
            'method' => $request->method(),
            'route' => $routeName,
            'path' => $request->path(),
            'payload' => $this->sanitizePayload($request),
        ]);

        return $response;
    }

    private function buildActionLabel(Request $request, string $routeName): string
    {
        $parts = collect(explode('.', $routeName))
            ->filter()
            ->values();

        $resourceKey = $this->resolveResourceKey($parts, $request);
        $resourceLabel = $this->resourceLabels[$resourceKey] ?? $this->humanizeResource($resourceKey);
        $operation = $this->resolveOperation($parts, $request);

        return match ($operation) {
            'store' => "{$resourceLabel} creado",
            'update' => "{$resourceLabel} actualizado",
            'destroy' => "{$resourceLabel} eliminado",
            'toggle' => "{$resourceLabel} estado actualizado",
            'logout-sessions' => "Sesiones de {$resourceLabel} cerradas",
            'regenerate-token' => "Token de {$resourceLabel} regenerado",
            'extract-reference' => 'Referencia OCR extraída',
            'bulk' => "Actualización masiva de {$resourceLabel}",
            'defaults' => "Configuración predeterminada de {$resourceLabel} actualizada",
            default => $this->fallbackActionLabel($request, $resourceLabel),
        };
    }

    /**
     * @param Collection<int, string> $parts
     */
    private function resolveResourceKey(Collection $parts, Request $request): string
    {
        $firstPart = $parts->first();

        if (is_string($firstPart) && array_key_exists($firstPart, $this->resourceLabels)) {
            return $firstPart;
        }

        return str($request->path())
            ->before('/')
            ->replace(['-', '_'], ' ')
            ->replace(' ', '-')
            ->toString();
    }

    /**
     * @param Collection<int, string> $parts
     */
    private function resolveOperation(Collection $parts, Request $request): string
    {
        $lastPart = $parts->last();

        if (is_string($lastPart) && $lastPart !== $parts->first()) {
            return $lastPart;
        }

        return match ($request->method()) {
            'POST' => 'store',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'destroy',
            default => strtolower($request->method()),
        };
    }

    private function humanizeResource(string $resourceKey): string
    {
        return str($resourceKey)
            ->replace(['-', '_'], ' ')
            ->lower()
            ->ucfirst()
            ->toString();
    }

    private function fallbackActionLabel(Request $request, string $resourceLabel): string
    {
        return match ($request->method()) {
            'POST' => "Acción registrada en {$resourceLabel}",
            'PUT', 'PATCH' => "{$resourceLabel} actualizado",
            'DELETE' => "{$resourceLabel} eliminado",
            default => "{$resourceLabel} modificado",
        };
    }

    private function sanitizePayload(Request $request): array
    {
        $payload = $request->except([
            '_token',
            '_method',
            'password',
            'password_confirmation',
            'current_password',
        ]);

        foreach ($request->allFiles() as $key => $file) {
            $payload[$key] = is_array($file)
                ? array_map(fn ($item) => $item?->getClientOriginalName(), $file)
                : $file?->getClientOriginalName();
        }

        return $payload;
    }
}
