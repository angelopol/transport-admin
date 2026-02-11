import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface LinkedBus {
    id: number;
    plate: string;
    model: string | null;
    owner?: { name: string };
    route?: { name: string };
}

interface Device {
    id: number;
    mac_address: string;
    is_active: boolean;
    last_seen_at: string | null;
    linked_bus: LinkedBus | null;
}

interface PaginatedDevices {
    data: Device[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Stats {
    total: number;
    pending: number;
    linked: number;
}

interface Props {
    devices: PaginatedDevices;
    stats: Stats;
    currentFilter: string;
}

export default function Index({ devices, stats, currentFilter }: Props) {
    const handleToggle = (device: Device) => {
        router.post(`/devices/${device.id}/toggle`);
    };

    const handleDelete = (device: Device) => {
        if (confirm(`¿Eliminar el dispositivo ${device.mac_address}? Esta acción no se puede deshacer.`)) {
            router.delete(`/devices/${device.id}`);
        }
    };

    const filters = [
        { key: 'all', label: 'Todos', count: stats.total },
        { key: 'pending', label: 'Sin vincular', count: stats.pending },
        { key: 'linked', label: 'Vinculados', count: stats.linked },
    ];

    const getStatusBadge = (device: Device) => {
        if (!device.linked_bus) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Sin vincular</span>;
        }
        if (device.is_active) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✅ Vinculado</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">❌ Inactivo</span>;
    };

    const timeAgo = (date: string | null) => {
        if (!date) return 'Nunca';
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${Math.floor(hours / 24)}d`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dispositivos ({stats.total})
                    </h2>
                    {stats.pending > 0 && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium animate-pulse">
                            {stats.pending} sin vincular
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Dispositivos" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {filters.map((f) => (
                            <Link
                                key={f.key}
                                href={`/devices?filter=${f.key}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${currentFilter === f.key
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {f.label} ({f.count})
                            </Link>
                        ))}
                    </div>

                    {/* Info banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
                        💡 Los dispositivos se registran automáticamente al ejecutar el monitor.
                        Para vincular un dispositivo, asígnelo al crear o editar un <Link href="/buses" className="underline font-medium">autobús</Link>.
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autobús</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última conexión</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {devices.data.map((device) => (
                                        <tr key={device.id} className={`hover:bg-gray-50 ${!device.linked_bus ? 'bg-yellow-50/50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                                    {device.mac_address}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(device)}</td>
                                            <td className="px-6 py-4">
                                                {device.linked_bus ? (
                                                    <Link
                                                        href={`/buses/${device.linked_bus.id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        {device.linked_bus.plate} {device.linked_bus.model && `(${device.linked_bus.model})`}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 italic">Sin autobús</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {device.linked_bus?.owner?.name || <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{timeAgo(device.last_seen_at)}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleToggle(device)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${device.is_active
                                                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                >
                                                    {device.is_active ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(device)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {devices.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No hay dispositivos registrados. Ejecute el monitor para que se registren automáticamente.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List */}
                        <div className="md:hidden">
                            {devices.data.map((device) => (
                                <div key={device.id} className={`p-4 border-b border-gray-200 last:border-b-0 space-y-3 ${!device.linked_bus ? 'bg-yellow-50/50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono">{device.mac_address}</code>
                                        {getStatusBadge(device)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Autobús</span>
                                            <span className="text-gray-800">
                                                {device.linked_bus ? (
                                                    <Link href={`/buses/${device.linked_bus.id}`} className="text-blue-600">
                                                        {device.linked_bus.plate}
                                                    </Link>
                                                ) : 'Sin vincular'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Última conexión</span>
                                            <span className="text-gray-800">{timeAgo(device.last_seen_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => handleToggle(device)}
                                            className={`px-3 py-1.5 rounded text-sm ${device.is_active
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {device.is_active ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(device)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {devices.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay dispositivos registrados.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {devices.last_page > 1 && (
                            <div className="flex justify-center mt-6 gap-2 pb-4">
                                {Array.from({ length: devices.last_page }, (_, i) => (
                                    <Link
                                        key={i + 1}
                                        href={`/devices?filter=${currentFilter}&page=${i + 1}`}
                                        className={`px-3 py-1 rounded ${devices.current_page === i + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
