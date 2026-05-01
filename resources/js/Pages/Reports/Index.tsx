import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportTabs from '@/Components/ReportTabs';
import CompanyPrintHeader, { getCompanyCsvHeader } from '@/Components/CompanyPrintHeader';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

const paymentMethodLabel: Record<string, string> = {
    cash: 'Efectivo',
    digital: 'Digital',
    mobile: 'Pago Móvil',
    transfer: 'Transferencia',
};

const passengerTypeLabel: Record<string, string> = {
    general: 'General',
    student: 'Estudiante',
    senior: 'Adulto Mayor',
    disabled: 'Discapacitado',
    telemetry: 'Telemetría (Cámara)',
};

interface ReportStats {
    total_income: number;
    total_passengers: number;
    evasion_rate: number;
    evasion_count: number;
    growth_income: number;
    growth_passengers: number;
    growth_evasion: number;
    compare_title: string;
    previous_income: number;
    previous_passengers: number;
    income_by_day: { date: string; total: string }[];
    by_passenger_type: { passenger_type: string; count: number; total: string }[];
    by_payment_method: { payment_method: string; count: number; total: string }[];
}

export default function ReportsIndex({
    stats,
    filters,
    errors,
}: PageProps<{ stats: ReportStats; filters: any; errors: any }>) {
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
        const numericAmount = Number(amount) || 0;
        return `Bs. ${new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount)}`;
    };

    const formatGrowth = (value: number) => `${value > 0 ? '+' : ''}${value}%`;

    const handlePrint = () => {
        window.print();
    };

    const user = usePage().props.auth.user as any;

    const handleExportCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += getCompanyCsvHeader(user);
        csvContent += '=== REPORTE GENERAL DE INGRESOS ===\n';
        csvContent += `Periodo:,${startDate} al ${endDate}\n\n`;
        csvContent += 'Totales\n';
        csvContent += `Ingresos Totales:,${stats.total_income} VES\n`;
        csvContent += `Pasajeros Totales (Cámara + Manual):,${stats.total_passengers}\n`;
        csvContent += `Evasión Detectada:,${stats.evasion_count} pasajeros (${stats.evasion_rate}%)\n\n`;
        csvContent += 'Por Tipo de Pasajero\n';
        csvContent += 'Tipo,Cantidad,Total VES\n';
        stats.by_passenger_type.forEach((row) => {
            csvContent += `${passengerTypeLabel[row.passenger_type] ?? row.passenger_type},${row.count},${row.total}\n`;
        });
        csvContent += '\nPor Método de Pago\n';
        csvContent += 'Método,Cantidad,Total VES\n';
        stats.by_payment_method.forEach((row) => {
            csvContent += `${paymentMethodLabel[row.payment_method] ?? row.payment_method},${row.count},${row.total}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Reporte_Ingresos_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Reportes de Ingresos</h2>
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

                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-start border border-gray-100 flex-col md:flex-row md:items-end print:hidden">
                        <div className="flex gap-4 items-end flex-wrap">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Desde</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hasta</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            </div>
                        </div>

                        {isComparing && (
                            <div className="flex gap-4 items-end flex-wrap border-l-2 border-gray-200 pl-4 mt-4 md:mt-0">
                                <div>
                                    <label className="block text-xs font-semibold text-blue-500 uppercase mb-1">Comparar Desde</label>
                                    <input type="date" value={compareStartDate} onChange={(e) => setCompareStartDate(e.target.value)} className={`block w-full border ${errors.compare_end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-lg text-sm shadow-sm`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-blue-500 uppercase mb-1">Comparar Hasta</label>
                                    <input type="date" value={compareEndDate} onChange={(e) => setCompareEndDate(e.target.value)} className={`block w-full border ${errors.compare_end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} rounded-lg text-sm shadow-sm`} />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <button onClick={handleFilter} className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition shadow-sm">
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
                            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2" onClick={handleExportCSV}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Exportar
                            </button>
                        </div>
                    </div>

                    {errors.compare_end_date && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start text-red-700 print:hidden">
                            <div>
                                <h4 className="font-semibold text-sm">Error de Validación</h4>
                                <p className="text-sm mt-1">{errors.compare_end_date}</p>
                            </div>
                        </div>
                    )}

                    <div className="hidden print:block bg-white text-black mb-6">
                        <CompanyPrintHeader />
                        <div className="border-b border-gray-300 pb-4 mb-4">
                            <h1 className="text-2xl font-bold">Reporte General Financiero</h1>
                            <p className="text-sm mt-1">Periodo principal: {startDate} al {endDate}</p>
                            <p className="text-sm mt-1">Comparativo: {stats.compare_title}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="border border-gray-300 rounded-lg p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Ingresos Totales</p>
                                <p className="text-2xl font-bold mt-2">{formatCurrency(stats.total_income)}</p>
                                <p className="text-sm text-gray-600 mt-1">{formatGrowth(stats.growth_income)} vs {stats.compare_title}</p>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Pasajeros Totales</p>
                                <p className="text-2xl font-bold mt-2">{stats.total_passengers}</p>
                                <p className="text-sm text-gray-600 mt-1">{formatGrowth(stats.growth_passengers)} vs {stats.compare_title}</p>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Tasa de Evasión</p>
                                <p className="text-2xl font-bold mt-2">{stats.evasion_rate}% ({stats.evasion_count} personas)</p>
                                <p className="text-sm text-gray-600 mt-1">{formatGrowth(stats.growth_evasion)} vs {stats.compare_title}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h2 className="text-lg font-bold mb-3">Ingresos por Tipo de Pasajero</h2>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-left">
                                            <th className="py-2 pr-3">Tipo</th>
                                            <th className="py-2 pr-3">Cantidad</th>
                                            <th className="py-2 pr-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.by_passenger_type.length === 0 ? (
                                            <tr><td colSpan={3} className="py-3 text-sm text-gray-600">No hay datos registrados.</td></tr>
                                        ) : (
                                            stats.by_passenger_type.map((item) => (
                                                <tr key={`print-type-${item.passenger_type}`} className="border-b border-gray-200">
                                                    <td className="py-2 pr-3">{passengerTypeLabel[item.passenger_type] ?? item.passenger_type}</td>
                                                    <td className="py-2 pr-3">{item.count}</td>
                                                    <td className="py-2 pr-3">{formatCurrency(item.total)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold mb-3">Métodos de Pago</h2>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-left">
                                            <th className="py-2 pr-3">Método</th>
                                            <th className="py-2 pr-3">Cantidad</th>
                                            <th className="py-2 pr-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.by_payment_method.length === 0 ? (
                                            <tr><td colSpan={3} className="py-3 text-sm text-gray-600">No hay datos registrados.</td></tr>
                                        ) : (
                                            stats.by_payment_method.map((item) => (
                                                <tr key={`print-method-${item.payment_method}`} className="border-b border-gray-200">
                                                    <td className="py-2 pr-3">{paymentMethodLabel[item.payment_method] ?? item.payment_method}</td>
                                                    <td className="py-2 pr-3">{item.count}</td>
                                                    <td className="py-2 pr-3">{formatCurrency(item.total)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold mb-3">Ingreso Diario Consolidado</h2>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-300 text-left">
                                        <th className="py-2 pr-3">Fecha</th>
                                        <th className="py-2 pr-3">Ingreso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.income_by_day.length === 0 ? (
                                        <tr><td colSpan={2} className="py-3 text-sm text-gray-600">No hay datos diarios registrados para este periodo.</td></tr>
                                    ) : (
                                        stats.income_by_day.map((row) => (
                                            <tr key={`print-day-${row.date}`} className="border-b border-gray-200">
                                                <td className="py-2 pr-3">{row.date}</td>
                                                <td className="py-2 pr-3">{formatCurrency(row.total)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                                <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Ingresos Totales</h3>
                                <p className="text-4xl font-bold font-mono">{formatCurrency(stats.total_income)}</p>
                                <div className="mt-4 flex items-center bg-white/20 rounded-lg p-2 inline-flex">
                                    <span className={`font-semibold ${stats.growth_income >= 0 ? 'text-green-300' : 'text-red-300'}`}>{formatGrowth(stats.growth_income)}</span>
                                    <span className="text-blue-100 text-sm ml-2 font-medium">vs {stats.compare_title}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Pasajeros Totales</h3>
                                <p className="text-4xl font-bold text-gray-800 font-mono">{stats.total_passengers}</p>
                                <div className="mt-4 flex items-center bg-gray-50 border border-gray-100 rounded-lg p-2 inline-flex">
                                    <span className={`font-semibold ${stats.growth_passengers >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatGrowth(stats.growth_passengers)}</span>
                                    <span className="text-gray-500 text-sm ml-2 font-medium">Usuarios físicos registrados</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
                                <h3 className="text-red-100 text-sm font-medium uppercase tracking-wider mb-1">Tasa de Evasión</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold font-mono">{stats.evasion_rate}%</p>
                                    <span className="text-red-100 text-sm opacity-90">({stats.evasion_count} personas)</span>
                                </div>
                                <div className="mt-4 flex items-center bg-white/20 rounded-lg p-2 inline-flex text-sm">
                                    <span className={`font-semibold ${stats.growth_evasion <= 0 ? 'text-green-300' : 'text-red-300'}`}>{formatGrowth(stats.growth_evasion)}</span>
                                    <span className="text-red-100 ml-2 font-medium">vs {stats.compare_title}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{passengerTypeLabel[item.passenger_type] ?? item.passenger_type}</td>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{paymentMethodLabel[item.payment_method] ?? item.payment_method}</td>
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

                        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h4 className="text-base font-semibold text-blue-900">Privacidad por Diseño (Protección de Datos Biométricos)</h4>
                            <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                                Este sistema opera exclusivamente mediante metadatos numéricos procesados en el borde. No se almacenan rostros, imágenes ni secuencias de video de forma permanente en la base de datos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
