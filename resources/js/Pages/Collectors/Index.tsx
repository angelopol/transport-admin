import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Collector {
    id: number;
    name: string;
    cedula: string;
    phone: string | null;
    is_active: boolean;
    photo_url?: string;
}

interface PaginatedCollectors {
    data: Collector[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    collectors: PaginatedCollectors;
}

export default function Index({ collectors }: Props) {
    const handleDelete = (collector: Collector) => {
        if (confirm(`¿Eliminar al colector "${collector.name}"?`)) {
            router.delete(`/collectors/${collector.id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Colectores ({collectors.total})</h2>
                    <Link href="/collectors/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        + Nuevo Colector
                    </Link>
                </div>
            }
        >
            <Head title="Colectores" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {collectors.data.map((collector) => (
                                        <tr key={collector.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                {collector.photo_url ? (
                                                    <img src={collector.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shadow-sm">
                                                        {collector.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span>{collector.name}</span>
                                            </td>
                                            <td className="px-6 py-4">{collector.cedula}</td>
                                            <td className="px-6 py-4 text-gray-600">{collector.phone || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${collector.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {collector.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link href={`/collectors/${collector.id}/edit`} className="text-gray-600 hover:text-gray-800">Editar</Link>
                                                <button onClick={() => handleDelete(collector)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {collectors.data.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay colectores registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {collectors.data.map((collector) => (
                                <div key={collector.id} className="p-4 border-b border-gray-200 last:border-b-0 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {collector.photo_url ? (
                                                <img src={collector.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shadow-sm">
                                                    {collector.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <h3 className="text-lg font-bold text-gray-900">{collector.name}</h3>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${collector.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {collector.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Cédula</span>
                                            <span>{collector.cedula}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Teléfono</span>
                                            <span>{collector.phone || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Link
                                            href={`/collectors/${collector.id}/edit`}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(collector)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {collectors.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay colectores registrados.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
