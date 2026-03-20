import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Line
} from 'recharts';

interface ComparativeData {
    id: number;
    plate: string;
    total_telemetry_passengers: number;
    total_manual_passengers: number;
    evasion_rate: number;
    total_revenue: number;
}

export default function ComparativeReport({ comparativeData, currentMonth }: PageProps<{ comparativeData: ComparativeData[], currentMonth: string }>) {
    
    // Format Month
    const dateObj = new Date(`${currentMonth}-01T00:00:00`);
    const formattedMonth = dateObj.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4 border-b pb-4">
                    <div className="flex items-center">
                        <Link href={route('advanced-reports.index')} className="text-gray-400 hover:text-gray-600 mr-2">
                            ← Volver
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Comparativo de Unidades
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Comparativo Rendimiento de Flota" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                    {/* Privacy Notice Disclaimer */}
                    <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900">Privacidad por Diseño (Cumplimiento GDPR/LOPDP)</h4>
                            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                                Estas métricas consolidadas se generan automáticamente mediante conteos temporales en el Edge.
                                En ningún punto de la plataforma se almacenan o asocian rostros con la afluencia de las unidades.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Rendimiento Consolidado ({formattedMonth})</h3>
                            <p className="text-sm text-gray-500 mt-1">Comparativa de pasajeros reales vs recaudales para cada unidad de tu flota.</p>
                        </div>

                        {comparativeData.length > 0 ? (
                            <div className="space-y-12">
                                {/* Chart 1: Revenue vs Evasion */}
                                <div>
                                    <h4 className="text-center font-semibold text-gray-700 mb-4">Ingresos ($) vs Ratio de Evasión (%)</h4>
                                    <div className="h-96 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart
                                                data={comparativeData}
                                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="plate" tick={{fontSize: 12}} />
                                                <YAxis yAxisId="left" orientation="left" stroke="#10b981" tickFormatter={(v) => `Bs${v}`} width={80} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tickFormatter={(v) => `${v}%`} width={40}/>
                                                <Tooltip 
                                                    formatter={(value, name) => {
                                                        if (name === 'Ingresos') return [`Bs ${value}`, name];
                                                        if (name === 'Tasa Evasión') return [`${value}%`, name];
                                                        return [value, name];
                                                    }}
                                                />
                                                <Legend />
                                                <Bar yAxisId="left" dataKey="total_revenue" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                                <Line yAxisId="right" type="monotone" dataKey="evasion_rate" name="Tasa Evasión" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart 2: Passenger Discrepancies */}
                                <div>
                                    <h4 className="text-center font-semibold text-gray-700 mb-4">Afluencia Total: Cámara vs Ingresos Registrados</h4>
                                    <div className="h-96 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={comparativeData}
                                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="plate" tick={{fontSize: 12}} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="total_telemetry_passengers" name="Físicos (Cámara)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                <Bar dataKey="total_manual_passengers" name="Legalizados (Pagados)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                No se generaron ingresos ni métricas para el periodo seleccionado.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
