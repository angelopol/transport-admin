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
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Conductores ({drivers.total})</h2>
                    <Link href="/drivers/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        + Nuevo Conductor
                    </Link>
                </div>
            }
        >
            <Head title="Conductores" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                                        <td className="px-6 py-4 font-medium text-gray-900">{driver.name}</td>
                                        <td className="px-6 py-4">{driver.cedula}</td>
                                        <td className="px-6 py-4 text-gray-600">{driver.phone || '—'}</td>
                                        <td className="px-6 py-4 text-gray-600">{driver.license_number || '—'}</td>
                                        <td className="px-6 py-4">{driver.buses_count}</td>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
