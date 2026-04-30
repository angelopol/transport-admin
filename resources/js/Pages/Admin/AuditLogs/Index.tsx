import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    details: any;
    ip_address: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
}

export default function AuditLogsIndex({ auth, logs }: PageProps<{ logs: any }>) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Bitácora de Auditoría (Trazabilidad)</h2>}
        >
            <Head title="Bitácora de Auditoría" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4 mb-6">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-blue-900">Registro de Transacciones Inalterables</h4>
                            <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                                Este panel contiene el historial permanente de acciones sensibles dentro del sistema, como el registro en 
                                PWA de ingresos manuales financieros o la autorización de unidades. Todos los registros capturan IP 
                                y fecha exacta para propósitos de trazabilidad.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario Responsable</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción Realizada</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles (IP / Metadatos)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.map((log: AuditLog) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString('es-VE')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {log.user ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                                                        <div className="text-xs text-gray-500">{log.user.email} <span className="uppercase text-blue-500 ml-1">({log.user.role})</span></div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Sistema / Público</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                                                <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all whitespace-pre-wrap">
                                                    {log.details ? JSON.stringify(log.details) : 'Sin detalles'}
                                                </div>
                                                {log.ip_address && (
                                                    <div className="text-xs mt-1 text-gray-400">Origen IP: {log.ip_address}</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No hay registros de auditoría disponibles en la base de datos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 px-6 pb-4 flex flex-wrap gap-2">
                            {logs.links.map((link: any, k: number) => (
                                <Link
                                    key={k}
                                    href={link.url || ''}
                                    className={`px-3 py-1 text-sm border rounded ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
