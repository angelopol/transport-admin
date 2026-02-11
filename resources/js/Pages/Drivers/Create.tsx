import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        cedula: '',
        phone: '',
        license_number: '',
        photo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/drivers');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Nuevo Conductor</h2>}
        >
            <Head title="Nuevo Conductor" />

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
                                    placeholder="Juan Pérez"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                                    <input
                                        type="text"
                                        value={data.cedula}
                                        onChange={(e) => setData('cedula', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="V-12345678"
                                        required
                                    />
                                    {errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="0412-1234567"
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
                                    placeholder="LIC-123456"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/drivers" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</Link>
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {processing ? 'Guardando...' : 'Registrar Conductor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
