import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ReportStats {
    total_income: number;
    total_passengers: number;
    income_by_day: { date: string; total: string }[];
    by_passenger_type: { passenger_type: string; count: number; total: string }[];
    by_payment_method: { payment_method: string; count: number; total: string }[];
}

export default function ReportsIndex({ auth, stats, filters }: PageProps<{ stats: ReportStats, filters: any }>) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        window.location.href = route('reports.index', { start_date: startDate, end_date: endDate });
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(Number(amount));
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

                    {/* Filters Toolbar */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end border border-gray-100">
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
                        <button
                            onClick={handleFilter}
                            className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition shadow-sm"
                        >
                            Filtrar
                        </button>
                        <button
                            className="ml-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center gap-2"
                            onClick={() => alert("Generando PDF... (Simulado)")}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Exportar Reporte
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05 1.15 1.9 2.64 1.9 1.94 0 2.02-1.22 2.02-1.61 0-.84-.65-1.18-2.58-1.77-2.66-.8-3.04-2.58-3.04-3.5 0-1.8.91-3.13 2.57-3.49V4h2.67v1.88c1.55.33 2.76 1.41 2.91 3.24h-1.97c-.12-.91-.98-1.56-2.26-1.56-1.39 0-2.05.97-2.05 1.55 0 .8.62 1.11 2.66 1.77 2.45.83 2.96 2.3 2.96 3.49 0 1.99-1.3 3.32-2.96 3.67z" /></svg>
                            </div>
                            <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Ingresos Totales</h3>
                            <p className="text-4xl font-bold font-mono">{formatCurrency(stats.total_income)}</p>
                            <p className="text-sm text-blue-100 mt-2 opacity-80">Periodo seleccionado</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Pasajeros Totales</h3>
                            <p className="text-4xl font-bold text-gray-800 font-mono">{stats.total_passengers}</p>
                            <div className="mt-2 flex items-center text-sm text-green-600">
                                <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs font-bold">Activo</span>
                                <span className="ml-2 text-gray-500">Usuarios transportados</span>
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
