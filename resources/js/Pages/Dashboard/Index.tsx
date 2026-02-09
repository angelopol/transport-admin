import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Bus {
    id: number;
    plate: string;
    model: string | null;
    route: string | null;
    driver: string | null;
    is_online: boolean;
    last_seen: string | null;
    today_passengers: number;
    capacity: number;
}

interface Stats {
    totalPassengersToday: number;
    onlineBuses: number;
    totalBuses: number;
    estimatedRevenue: string;
}

interface HourlyData {
    hour: string;
    passengers: number;
}

interface Props {
    stats: Stats;
    hourlyData: HourlyData[];
    buses: Bus[];
    isAdmin: boolean;
}

export default function Index({ stats, hourlyData, buses, isAdmin }: Props) {
    const maxPassengers = Math.max(...hourlyData.map(h => h.passengers), 1);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <Link
                        href="/buses/create"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        + Nueva Unidad
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{stats.totalPassengersToday}</div>
                            <div className="text-blue-100 text-sm">Pasajeros Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{stats.onlineBuses}/{stats.totalBuses}</div>
                            <div className="text-green-100 text-sm">Unidades Online</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">${stats.estimatedRevenue}</div>
                            <div className="text-purple-100 text-sm">Ingresos Est. Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">
                                {stats.totalBuses > 0 ? Math.round(stats.totalPassengersToday / stats.totalBuses) : 0}
                            </div>
                            <div className="text-orange-100 text-sm">Promedio/Unidad</div>
                        </div>
                    </div>

                    {/* Hourly Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pasajeros por Hora</h3>
                        <div className="flex items-end gap-1 h-40">
                            {hourlyData.map((data, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 relative"
                                        style={{
                                            height: `${(data.passengers / maxPassengers) * 100}%`,
                                            minHeight: data.passengers > 0 ? '4px' : '0'
                                        }}
                                    >
                                        {data.passengers > 0 && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                                {data.passengers}
                                            </div>
                                        )}
                                    </div>
                                    {idx % 3 === 0 && (
                                        <span className="text-xs text-gray-500 mt-1">{data.hour}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fleet Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Estado de la Flota</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasajeros Hoy</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Conexión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {buses.map((bus) => (
                                        <tr key={bus.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bus.is_online
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${bus.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                                        }`}></span>
                                                    {bus.is_online ? 'Online' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/buses/${bus.id}`}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {bus.plate}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{bus.route || '—'}</td>
                                            <td className="px-6 py-4 text-gray-600">{bus.driver || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium">{bus.today_passengers}</span>
                                                <span className="text-gray-400 text-sm">/{bus.capacity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{bus.last_seen || 'Nunca'}</td>
                                        </tr>
                                    ))}
                                    {buses.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No hay unidades registradas.{' '}
                                                <Link href="/buses/create" className="text-blue-600 hover:underline">
                                                    Registrar primera unidad
                                                </Link>
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
