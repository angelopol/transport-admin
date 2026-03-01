import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ReportTabs from '@/Components/ReportTabs';

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
        router.get(route('advanced-reports.unit-spacing'), { route_id: newRouteId }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "=== REPORTE DE ESPACIADO DE UNIDADES ===\n";

        const selectedRoute = routes.find(r => r.id.toString() === routeId.toString());
        csvContent += `Ruta Seleccionada:,${selectedRoute ? selectedRoute.name : 'N/A'}\n\n`;

        csvContent += "Posicion,Placa,Ultimo Reporte,Brecha Tiempo (min),Distancia (m)\n";

        if (busesData && busesData.length > 0) {
            busesData.forEach((bus, index) => {
                const pos = index === 0 ? "LIDER" : index + 1;
                const timeStr = index === 0 ? "0" : bus.time_to_prev;
                const distStr = index === 0 ? "0" : bus.distance_to_prev;
                csvContent += `${pos},${bus.plate},${bus.last_seen_formatted},${timeStr},${distStr}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Espaciado_Ruta_${routeId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Espaciado de Unidades</h2>}
        >
            <Head title="Espaciado de Unidades" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <ReportTabs />

                    {/* Controls */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg mb-6 print:hidden">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Ruta:</label>
                                <select
                                    id="route_id"
                                    value={routeId}
                                    onChange={handleRouteChange}
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="">-- Seleccione una ruta --</option>
                                    {routes.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimir
                                </button>
                                <button
                                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2"
                                    onClick={handleExportCSV}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Exportar
                                </button>
                            </div>
                        </div>
                        <div className="w-full text-sm text-gray-600 bg-blue-50 p-4 rounded-lg mt-4">
                            Muestra las unidades activas ordenadas por su último reporte de telemetría.
                            La distancia y tiempo se calculan con respecto a la unidad que va inmediatamente por delante.
                        </div>
                    </div>

                    {/* Report Data */}
                    {routeId ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-0 sm:p-6">
                                {busesData && busesData.length > 0 ? (
                                    <div className="relative">
                                        {/* Timeline Line */}
                                        <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-1 bg-indigo-200"></div>

                                        <ul className="space-y-6 sm:space-y-0 relative">
                                            {busesData.map((bus, index) => (
                                                <li key={bus.id} className="relative sm:pl-20 py-4 sm:py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition p-4 sm:p-0">

                                                    {/* Timeline Node */}
                                                    <div className="hidden sm:flex absolute left-[1.625rem] top-1/2 -mt-3 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow items-center justify-center z-10"></div>

                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                                        <div>
                                                            <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                                <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-sm font-mono">
                                                                    {bus.plate}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Último reporte: {bus.last_seen_formatted}
                                                            </div>
                                                        </div>

                                                        {index > 0 && (
                                                            <div className="mt-4 sm:mt-0 flex gap-4 text-right">
                                                                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100">
                                                                    <p className="text-xs uppercase font-bold tracking-wider">Brecha de Tiempo</p>
                                                                    <p className="text-2xl font-black">{bus.time_to_prev} <span className="text-sm font-medium">min</span></p>
                                                                </div>
                                                                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-100">
                                                                    <p className="text-xs uppercase font-bold tracking-wider">Distancia</p>
                                                                    <p className="text-2xl font-black">{bus.distance_to_prev} <span className="text-sm font-medium">m</span></p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {index === 0 && (
                                                            <div className="mt-4 sm:mt-0 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                                                                Unidad líder actual
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
                    ) : (
                        <div className="bg-white p-12 text-center text-gray-500 shadow-sm sm:rounded-lg border-2 border-dashed border-gray-300">
                            <span className="text-4xl block mb-4">🚌</span>
                            <p>Seleccione una ruta en el menú superior para ver el espaciado entre sus unidades.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
