import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ReportTabs from '@/Components/ReportTabs';

interface RouteStat {
    id: number;
    name: string;
    active_buses: number;
    average_duration_minutes: number;
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
        router.get(route('advanced-reports.route-times'), { date: newDate }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) {
            return `${h}h ${m}m`;
        }
        return `${m}m`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "=== REPORTE DE TIEMPOS PROMEDIO DE RUTA ===\n";
        csvContent += `Fecha:,${date}\n\n`;

        csvContent += "Ruta,Unidades Activas,Duracion Promedio (min)\n";

        routeStats.forEach(stat => {
            csvContent += `${stat.name},${stat.active_buses},${stat.average_duration_minutes}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Tiempos_Ruta_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tiempos Promedio de Ruta</h2>}
        >
            <Head title="Tiempos de Ruta" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <ReportTabs />

                    {/* Controls */}
                    <div className="bg-white p-4 shadow-sm sm:rounded-lg mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
                        <div className="text-gray-600">
                            Tiempo promedio calculado desde el primer evento de telemetría hasta el último del día.
                        </div>
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="flex items-center gap-2">
                                <label htmlFor="date" className="text-sm font-medium text-gray-700">Fecha del Reporte:</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <button onClick={handlePrint} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Imprimir
                                </button>
                                <button onClick={handleExportCSV} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Report Data */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {routeStats.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>No hay suficientes datos de telemetría para calcular promedios en esta fecha.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {routeStats.map((stat) => (
                                        <div key={stat.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.name}</h3>
                                            <div className="flex items-center text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                                Basado en {stat.active_buses} {stat.active_buses === 1 ? 'unidad activa' : 'unidades activas'}
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                                    Duración Promedio
                                                </p>
                                                <p className="text-4xl font-extrabold text-indigo-600">
                                                    {formatDuration(stat.average_duration_minutes)}
                                                </p>
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
