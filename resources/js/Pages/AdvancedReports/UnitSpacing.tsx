import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportTabs from '@/Components/ReportTabs';
import CompanyPrintHeader, { getCompanyCsvHeader } from '@/Components/CompanyPrintHeader';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface BusData {
    id: number;
    plate: string;
    lat: number;
    lng: number;
    last_seen: string;
    last_seen_formatted: string;
    distance_to_prev: number;
    time_to_prev: number;
}

interface Route {
    id: number;
    name: string;
}

interface Props {
    routes: Route[];
    busesData: BusData[];
    selectedRouteId: number | null;
}

export default function UnitSpacing({ routes, busesData, selectedRouteId }: Props) {
    const [routeId, setRouteId] = useState(selectedRouteId || '');

    const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRouteId = e.target.value;
        setRouteId(newRouteId);
        router.get(
            route('advanced-reports.unit-spacing'),
            { route_id: newRouteId },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const user = usePage().props.auth.user as any;

    const handleExportCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += getCompanyCsvHeader(user);
        csvContent += '=== REPORTE DE ESPACIADO DE UNIDADES ===\n';

        const selectedRoute = routes.find((route) => route.id.toString() === routeId.toString());
        csvContent += `Ruta Seleccionada:,${selectedRoute ? selectedRoute.name : 'Sin ruta'}\n\n`;

        csvContent += 'Posición,Placa,Último Reporte,Brecha de Tiempo (minutos),Distancia (metros),Interpretación\n';

        if (busesData.length > 0) {
            busesData.forEach((bus, index) => {
                const position = index === 0 ? 'LIDER' : index + 1;
                const timeGap = index === 0 ? '0' : bus.time_to_prev;
                const distanceGap = index === 0 ? '0' : bus.distance_to_prev;
                const interpretation =
                    index === 0
                        ? 'Unidad mas adelantada segun ultimo reporte'
                        : bus.time_to_prev > 15 || bus.distance_to_prev > 1500
                          ? 'Brecha amplia'
                          : 'Brecha normal';

                csvContent += `${position},${bus.plate},${bus.last_seen_formatted},${timeGap},${distanceGap},${interpretation}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Reporte_Espaciado_Ruta_${routeId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedRoute = routes.find((route) => route.id.toString() === routeId.toString());
    const trailingUnits = busesData.slice(1);
    const averageTimeGap =
        trailingUnits.length > 0
            ? Math.round(trailingUnits.reduce((sum, bus) => sum + bus.time_to_prev, 0) / trailingUnits.length)
            : 0;
    const averageDistanceGap =
        trailingUnits.length > 0
            ? Math.round(trailingUnits.reduce((sum, bus) => sum + bus.distance_to_prev, 0) / trailingUnits.length)
            : 0;

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Espaciado de Unidades</h2>}
        >
            <Head title="Espaciado de Unidades" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ReportTabs />

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg mb-6 print:hidden">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Seleccionar Ruta:
                                </label>
                                <select
                                    id="route_id"
                                    value={routeId}
                                    onChange={handleRouteChange}
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="">-- Seleccione una ruta --</option>
                                    {routes.map((route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
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
                                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2"
                                    onClick={handleExportCSV}
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

                        <div className="w-full text-sm text-gray-700 bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
                            <p className="font-semibold text-blue-900 mb-2">¿Para qué sirve este reporte?</p>
                            <p>
                                Este reporte ayuda a detectar si las unidades de una misma ruta están demasiado juntas o demasiado separadas.
                                Compara cada unidad con la que va inmediatamente por delante usando su último reporte de telemetría.
                            </p>
                            <p className="mt-2">
                                Si las brechas de tiempo o distancia son muy grandes, puede indicar huecos en la frecuencia del servicio.
                                Si son demasiado pequeñas, puede haber saturación de unidades en el mismo tramo.
                            </p>
                        </div>
                    </div>

                    {routeId ? (
                        <>
                            <div className="hidden print:block bg-white text-black mb-6">
                                <CompanyPrintHeader />
                                <div className="border-b border-gray-300 pb-4 mb-4">
                                    <h1 className="text-2xl font-bold">Reporte de Espaciado de Unidades</h1>
                                    <p className="text-sm mt-1">Ruta: {selectedRoute?.name || 'N/D'}</p>
                                    <p className="text-sm mt-1">
                                        Este reporte ordena las unidades por su último reporte de telemetría y calcula la brecha de tiempo y
                                        distancia respecto a la unidad inmediatamente anterior.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="border border-gray-300 rounded-lg p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Unidades con datos</p>
                                        <p className="text-2xl font-bold mt-2">{busesData.length}</p>
                                    </div>
                                    <div className="border border-gray-300 rounded-lg p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Brecha promedio</p>
                                        <p className="text-2xl font-bold mt-2">{averageTimeGap} min</p>
                                    </div>
                                    <div className="border border-gray-300 rounded-lg p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Distancia promedio</p>
                                        <p className="text-2xl font-bold mt-2">{averageDistanceGap} m</p>
                                    </div>
                                </div>

                                {busesData.length > 0 ? (
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-300 text-left">
                                                <th className="py-2 pr-3">Posición</th>
                                                <th className="py-2 pr-3">Unidad</th>
                                                <th className="py-2 pr-3">Último reporte</th>
                                                <th className="py-2 pr-3">Brecha tiempo</th>
                                                <th className="py-2 pr-3">Distancia</th>
                                                <th className="py-2 pr-3">Lectura</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {busesData.map((bus, index) => (
                                                <tr key={`print-${bus.id}`} className="border-b border-gray-200">
                                                    <td className="py-2 pr-3">{index === 0 ? 'Líder' : index + 1}</td>
                                                    <td className="py-2 pr-3 font-semibold">{bus.plate}</td>
                                                    <td className="py-2 pr-3">{bus.last_seen_formatted}</td>
                                                    <td className="py-2 pr-3">{index === 0 ? '0 min' : `${bus.time_to_prev} min`}</td>
                                                    <td className="py-2 pr-3">{index === 0 ? '0 m' : `${bus.distance_to_prev} m`}</td>
                                                    <td className="py-2 pr-3">
                                                        {index === 0
                                                            ? 'Unidad más adelantada'
                                                            : bus.time_to_prev > 15 || bus.distance_to_prev > 1500
                                                              ? 'Brecha amplia'
                                                              : 'Brecha normal'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm text-gray-600">No hay unidades activas con datos de telemetría recientes para esta ruta.</p>
                                )}
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg print:hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                                            <p className="text-xs uppercase tracking-wide text-indigo-700 font-semibold">Unidades reportando</p>
                                            <p className="mt-2 text-3xl font-black text-indigo-600">{busesData.length}</p>
                                        </div>
                                        <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                                            <p className="text-xs uppercase tracking-wide text-red-700 font-semibold">Brecha promedio</p>
                                            <p className="mt-2 text-3xl font-black text-red-600">{averageTimeGap} min</p>
                                        </div>
                                        <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
                                            <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">Distancia promedio</p>
                                            <p className="mt-2 text-3xl font-black text-orange-600">{averageDistanceGap} m</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-0 sm:p-6">
                                    {busesData.length > 0 ? (
                                        <div className="relative">
                                            <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-1 bg-indigo-200"></div>

                                            <ul className="space-y-6 sm:space-y-0 relative">
                                                {busesData.map((bus, index) => (
                                                    <li
                                                        key={bus.id}
                                                        className="relative sm:pl-20 py-4 sm:py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition p-4 sm:p-0"
                                                    >
                                                        <div className="hidden sm:flex absolute left-[1.625rem] top-1/2 -mt-3 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow items-center justify-center z-10"></div>

                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-sm font-mono">
                                                                        {bus.plate}
                                                                    </span>
                                                                    {index === 0 && (
                                                                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                                                            Unidad líder actual
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Último reporte: {bus.last_seen_formatted}
                                                                </div>
                                                                <p className="mt-2 text-sm text-gray-600">
                                                                    {index === 0
                                                                        ? 'Es la unidad más adelantada según el último punto de telemetría recibido.'
                                                                        : 'Se compara contra la unidad que va inmediatamente por delante en la secuencia actual.'}
                                                                </p>
                                                            </div>

                                                            {index > 0 && (
                                                                <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-3 text-right">
                                                                    <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100 min-w-[150px]">
                                                                        <p className="text-xs uppercase font-bold tracking-wider">Brecha de Tiempo</p>
                                                                        <p className="text-2xl font-black">
                                                                            {bus.time_to_prev} <span className="text-sm font-medium">min</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-100 min-w-[150px]">
                                                                        <p className="text-xs uppercase font-bold tracking-wider">Distancia</p>
                                                                        <p className="text-2xl font-black">
                                                                            {bus.distance_to_prev} <span className="text-sm font-medium">m</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-lg border border-slate-200 min-w-[150px] text-left">
                                                                        <p className="text-xs uppercase font-bold tracking-wider">Lectura</p>
                                                                        <p className="text-sm font-semibold mt-1">
                                                                            {bus.time_to_prev > 15 || bus.distance_to_prev > 1500 ? 'Brecha amplia' : 'Brecha normal'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            No hay unidades activas con datos de telemetría recientes para esta ruta.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-12 text-center text-gray-500 shadow-sm sm:rounded-lg border-2 border-dashed border-gray-300">
                            <span className="text-4xl block mb-4">🚌</span>
                            <p>Seleccione una ruta en el menú superior para ver el espaciado entre sus unidades.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
