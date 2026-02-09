import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Route {
    id: number;
    name: string;
    origin: string;
    destination: string;
}

interface Driver {
    id: number;
    name: string;
    cedula: string;
}

interface Props {
    routes: Route[];
    drivers: Driver[];
}

export default function Create({ routes, drivers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        device_mac: '',
        plate: '',
        model: '',
        capacity: 40,
        route_id: '',
        driver_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/buses');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Nueva Unidad
                </h2>
            }
        >
            <Head title="Nueva Unidad" />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Placa *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.plate}
                                        onChange={(e) => setData('plate', e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ABC123"
                                        required
                                    />
                                    {errors.plate && <p className="text-red-500 text-sm mt-1">{errors.plate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        MAC del Dispositivo *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.device_mac}
                                        onChange={(e) => setData('device_mac', e.target.value.toLowerCase())}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                        placeholder="aa:bb:cc:dd:ee:ff"
                                        required
                                    />
                                    {errors.device_mac && <p className="text-red-500 text-sm mt-1">{errors.device_mac}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Modelo
                                    </label>
                                    <input
                                        type="text"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Yutong ZK6126"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacidad *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="1"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ruta
                                    </label>
                                    <select
                                        value={data.route_id}
                                        onChange={(e) => setData('route_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Sin asignar</option>
                                        {routes.map((route) => (
                                            <option key={route.id} value={route.id}>
                                                {route.name} ({route.origin} → {route.destination})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Conductor
                                    </label>
                                    <select
                                        value={data.driver_id}
                                        onChange={(e) => setData('driver_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Sin asignar</option>
                                        {drivers.map((driver) => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} ({driver.cedula})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Link
                                    href="/buses"
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Registrar Unidad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
