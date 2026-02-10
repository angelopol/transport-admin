import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

interface Bus {
    id: number;
    plate: string;
    model: string | null;
    device_mac: string;
    capacity: number;
    is_active: boolean;
    last_seen_at: string | null;
    owner?: { name: string };
    route?: { name: string };
    driver?: { name: string };
}

interface PaginatedBuses {
    data: Bus[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    buses: PaginatedBuses;
    isAdmin: boolean;
}

export default function Index({ buses, isAdmin }: Props) {
    const handleDelete = (bus: Bus) => {
        if (confirm(`¿Eliminar la unidad ${bus.plate}? Esta acción no se puede deshacer.`)) {
            router.delete(`/buses/${bus.id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Unidades ({buses.total})
                    </h2>
                    <Link
                        href="/buses/create"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        + Nueva Unidad
                    </Link>
                </div>
            }
        >
            <Head title="Unidades" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {buses.data.map((bus) => (
                                        <tr key={bus.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/buses/${bus.id}`}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {bus.plate}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{bus.model || '—'}</td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {bus.device_mac}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{bus.route?.name || '—'}</td>
                                            <td className="px-6 py-4 text-gray-600">{bus.driver?.name || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {bus.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link
                                                    href={`/buses/${bus.id}/edit`}
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(bus)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {buses.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No hay unidades registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {buses.data.map((bus) => (
                                <div key={bus.id} className="p-4 border-b border-gray-200 last:border-b-0 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link
                                                href={`/buses/${bus.id}`}
                                                className="text-lg font-bold text-blue-600 block"
                                            >
                                                {bus.plate}
                                            </Link>
                                            <span className="text-sm text-gray-500">{bus.model || 'Modelo no especificado'}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {bus.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Ruta</span>
                                            <span className="text-gray-800">{bus.route?.name || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Conductor</span>
                                            <span className="text-gray-800">{bus.driver?.name || '—'}</span>
                                        </div>
                                        <div className="col-span-2 mt-1">
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">MAC</span>
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{bus.device_mac}</code>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Link
                                            href={`/buses/${bus.id}/edit`}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(bus)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {buses.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay unidades registradas.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {buses.last_page > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                {Array.from({ length: buses.last_page }, (_, i) => (
                                    <Link
                                        key={i + 1}
                                        href={`/buses?page=${i + 1}`}
                                        className={`px-3 py-1 rounded ${buses.current_page === i + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
