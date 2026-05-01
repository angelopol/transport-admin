import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

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
    totalManualPassengersToday: number;
    evasionRate: number;
    evasionCount: number;
    actualRevenue: string;
    estimatedRevenue: string;
    onlineBuses: number;
    totalBuses: number;
}

interface HourlyData {
    hour: string;
    passengers: number;
}

interface WeeklyRevenueData {
    date: string;
    day: string;
    amount: number;
}

interface Alert {
    id: string;
    type: string;
    title: string;
    message: string;
}

interface Props {
    stats: Stats;
    hourlyData: HourlyData[];
    weeklyRevenueData: WeeklyRevenueData[];
    buses: Bus[];
    alerts: Alert[];
    isAdmin: boolean;
}

export default function Index({ stats, hourlyData, weeklyRevenueData, buses, alerts, isAdmin }: Props) {
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const maxPassengers = Math.max(...hourlyData.map(h => h.passengers), 1);
    const maxRevenue = Math.max(...weeklyRevenueData.map(d => Number(d.amount)), 1);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsAlertModalOpen(true)}
                            className="relative p-2 text-gray-500 hover:text-gray-700 transition bg-white rounded-full shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                            </svg>
                            {alerts && alerts.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {alerts.length}
                                </span>
                            )}
                        </button>
                        <Link
                            href="/buses/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            + Nueva Unidad
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold font-mono">{stats.totalPassengersToday}</div>
                            <div className="text-blue-100 text-sm">Pasajeros Totales (Cámara)</div>
                            <div className="text-blue-200 text-xs mt-2 border-t border-blue-400/50 pt-2">
                                {stats.totalManualPassengersToday} pasajes pagados
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold font-mono">{stats.evasionRate}%</span>
                            </div>
                            <div className="text-red-100 text-sm">Tasa de Evasión Hoy</div>
                            <div className="text-red-200 text-xs mt-2 border-t border-red-400/50 pt-2">
                                {stats.evasionCount} <span className="opacity-80">pasajeros evadidos</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold font-mono">Bs. {stats.actualRevenue}</div>
                            <div className="text-green-100 text-sm">Ingresos Reales Hoy</div>
                            <div className="text-green-200 text-xs mt-2 border-t border-green-400/50 pt-2">
                                Meta Est: Bs. {stats.estimatedRevenue}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold font-mono">{stats.onlineBuses}/{stats.totalBuses}</div>
                            <div className="text-purple-100 text-sm">Unidades Trabajando</div>
                            <div className="text-purple-200 text-xs mt-2 border-t border-purple-400/50 pt-2">
                                Flota Activa
                            </div>
                        </div>
                    </div>

                    {/* Alerts Modal */}
                    <Modal show={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} maxWidth="2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Alertas del Sistema</h2>
                                <button onClick={() => setIsAlertModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {alerts && alerts.length > 0 ? (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className={`p-4 rounded-lg flex items-start gap-4 shadow-sm border ${alert.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                                            <div className="shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{alert.title}</h4>
                                                <p className="text-sm opacity-90">{alert.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="mx-auto bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900">Todo está en orden</p>
                                    <p className="text-sm mt-1">No hay alertas activas en el sistema en este momento.</p>
                                </div>
                            )}
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setIsAlertModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </Modal>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Hourly Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pasajeros por Hora</h3>
                            <div className="overflow-x-auto">
                                <div className="flex items-end gap-1 min-w-[340px] sm:min-w-full" style={{ height: '160px' }}>
                                    {hourlyData.map((data, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full">
                                            <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                                                <div
                                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 relative overflow-visible"
                                                    style={{
                                                        height: `${Math.max((data.passengers / maxPassengers) * 100, data.passengers > 0 ? 2 : 0)}%`,
                                                    }}
                                                >
                                                    {data.passengers > 0 && (
                                                        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                                                            {data.passengers}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {idx % 3 === 0 && (
                                                <span className="text-xs text-gray-500 mt-1 shrink-0">{data.hour}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Revenue Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos Últimos 7 Días</h3>
                            <div className="overflow-x-auto">
                                <div className="flex items-end gap-2 min-w-[300px] sm:min-w-full" style={{ height: '160px' }}>
                                    {weeklyRevenueData.map((data, idx) => {
                                        const amount = Number(data.amount);
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full">
                                                <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                                                    <div
                                                        className="w-full bg-gradient-to-t from-emerald-500 to-green-400 rounded-t transition-all hover:from-emerald-600 hover:to-green-500 relative overflow-visible"
                                                        style={{
                                                            height: `${Math.max((amount / maxRevenue) * 100, amount > 0 ? 2 : 0)}%`,
                                                        }}
                                                    >
                                                        {amount > 0 && (
                                                            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                                                                Bs. {amount.toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1 shrink-0">{data.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
