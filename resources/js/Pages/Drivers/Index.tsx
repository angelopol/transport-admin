import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Driver {
    id: number;
    name: string;
    cedula: string;
    phone: string | null;
    license_number: string | null;
    is_active: boolean;
    buses_count: number;
    buses?: { id: number; plate: string }[];
    photo_url?: string;
}

interface PaginatedDrivers {
    data: Driver[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    drivers: PaginatedDrivers;
}

export default function Index({ drivers }: Props) {
    const handleDelete = (driver: Driver) => {
        if (confirm(`¿Eliminar al conductor "${driver.name}"?`)) {
            router.delete(`/drivers/${driver.id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Conductores ({drivers.total})</h2>
                    <Link href="/drivers/create" className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nuevo Conductor
                    </Link>
                </div>
            }
        >
            <Head title="Conductores" />

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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licencia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {drivers.data.map((driver) => (
                                        <tr key={driver.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                {driver.photo_url ? (
                                                    <img src={driver.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shadow-sm">
                                                        {driver.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span>{driver.name}</span>
                                            </td>
                                            <td className="px-6 py-4">{driver.cedula}</td>
                                            <td className="px-6 py-4 text-gray-600">{driver.phone || '—'}</td>
                                            <td className="px-6 py-4 text-gray-600">{driver.license_number || '—'}</td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={driver.buses?.map(b => b.plate).join(', ')}>
                                                {driver.buses?.map(b => b.plate).join(', ') || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${driver.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {driver.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link href={`/drivers/${driver.id}/edit`} className="text-gray-600 hover:text-gray-800">Editar</Link>
                                                <button onClick={() => handleDelete(driver)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {drivers.data.length === 0 && (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No hay conductores registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {drivers.data.map((driver) => (
                                <div key={driver.id} className="p-4 border-b border-gray-200 last:border-b-0 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {driver.photo_url ? (
                                                <img src={driver.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shadow-sm">
                                                    {driver.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${driver.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {driver.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Cédula</span>
                                            <span>{driver.cedula}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Licencia</span>
                                            <span>{driver.license_number || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Teléfono</span>
                                            <span>{driver.phone || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Unidades</span>
                                            <span>{driver.buses?.map(b => b.plate).join(', ') || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Link
                                            href={`/drivers/${driver.id}/edit`}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(driver)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {drivers.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay conductores registrados.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB for mobile devices */}
            <Link
                href="/drivers/create"
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-50"
                aria-label="Nuevo Conductor"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Link>
        </AuthenticatedLayout>
    );
}
