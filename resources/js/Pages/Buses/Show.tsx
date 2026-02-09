import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Bus {
    id: number;
    plate: string;
    model: string | null;
    device_mac: string;
    capacity: number;
    api_token: string;
    is_active: boolean;
    last_seen_at: string | null;
    owner?: { name: string; email: string };
    route?: { name: string; fare: number };
    driver?: { name: string; phone: string };
}

interface TelemetryEvent {
    id: number;
    event_timestamp: string;
    passenger_count: number;
    latitude: number | null;
    longitude: number | null;
    location_source: string | null;
}

interface TodayStats {
    passengers: number;
    revenue: number;
}

interface Props {
    bus: Bus;
    recentEvents: TelemetryEvent[];
    todayStats: TodayStats;
    isAdmin: boolean;
}

export default function Show({ bus, recentEvents, todayStats, isAdmin }: Props) {
    const [showToken, setShowToken] = useState(false);

    const handleRegenerateToken = () => {
        if (confirm('¿Regenerar el token API? El dispositivo necesitará la nueva configuración.')) {
            router.post(`/buses/${bus.id}/regenerate-token`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Unidad: {bus.plate}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={`/buses/${bus.id}/edit`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Editar
                        </Link>
                        <Link
                            href="/buses"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Unidad ${bus.plate}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{todayStats.passengers}</div>
                            <div className="text-blue-100 text-sm">Pasajeros Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">${todayStats.revenue.toFixed(2)}</div>
                            <div className="text-green-100 text-sm">Ingresos Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{bus.capacity}</div>
                            <div className="text-purple-100 text-sm">Capacidad</div>
                        </div>
                    </div>

                    {/* Info + Token */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <dt className="text-gray-500">Placa</dt>
                                    <dd className="font-medium">{bus.plate}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <dt className="text-gray-500">Modelo</dt>
                                    <dd>{bus.model || '—'}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <dt className="text-gray-500">MAC</dt>
                                    <dd><code className="bg-gray-100 px-2 py-1 rounded text-sm">{bus.device_mac}</code></dd>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <dt className="text-gray-500">Ruta</dt>
                                    <dd>{bus.route?.name || '—'}</dd>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <dt className="text-gray-500">Conductor</dt>
                                    <dd>{bus.driver?.name || '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Estado</dt>
                                    <dd>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bus.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {bus.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración API</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Use este token en el archivo config.yaml del dispositivo edge.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">API Token</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type={showToken ? 'text' : 'password'}
                                            value={bus.api_token}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg font-mono text-sm"
                                        />
                                        <button
                                            onClick={() => setShowToken(!showToken)}
                                            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            {showToken ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRegenerateToken}
                                    className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                                >
                                    Regenerar Token
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Events */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Eventos Recientes</h3>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasajeros</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm">
                                                {new Date(event.event_timestamp).toLocaleString('es-VE')}
                                            </td>
                                            <td className="px-6 py-3 font-medium">{event.passenger_count}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">
                                                {event.latitude && event.longitude
                                                    ? `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`
                                                    : '—'
                                                }
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{event.location_source || '—'}</td>
                                        </tr>
                                    ))}
                                    {recentEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Sin eventos registrados
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
