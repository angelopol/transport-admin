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

interface Collector {
    id: number;
    name: string;
    cedula: string;
}

interface AvailableDevice {
    id: number;
    mac_address: string;
}

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    phone_number: string;
}

interface Bus {
    id: number;
    device_mac: string | null;
    plate: string;
    model: string | null;
    capacity: number;
    route_id: number | null;
    mobile_payment_account_id: number | null;
    transfer_account_id: number | null;
    drivers?: Driver[];
    collectors?: Collector[];
    is_active: boolean;
}

interface Props {
    bus: Bus;
    routes: Route[];
    drivers: Driver[];
    collectors: Collector[];
    availableDevices: AvailableDevice[];
    bankAccounts: BankAccount[];
}

export default function Edit({ bus, routes, drivers, collectors, availableDevices, bankAccounts }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        device_mac: bus.device_mac || '',
        plate: bus.plate,
        model: bus.model || '',
        capacity: bus.capacity,
        route_id: bus.route_id?.toString() || '',
        mobile_payment_account_id: bus.mobile_payment_account_id?.toString() || '',
        transfer_account_id: bus.transfer_account_id?.toString() || '',
        driver_ids: bus.drivers?.map(d => d.id) || ([] as number[]),
        collector_ids: bus.collectors?.map(c => c.id) || ([] as number[]),
        is_active: bus.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/buses/${bus.id}`);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Editar Unidad: {bus.plate}
                </h2>
            }
        >
            <Head title={`Editar ${bus.plate}`} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">Editar Unidad: {bus.plate}</h2>
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
                                        required
                                    />
                                    {errors.plate && <p className="text-red-500 text-sm mt-1">{errors.plate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dispositivo
                                    </label>
                                    <select
                                        value={data.device_mac}
                                        onChange={(e) => setData('device_mac', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    >
                                        <option value="">Sin dispositivo</option>
                                        {availableDevices.map((device) => (
                                            <option key={device.id} value={device.mac_address}>
                                                {device.mac_address}
                                            </option>
                                        ))}
                                    </select>
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
                                                {route.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cuenta para Pago Móvil
                                        </label>
                                        <select
                                            value={data.mobile_payment_account_id}
                                            onChange={(e) => setData('mobile_payment_account_id', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Ninguna</option>
                                            {bankAccounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.bank_name} - {account.phone_number || account.account_number}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cuenta para Transferencias
                                        </label>
                                        <select
                                            value={data.transfer_account_id}
                                            onChange={(e) => setData('transfer_account_id', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Ninguna</option>
                                            {bankAccounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.bank_name} - {account.account_number || account.phone_number}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Conductores
                                    </label>
                                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2 bg-gray-50">
                                        {drivers.length === 0 && <span className="text-sm text-gray-500">No hay conductores registrados</span>}
                                        {drivers.map((driver) => (
                                            <label key={driver.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value={driver.id}
                                                    checked={data.driver_ids.includes(driver.id)}
                                                    onChange={(e) => {
                                                        const id = Number(e.target.value);
                                                        setData('driver_ids', e.target.checked
                                                            ? [...data.driver_ids, id]
                                                            : data.driver_ids.filter(d => d !== id));
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{driver.name} ({driver.cedula})</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.driver_ids && <p className="text-red-500 text-sm mt-1">{errors.driver_ids}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Colectores
                                    </label>
                                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2 bg-gray-50">
                                        {collectors.length === 0 && <span className="text-sm text-gray-500">No hay colectores registrados</span>}
                                        {collectors.map((collector) => (
                                            <label key={collector.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value={collector.id}
                                                    checked={data.collector_ids.includes(collector.id)}
                                                    onChange={(e) => {
                                                        const id = Number(e.target.value);
                                                        setData('collector_ids', e.target.checked
                                                            ? [...data.collector_ids, id]
                                                            : data.collector_ids.filter(d => d !== id));
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{collector.name} ({collector.cedula})</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.collector_ids && <p className="text-red-500 text-sm mt-1">{errors.collector_ids}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Unidad activa</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Link
                                    href={`/buses`}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
