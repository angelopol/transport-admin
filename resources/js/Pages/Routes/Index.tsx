import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    fare: number;
    is_active: boolean;
    buses_count: number;
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        + Nueva Ruta
                    </Link>
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
                                            <td className="px-6 py-4 font-medium">${parseFloat(route.fare.toString()).toFixed(2)}</td>
                                            <td className="px-6 py-4">{route.buses_count}</td>
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
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-500 w-16">Tarifa:</span>
                                            <span className="font-medium text-gray-900">${parseFloat(route.fare.toString()).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-500 w-16">Unidades:</span>
                                            <span>{route.buses_count}</span>
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
        </AuthenticatedLayout>
    );
}
