import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout header="Panel de Control">
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats Card 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-blue-500 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pasajeros Hoy</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-1">1,284</p>
                        <p className="text-green-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            +12.5% vs ayer
                        </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
                </div>

                {/* Stats Card 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-purple-500 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ingresos Hoy</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-1">$450.00</p>
                        <p className="text-green-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            +5.2% vs ayer
                        </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-50 rounded-full opacity-50"></div>
                </div>

                {/* Stats Card 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-orange-500 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Flota Activa</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-1">12/15</p>
                        <p className="text-gray-400 text-sm mt-2">
                            3 en mantenimiento
                        </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-50"></div>
                </div>

                {/* Stats Card 4 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-pink-500 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Alertas</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-1">2</p>
                        <p className="text-red-500 text-sm mt-2">
                            Requiere atención
                        </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-50 rounded-full opacity-50"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    Bus
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Bus AB-123 llegó a Terminal</p>
                                    <p className="text-xs text-gray-500">Hace {i * 5} minutos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="text-lg font-bold mb-2">Estado del Sistema</h3>
                    <p className="text-blue-200 text-sm mb-6">Todos los servicios operativos</p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">API Server</span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Database</span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Edge Devices</span>
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">Syncing (12/15)</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
