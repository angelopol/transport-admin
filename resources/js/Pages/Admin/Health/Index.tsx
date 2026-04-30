import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheck {
    key: string;
    label: string;
    status: HealthStatus;
    message: string;
    details?: string;
}

interface HealthPayload {
    status: HealthStatus;
    app: {
        name: string;
        env: string;
        url: string;
        timezone: string;
        timestamp: string;
    };
    checks: HealthCheck[];
    metrics: {
        devices: Record<string, number | null>;
        buses: Record<string, number | null>;
        telemetry: Record<string, number | string | null>;
        platform?: Record<string, number | string | null>;
    };
    recent?: {
        stale_devices: Array<Record<string, string | number | boolean | null>>;
        stale_buses: Array<Record<string, string | number | boolean | null>>;
    };
}

interface Props {
    health: HealthPayload;
    generatedAt: string;
    viewer: {
        id: number;
        name: string;
    };
}

const statusStyles: Record<HealthStatus, string> = {
    healthy: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    degraded: 'bg-amber-100 text-amber-700 border border-amber-200',
    unhealthy: 'bg-red-100 text-red-700 border border-red-200',
};

const statusLabels: Record<HealthStatus, string> = {
    healthy: 'Saludable',
    degraded: 'Degradado',
    unhealthy: 'Crítico',
};

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }

    return String(value);
}

export default function AdminHealthIndex({ health, generatedAt }: Props) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Salud de la Plataforma</h2>}
        >
            <Head title="Salud de la Plataforma" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Monitor general</p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-900">{health.app.name}</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Estado calculado con chequeos de aplicación, base de datos, caché, storage y flujo de telemetría.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-2 md:items-end">
                            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[health.status]}`}>
                                {statusLabels[health.status]}
                            </span>
                            <p className="text-sm text-slate-500">
                                Actualizado: {new Date(generatedAt).toLocaleString('es-VE')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-blue-700">Dispositivos online</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{health.metrics.devices.online}</p>
                        <p className="mt-1 text-sm text-slate-500">de {health.metrics.devices.total} registrados</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-emerald-700">Unidades online</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{health.metrics.buses.online}</p>
                        <p className="mt-1 text-sm text-slate-500">de {health.metrics.buses.total} registradas</p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-violet-700">Eventos hoy</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{health.metrics.telemetry.events_today}</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Último evento hace {health.metrics.telemetry.latest_event_age_minutes ?? '—'} minutos
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Chequeos del sistema</h3>
                            <a
                                href={route('health.public')}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Ver /health
                            </a>
                        </div>

                        <div className="space-y-3">
                            {health.checks.map((check) => (
                                <div key={check.key} className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{check.label}</h4>
                                            <p className="mt-1 text-sm text-slate-600">{check.message}</p>
                                            {check.details && (
                                                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">
                                                    {check.details}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[check.status]}`}>
                                            {statusLabels[check.status]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">Métricas de plataforma</h3>
                            <div className="mt-4 grid gap-3">
                                {Object.entries(health.metrics.platform ?? {}).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span className="text-sm font-medium text-slate-600">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-900">{formatValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">Resumen operativo</h3>
                            <div className="mt-4 grid gap-3">
                                {[
                                    ['Dispositivos offline', health.metrics.devices.offline],
                                    ['Dispositivos inactivos', health.metrics.devices.inactive],
                                    ['Dispositivos sin unidad', health.metrics.devices.unlinked],
                                    ['Unidades offline', health.metrics.buses.offline],
                                    ['Unidades activas', health.metrics.buses.active],
                                    ['Unidades sin dispositivo', health.metrics.buses.without_device],
                                ].map(([label, value]) => (
                                    <div key={String(label)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span className="text-sm font-medium text-slate-600">{label}</span>
                                        <span className="text-sm font-semibold text-slate-900">{formatValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">Dispositivos rezagados</h3>
                        <div className="mt-4 max-h-[26rem] overflow-auto rounded-xl border border-slate-100">
                            <table className="w-full min-w-[560px]">
                                <thead className="sticky top-0 border-b border-slate-200 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="pb-3">Dirección MAC</th>
                                        <th className="pb-3">Unidad</th>
                                        <th className="pb-3">Owner</th>
                                        <th className="pb-3">Última senal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {(health.recent?.stale_devices ?? []).map((device) => (
                                        <tr key={String(device.id)}>
                                            <td className="py-3 font-mono text-xs">{formatValue(device.mac_address)}</td>
                                            <td className="py-3">{formatValue(device.bus_plate)}</td>
                                            <td className="py-3">{formatValue(device.owner)}</td>
                                            <td className="py-3">
                                                {device.last_seen_at ? new Date(String(device.last_seen_at)).toLocaleString('es-VE') : 'Nunca'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(health.recent?.stale_devices ?? []).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-slate-500">
                                                No hay dispositivos rezagados en este momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">Unidades rezagadas</h3>
                        <div className="mt-4 max-h-[26rem] overflow-auto rounded-xl border border-slate-100">
                            <table className="w-full min-w-[560px]">
                                <thead className="sticky top-0 border-b border-slate-200 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="pb-3">Placa</th>
                                        <th className="pb-3">Ruta</th>
                                        <th className="pb-3">Owner</th>
                                        <th className="pb-3">Última senal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {(health.recent?.stale_buses ?? []).map((bus) => (
                                        <tr key={String(bus.id)}>
                                            <td className="py-3 font-semibold">{formatValue(bus.plate)}</td>
                                            <td className="py-3">{formatValue(bus.route)}</td>
                                            <td className="py-3">{formatValue(bus.owner)}</td>
                                            <td className="py-3">
                                                {bus.last_seen_at ? new Date(String(bus.last_seen_at)).toLocaleString('es-VE') : 'Nunca'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(health.recent?.stale_buses ?? []).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-slate-500">
                                                No hay unidades rezagadas en este momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
