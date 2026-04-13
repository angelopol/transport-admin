<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Device;
use App\Models\ManualRevenueEntry;
use App\Models\TelemetryEvent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class HealthController extends Controller
{
    public function publicStatus(): JsonResponse
    {
        $health = $this->buildHealthSnapshot(false);

        return response()->json(
            $health,
            $health['status'] === 'unhealthy' ? 503 : 200
        );
    }

    public function adminIndex(Request $request): Response
    {
        return Inertia::render('Admin/Health/Index', [
            'health' => $this->buildHealthSnapshot(true),
            'generatedAt' => now()->toIso8601String(),
            'viewer' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
            ],
        ]);
    }

    private function buildHealthSnapshot(bool $detailed): array
    {
        $checks = [
            $this->checkApplication(),
            $this->checkDatabase(),
            $this->checkCache(),
            $this->checkStorage(),
            $this->checkTelemetryFlow(),
        ];

        $status = $this->resolveOverallStatus($checks);

        $deviceMetrics = $this->deviceMetrics();
        $busMetrics = $this->busMetrics();

        $payload = [
            'status' => $status,
            'app' => [
                'name' => config('app.name', 'SIMCI-TU'),
                'env' => app()->environment(),
                'url' => config('app.url'),
                'timezone' => config('app.timezone'),
                'timestamp' => now()->toIso8601String(),
            ],
            'checks' => $checks,
            'metrics' => [
                'devices' => $deviceMetrics,
                'buses' => $busMetrics,
                'telemetry' => $this->telemetryMetrics(),
            ],
        ];

        if ($detailed) {
            $payload['metrics']['platform'] = [
                'users_total' => User::count(),
                'manual_entries_today' => ManualRevenueEntry::where('registered_at', '>=', now()->startOfDay())->count(),
                'database_driver' => DB::connection()->getDriverName(),
                'cache_driver' => config('cache.default'),
                'session_driver' => config('session.driver'),
            ];
            $payload['recent'] = [
                'stale_devices' => $this->staleDevices(),
                'stale_buses' => $this->staleBuses(),
            ];
        }

        return $payload;
    }

    private function checkApplication(): array
    {
        return [
            'key' => 'application',
            'label' => 'Aplicacion web',
            'status' => 'healthy',
            'message' => 'La aplicacion responde y el kernel web esta operativo.',
        ];
    }

    private function checkDatabase(): array
    {
        try {
            DB::select('SELECT 1');

            return [
                'key' => 'database',
                'label' => 'Base de datos',
                'status' => 'healthy',
                'message' => 'Conexion a base de datos disponible.',
            ];
        } catch (Throwable $exception) {
            return [
                'key' => 'database',
                'label' => 'Base de datos',
                'status' => 'unhealthy',
                'message' => 'No se pudo consultar la base de datos.',
                'details' => $exception->getMessage(),
            ];
        }
    }

    private function checkCache(): array
    {
        try {
            $probeKey = 'health-check:' . now()->timestamp;
            Cache::put($probeKey, 'ok', now()->addMinute());
            $value = Cache::get($probeKey);
            Cache::forget($probeKey);

            if ($value !== 'ok') {
                return [
                    'key' => 'cache',
                    'label' => 'Cache',
                    'status' => 'degraded',
                    'message' => 'La cache respondio, pero la lectura no devolvio el valor esperado.',
                ];
            }

            return [
                'key' => 'cache',
                'label' => 'Cache',
                'status' => 'healthy',
                'message' => 'Lectura y escritura en cache operativas.',
            ];
        } catch (Throwable $exception) {
            return [
                'key' => 'cache',
                'label' => 'Cache',
                'status' => 'degraded',
                'message' => 'La cache no esta disponible correctamente.',
                'details' => $exception->getMessage(),
            ];
        }
    }

    private function checkStorage(): array
    {
        $writable = is_writable(storage_path()) && is_writable(storage_path('logs'));

        return [
            'key' => 'storage',
            'label' => 'Storage y logs',
            'status' => $writable ? 'healthy' : 'unhealthy',
            'message' => $writable
                ? 'El storage y la carpeta de logs permiten escritura.'
                : 'No se detectaron permisos de escritura correctos en storage o logs.',
        ];
    }

    private function checkTelemetryFlow(): array
    {
        $latestEvent = TelemetryEvent::query()->latest('event_timestamp')->first();

        if (!$latestEvent) {
            return [
                'key' => 'telemetry',
                'label' => 'Flujo de telemetria',
                'status' => 'degraded',
                'message' => 'Aun no existen eventos de telemetria registrados.',
            ];
        }

        $minutes = now()->diffInMinutes($latestEvent->event_timestamp);

        if ($minutes > 30) {
            return [
                'key' => 'telemetry',
                'label' => 'Flujo de telemetria',
                'status' => 'degraded',
                'message' => "La ultima telemetria llego hace {$minutes} minutos.",
            ];
        }

        return [
            'key' => 'telemetry',
            'label' => 'Flujo de telemetria',
            'status' => 'healthy',
            'message' => "La ultima telemetria llego hace {$minutes} minutos.",
        ];
    }

    private function resolveOverallStatus(array $checks): string
    {
        if (collect($checks)->contains(fn (array $check) => $check['status'] === 'unhealthy')) {
            return 'unhealthy';
        }

        if (collect($checks)->contains(fn (array $check) => $check['status'] === 'degraded')) {
            return 'degraded';
        }

        return 'healthy';
    }

    private function deviceMetrics(): array
    {
        $total = Device::count();
        $online = Device::query()
            ->whereNotNull('last_seen_at')
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->count();

        return [
            'total' => $total,
            'online' => $online,
            'offline' => max(0, $total - $online),
            'inactive' => Device::where('is_active', false)->count(),
            'unlinked' => Device::doesntHave('bus')->count(),
        ];
    }

    private function busMetrics(): array
    {
        $total = Bus::count();
        $online = Bus::query()
            ->whereNotNull('last_seen_at')
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->count();

        return [
            'total' => $total,
            'online' => $online,
            'offline' => max(0, $total - $online),
            'active' => Bus::where('is_active', true)->count(),
            'without_device' => Bus::whereNull('device_mac')->count(),
        ];
    }

    private function telemetryMetrics(): array
    {
        $latestEvent = TelemetryEvent::query()->latest('event_timestamp')->first();

        return [
            'events_today' => TelemetryEvent::where('event_timestamp', '>=', now()->startOfDay())->count(),
            'latest_event_at' => $latestEvent?->event_timestamp?->toIso8601String(),
            'latest_event_age_minutes' => $latestEvent?->event_timestamp
                ? now()->diffInMinutes($latestEvent->event_timestamp)
                : null,
        ];
    }

    private function staleDevices(): array
    {
        return Device::query()
            ->with(['owner', 'bus'])
            ->where(function ($query) {
                $query->whereNull('last_seen_at')
                    ->orWhere('last_seen_at', '<', now()->subMinutes(15));
            })
            ->latest('last_seen_at')
            ->limit(8)
            ->get()
            ->map(fn (Device $device) => [
                'id' => $device->id,
                'mac_address' => $device->mac_address,
                'owner' => $device->owner?->name,
                'bus_plate' => $device->bus?->plate,
                'last_seen_at' => $device->last_seen_at?->toIso8601String(),
                'is_active' => $device->is_active,
            ])
            ->all();
    }

    private function staleBuses(): array
    {
        return Bus::query()
            ->with(['owner', 'route'])
            ->where(function ($query) {
                $query->whereNull('last_seen_at')
                    ->orWhere('last_seen_at', '<', now()->subMinutes(15));
            })
            ->latest('last_seen_at')
            ->limit(8)
            ->get()
            ->map(fn (Bus $bus) => [
                'id' => $bus->id,
                'plate' => $bus->plate,
                'route' => $bus->route?->name,
                'owner' => $bus->owner?->name,
                'last_seen_at' => $bus->last_seen_at?->toIso8601String(),
                'is_active' => $bus->is_active,
            ])
            ->all();
    }
}
