import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        origin: '',
        destination: '',
        fare: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/routes');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Nueva Ruta</h2>}
        >
            <Head title="Nueva Ruta" />

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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ruta Centro - Terminal"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
                                    <input
                                        type="text"
                                        value={data.origin}
                                        onChange={(e) => setData('origin', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Centro"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                                    <input
                                        type="text"
                                        value={data.destination}
                                        onChange={(e) => setData('destination', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Terminal"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="1.50"
                                    required
                                />
                                {errors.fare && <p className="text-red-500 text-sm mt-1">{errors.fare}</p>}
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
                                    {processing ? 'Guardando...' : 'Crear Ruta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
