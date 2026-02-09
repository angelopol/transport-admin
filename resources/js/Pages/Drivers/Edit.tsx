import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Driver {
    id: number;
    name: string;
    cedula: string;
    phone: string | null;
    license_number: string | null;
    is_active: boolean;
}

interface Props {
    driver: Driver;
}

export default function Edit({ driver }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: driver.name,
        cedula: driver.cedula,
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        is_active: driver.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/drivers/${driver.id}`);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Conductor: {driver.name}</h2>}
        >
            <Head title={`Editar ${driver.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                                    <input
                                        type="text"
                                        value={data.cedula}
                                        onChange={(e) => setData('cedula', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Licencia</label>
                                <input
                                    type="text"
                                    value={data.license_number}
                                    onChange={(e) => setData('license_number', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Conductor activo</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/drivers" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</Link>
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
