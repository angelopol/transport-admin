import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportTabs from '@/Components/ReportTabs';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface RouteUnitStat {
    id: number;
    plate: string;
    model: string | null;
    duration_minutes: number;
    event_count: number;
    passengers: number;
    first_seen: string;
    last_seen: string;
}

interface RouteStat {
    id: number;
    name: string;
    origin: string | null;
    destination: string | null;
    active_buses: number;
    average_duration_minutes: number;
    min_duration_minutes: number;
    max_duration_minutes: number;
    average_event_count: number;
    total_events: number;
    total_passengers: number;
    average_passengers_per_active_bus: number;
    average_start_time: string;
    average_end_time: string;
    earliest_start_time: string | null;
    latest_end_time: string | null;
    units: RouteUnitStat[];
}

interface Props {
    routeStats: RouteStat[];
    selectedDate: string;
}

export default function RouteTimes({ routeStats, selectedDate }: Props) {
    const [date, setDate] = useState(selectedDate);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(
            route('advanced-reports.route-times'),
            { date: newDate },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += '=== REPORTE DE TIEMPOS DE RUTA ===\n';
        csvContent += `Fecha:,${date}\n\n`;
        csvContent += 'Ruta,Unidades activas,Duracion promedio (min),Duracion minima (min),Duracion maxima (min),Hora promedio de inicio,Hora promedio de cierre,Primer inicio del dia,Ultimo cierre del dia,Eventos totales,Eventos promedio por unidad,Pasajeros totales,Pasajeros promedio por unidad\n';

        routeStats.forEach((stat) => {
            csvContent += `"${stat.name}",${stat.active_buses},${stat.average_duration_minutes},${stat.min_duration_minutes},${stat.max_duration_minutes},${stat.average_start_time},${stat.average_end_time},${stat.earliest_start_time || ''},${stat.latest_end_time || ''},${stat.total_events},${stat.average_event_count},${stat.total_passengers},${stat.average_passengers_per_active_bus}\n`;
        });

        csvContent += '\n=== DETALLE POR UNIDAD ===\n';
        csvContent += 'Ruta,Unidad,Modelo,Inicio,Fin,Duracion (min),Eventos,Pasajeros\n';

        routeStats.forEach((stat) => {
            stat.units.forEach((unit) => {
                csvContent += `"${stat.name}","${unit.plate}","${unit.model || ''}",${unit.first_seen},${unit.last_seen},${unit.duration_minutes},${unit.event_count},${unit.passengers}\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Reporte_Tiempos_Ruta_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tiempos Promedio de Ruta</h2>}
        >
            <Head title="Tiempos de Ruta" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ReportTabs />

                    <div className="bg-white p-4 shadow-sm sm:rounded-lg mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
                        <div className="text-gray-600 max-w-3xl">
                            El reporte resume la jornada operativa por ruta: ventana de servicio, dispersion entre unidades,
                            volumen de eventos y detalle por autobus para el dia seleccionado.
                        </div>
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="flex items-center gap-2">
                                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                                    Fecha del Reporte:
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                        />
                                    </svg>
                                    Imprimir
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        ></path>
                                    </svg>
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {routeStats.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>No hay suficientes datos de telemetria para calcular promedios en esta fecha.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {routeStats.map((stat) => (
                                        <div key={stat.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                                            <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">{stat.name}</h3>
                                                        {(stat.origin || stat.destination) && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {stat.origin || 'Origen no definido'} {'->'} {stat.destination || 'Destino no definido'}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Basado en {stat.active_buses} {stat.active_buses === 1 ? 'unidad activa' : 'unidades activas'}
                                                        </p>
                                                    </div>
                                                    <div className="text-left lg:text-right">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duracion promedio</p>
                                                        <p className="text-4xl font-extrabold text-indigo-600 mt-1">
                                                            {formatDuration(stat.average_duration_minutes)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                                                    <div className="rounded-xl bg-white border border-gray-100 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-gray-500">Ventana operativa promedio</p>
                                                        <p className="mt-2 text-lg font-bold text-gray-900">
                                                            {stat.average_start_time} - {stat.average_end_time}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-white border border-gray-100 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-gray-500">Rango de duracion</p>
                                                        <p className="mt-2 text-lg font-bold text-gray-900">
                                                            {formatDuration(stat.min_duration_minutes)} - {formatDuration(stat.max_duration_minutes)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-white border border-gray-100 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-gray-500">Eventos de telemetria</p>
                                                        <p className="mt-2 text-lg font-bold text-gray-900">{stat.total_events}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{stat.average_event_count} por unidad</p>
                                                    </div>
                                                    <div className="rounded-xl bg-white border border-gray-100 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-gray-500">Pasajeros asociados</p>
                                                        <p className="mt-2 text-lg font-bold text-gray-900">{stat.total_passengers}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{stat.average_passengers_per_active_bus} por unidad</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-amber-700">Primer inicio detectado</p>
                                                        <p className="mt-1 text-lg font-bold text-amber-900">{stat.earliest_start_time || 'N/D'}</p>
                                                    </div>
                                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-emerald-700">Ultimo cierre detectado</p>
                                                        <p className="mt-1 text-lg font-bold text-emerald-900">{stat.latest_end_time || 'N/D'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">
                                                    Desglose por unidad
                                                </h4>

                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-gray-100 text-left text-gray-500">
                                                                <th className="py-3 pr-4 font-semibold">Unidad</th>
                                                                <th className="py-3 pr-4 font-semibold">Inicio</th>
                                                                <th className="py-3 pr-4 font-semibold">Fin</th>
                                                                <th className="py-3 pr-4 font-semibold">Duracion</th>
                                                                <th className="py-3 pr-4 font-semibold">Eventos</th>
                                                                <th className="py-3 pr-4 font-semibold">Pasajeros</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {stat.units.map((unit) => (
                                                                <tr key={unit.id} className="border-b border-gray-50 last:border-b-0">
                                                                    <td className="py-3 pr-4">
                                                                        <div className="font-semibold text-gray-900">{unit.plate}</div>
                                                                        <div className="text-xs text-gray-500">{unit.model || 'Modelo no registrado'}</div>
                                                                    </td>
                                                                    <td className="py-3 pr-4 text-gray-700">{unit.first_seen}</td>
                                                                    <td className="py-3 pr-4 text-gray-700">{unit.last_seen}</td>
                                                                    <td className="py-3 pr-4 font-semibold text-indigo-700">
                                                                        {formatDuration(unit.duration_minutes)}
                                                                    </td>
                                                                    <td className="py-3 pr-4 text-gray-700">{unit.event_count}</td>
                                                                    <td className="py-3 pr-4 text-gray-700">{unit.passengers}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
