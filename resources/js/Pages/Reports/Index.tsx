import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import ReportTabs from '@/Components/ReportTabs';

interface ReportStats {
    total_income: number;
    total_passengers: number;
    growth_income: number;
    growth_passengers: number;
    compare_title: string;
    previous_income: number;
    previous_passengers: number;
    income_by_day: { date: string; total: string }[];
    by_passenger_type: { passenger_type: string; count: number; total: string }[];
    by_payment_method: { payment_method: string; count: number; total: string }[];
}

export default function ReportsIndex({ auth, stats, filters, errors }: PageProps<{ stats: ReportStats, filters: any, errors: any }>) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [compareStartDate, setCompareStartDate] = useState(filters.compare_start_date || '');
    const [compareEndDate, setCompareEndDate] = useState(filters.compare_end_date || '');
    const [isComparing, setIsComparing] = useState(!!filters.compare_start_date);

    const handleFilter = () => {
        const payload: any = { start_date: startDate, end_date: endDate };
        if (isComparing && compareStartDate && compareEndDate) {
            payload.compare_start_date = compareStartDate;
            payload.compare_end_date = compareEndDate;
        }
        window.location.href = route('reports.index', payload);
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(Number(amount));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "=== REPORTE GENERAL DE INGRESOS ===\n";
        csvContent += `Periodo:,${startDate} al ${endDate}\n\n`;

        csvContent += "Totales\n";
        csvContent += `Ingresos Totales:,${stats.total_income} VES\n`;
        csvContent += `Pasajeros Totales:,${stats.total_passengers}\n\n`;

        csvContent += "Por Tipo de Pasajero\n";
        csvContent += "Tipo,Cantidad,Total VES\n";
        stats.by_passenger_type.forEach(row => {
            csvContent += `${row.passenger_type},${row.count},${row.total}\n`;
        });
        csvContent += "\n";

        csvContent += "Por Método de Pago\n";
        csvContent += "Metodo,Cantidad,Total VES\n";
        stats.by_payment_method.forEach(row => {
            csvContent += `${row.payment_method},${row.count},${row.total}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Ingresos_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Reportes de Ingresos
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            {startDate} - {endDate}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Reportes" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <ReportTabs />

                    {/* Filters Toolbar */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-start border border-gray-100 flex-col md:flex-row md:items-end print:hidden">
                        <div className="flex gap-4 items-end flex-wrap">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="block w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="block w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {isComparing && (
                            <div className="flex gap-4 items-end flex-wrap border-l-2 border-gray-200 pl-4 mt-4 md:mt-0">
                                <div>
                                    <label className="block text-xs font-semibold text-blue-500 uppercase mb-1">Comparar Desde</label>
                                    <input
                                        type="date"
                                        value={compareStartDate}
                                        onChange={(e) => setCompareStartDate(e.target.value)}
                                        className={`block w-full border ${errors.compare_end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-lg text-sm shadow-sm`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-blue-500 uppercase mb-1">Comparar Hasta</label>
                                    <input
                                        type="date"
                                        value={compareEndDate}
                                        onChange={(e) => setCompareEndDate(e.target.value)}
                                        className={`block w-full border ${errors.compare_end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-lg text-sm shadow-sm`}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition shadow-sm"
                            >
                                Filtrar Datos
                            </button>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    checked={isComparing}
                                    onChange={(e) => {
                                        setIsComparing(e.target.checked);
                                        if (!e.target.checked) {
                                            setCompareStartDate('');
                                            setCompareEndDate('');
                                        }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                Elegir periodo previo
                            </label>
                        </div>

                        <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-auto flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2"
                                onClick={handleExportCSV}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Exportar
                            </button>
                        </div>
                    </div>

                    {errors.compare_end_date && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <div>
                                <h4 className="font-semibold text-sm">Error de Validación</h4>
                                <p className="text-sm mt-1">{errors.compare_end_date}</p>
                            </div>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05 1.15 1.9 2.64 1.9 1.94 0 2.02-1.22 2.02-1.61 0-.84-.65-1.18-2.58-1.77-2.66-.8-3.04-2.58-3.04-3.5 0-1.8.91-3.13 2.57-3.49V4h2.67v1.88c1.55.33 2.76 1.41 2.91 3.24h-1.97c-.12-.91-.98-1.56-2.26-1.56-1.39 0-2.05.97-2.05 1.55 0 .8.62 1.11 2.66 1.77 2.45.83 2.96 2.3 2.96 3.49 0 1.99-1.3 3.32-2.96 3.67z" /></svg>
                            </div>
                            <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Ingresos Totales</h3>
                            <p className="text-4xl font-bold font-mono">{formatCurrency(stats.total_income)}</p>

                            <div className="mt-4 flex items-center bg-white/20 rounded-lg p-2 backdrop-blur-sm shadow-sm inline-flex">
                                {stats.growth_income >= 0 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-green-300 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-red-300 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                                    </svg>
                                )}
                                <span className={`font-semibold ${stats.growth_income >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                    {stats.growth_income > 0 ? '+' : ''}{stats.growth_income}%
                                </span>
                                <span className="text-blue-100 text-sm ml-2 font-medium">vs {stats.compare_title}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Pasajeros Totales</h3>
                            <p className="text-4xl font-bold text-gray-800 font-mono">{stats.total_passengers}</p>

                            <div className="mt-4 flex items-center bg-gray-50 border border-gray-100 rounded-lg p-2 inline-flex">
                                {stats.growth_passengers >= 0 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-red-500 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                                    </svg>
                                )}
                                <span className={`font-semibold ${stats.growth_passengers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.growth_passengers > 0 ? '+' : ''}{stats.growth_passengers}%
                                </span>
                                <span className="text-gray-500 text-sm ml-2 font-medium">Usuarios físicos registrados</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Income by Type */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800">Ingresos por Tipo de Pasajero</h3>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stats.by_passenger_type.map((item) => (
                                            <tr key={item.passenger_type} className="hover:bg-gray-50/50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 capitalize">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.passenger_type === 'standard' ? 'bg-blue-500' :
                                                        item.passenger_type === 'student' ? 'bg-orange-500' :
                                                            item.passenger_type === 'telemetría' ? 'bg-emerald-500' :
                                                                'bg-purple-500'
                                                        }`}></span>
                                                    {item.passenger_type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 font-mono text-right">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                        {stats.by_passenger_type.length === 0 && (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">No hay datos registrados</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Income by Payment Method */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800">Métodos de Pago</h3>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stats.by_payment_method.map((item) => (
                                            <tr key={item.payment_method} className="hover:bg-gray-50/50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 capitalize">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.payment_method === 'cash' ? 'bg-green-500' : 'bg-indigo-500'
                                                        }`}></span>
                                                    {item.payment_method}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 font-mono text-right">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                        {stats.by_payment_method.length === 0 && (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">No hay datos registrados</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
