import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Collector {
    id: number;
    name: string;
    cedula: string;
    phone: string | null;
    is_active: boolean;
    photo_url?: string;
}

interface Props {
    collector: Collector;
}

export default function Edit({ collector }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: collector.name,
        cedula: collector.cedula,
        phone: collector.phone || '',
        is_active: collector.is_active,
        photo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/collectors/${collector.id}`);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Colector: {collector.name}</h2>}
        >
            <Head title={`Editar ${collector.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Mostrar foto actual si existe */}
                            {collector.photo_url && (
                                <div className="flex justify-center mb-6">
                                    <img
                                        src={collector.photo_url}
                                        alt={collector.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                                    />
                                </div>
                            )}

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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Actualizar Foto</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                            </div>

                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Colector activo</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/collectors" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</Link>
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
