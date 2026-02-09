import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
    fare: number;
    is_active: boolean;
}

interface Props {
    route: Route;
}

export default function Edit({ route }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        fare: route.fare.toString(),
        is_active: route.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/routes/${route.id}`);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Ruta: {route.name}</h2>}
        >
            <Head title={`Editar ${route.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
                                    <input
                                        type="text"
                                        value={data.origin}
                                        onChange={(e) => setData('origin', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                                    <input
                                        type="text"
                                        value={data.destination}
                                        onChange={(e) => setData('destination', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.fare}
                                    onChange={(e) => setData('fare', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
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
                                    <span className="text-sm text-gray-700">Ruta activa</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/routes" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
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
