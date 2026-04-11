import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SettingsModal from './SettingsModal';

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    is_suburban: boolean;
    fare: number;
    fare_urban: number;
    is_active: boolean;
    buses_count: number;
    buses?: { id: number; plate: string }[];
    official_gazette_path?: string;
}

interface PaginatedRoutes {
    data: Route[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    routes: PaginatedRoutes;
}

export default function Index({ routes }: Props) {
    const { auth } = usePage().props as any;
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleDelete = (route: Route) => {
        if (confirm(`¿Eliminar la ruta "${route.name}"?`)) {
            router.delete(`/routes/${route.id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Rutas ({routes.total})
                    </h2>
                    <Link
                        href="/routes/create"
                        className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nueva Ruta
                    </Link>
                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium"
                        title="Ajustes de Rutas"
                    >
                        ⚙️ <span className="hidden md:inline">Ajustes</span>
                    </button>
                </div>
            }
        >
            <Head title="Rutas" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarifa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {routes.data.map((route) => (
                                        <tr key={route.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{route.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{route.origin}</td>
                                            <td className="px-6 py-4 text-gray-600">{route.destination}</td>
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span>{route.is_suburban ? 'Sub:' : ''} ${parseFloat(route.fare.toString()).toFixed(2)}</span>
                                                        {route.official_gazette_path && (
                                                            <a href={`/storage/${route.official_gazette_path}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700" title="Ver Gaceta Oficial">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                    {route.is_suburban && route.fare_urban && (
                                                        <div className="text-xs text-gray-500 font-normal">
                                                            Urb: ${parseFloat(route.fare_urban.toString()).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={route.buses?.map(b => b.plate).join(', ')}>
                                                {route.buses?.map(b => b.plate).join(', ') || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${route.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {route.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link href={`/routes/${route.id}/edit`} className="text-gray-600 hover:text-gray-800">
                                                    Editar
                                                </Link>
                                                <button onClick={() => handleDelete(route)} className="text-red-600 hover:text-red-800">
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {routes.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No hay rutas registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {routes.data.map((route) => (
                                <div key={route.id} className="p-4 border-b border-gray-200 last:border-b-0 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-gray-900">{route.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${route.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {route.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-500 w-16">Ruta:</span>
                                            <span>{route.origin} ➝ {route.destination}</span>
                                        </div>
                                        <div className="flex items-start gap-2 mb-1">
                                            <span className="font-semibold text-gray-500 w-16 mt-0.5">Tarifa:</span>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{route.is_suburban ? 'Sub:' : ''} ${parseFloat(route.fare.toString()).toFixed(2)}</span>
                                                    {route.official_gazette_path && (
                                                        <a href={`/storage/${route.official_gazette_path}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700" title="Ver Gaceta Oficial">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                        </svg>
                                                    </a>
                                                    )}
                                                </div>
                                                {route.is_suburban && route.fare_urban && (
                                                    <div className="text-xs text-gray-500 font-normal">
                                                        Urb: ${parseFloat(route.fare_urban.toString()).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-500 w-16">Unidades:</span>
                                            <span className="truncate max-w-[200px]" title={route.buses?.map(b => b.plate).join(', ')}>
                                                {route.buses?.map(b => b.plate).join(', ') || '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Link
                                            href={`/routes/${route.id}/edit`}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(route)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {routes.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay rutas registradas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB for mobile devices */}
            <Link
                href="/routes/create"
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-50"
                aria-label="Nueva Ruta"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Link>
            {/* Route Settings Modal */}
            <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)} 
                routes={routes.data} 
                user={auth.user} 
            />
        </AuthenticatedLayout>
    );
}
