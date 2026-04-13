import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Modal from '@/Components/Modal';
import PaymentPosterModal, { PaymentPosterBus } from '@/Components/PaymentPosterModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createTransportUnitIcon } from '@/lib/mapIcons';

// Fix for default Leaflet icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Bus extends PaymentPosterBus {
    id: number;
    plate: string;
    model: string | null;
    device_mac: string;
    capacity: number;
    api_token: string;
    is_active: boolean;
    last_seen_at: string | null;
    last_latitude: number | null;
    last_longitude: number | null;
    owner?: { name: string; email: string };
    driver?: { name: string; phone: string };
}

interface TelemetryEvent {
    id: number;
    event_timestamp: string;
    passenger_count: number;
    latitude: number | null;
    longitude: number | null;
    location_source: string | null;
}

interface TodayStats {
    passengers: number;
    revenue: number;
}

interface Props {
    bus: Bus;
    recentEvents: TelemetryEvent[];
    todayStats: TodayStats;
    isAdmin: boolean;
}

export default function Show({ bus, recentEvents, todayStats, isAdmin }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [showPoster, setShowPoster] = useState(false);
    const [liveLocation, setLiveLocation] = useState<{lat: number, lng: number, timestamp: string} | null>(
        bus.last_latitude && bus.last_longitude 
            ? { lat: Number(bus.last_latitude), lng: Number(bus.last_longitude), timestamp: bus.last_seen_at || '' } 
            : null
    );

    // Live Tracking Polling
    useEffect(() => {
        const fetchLiveLocation = async () => {
            try {
                const response = await fetch('/maps/live');
                if (response.ok) {
                    const data = await response.json();
                    const busLive = data.find((b: any) => b.bus_id === bus.id);
                    if (busLive && busLive.latitude && busLive.longitude) {
                        setLiveLocation({
                            lat: Number(busLive.latitude),
                            lng: Number(busLive.longitude),
                            timestamp: busLive.event_timestamp
                        });
                    }
                }
            } catch (error) {
                console.error("Error polling live location", error);
            }
        };

        const interval = setInterval(fetchLiveLocation, 15000); // 15 seconds
        return () => clearInterval(interval);
    }, [bus.id]);

    const formatCurrency = (amount: number | string) => {
        const numericAmount = Number(amount) || 0;
        return `Bs. ${new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericAmount)}`;
    };

    const openMapModal = (event: TelemetryEvent) => {
        setSelectedEvent(event);
        setIsMapModalOpen(true);
    };

    const closeMapModal = () => {
        setIsMapModalOpen(false);
        setTimeout(() => setSelectedEvent(null), 300);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Unidad: {bus.plate}
                    </h2>
                    <div className="flex gap-2 flex-shrink-0">
                        <Link
                            href={`/buses/${bus.id}/edit`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Editar
                        </Link>
                        <Link
                            href="/buses"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Unidad ${bus.plate}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{todayStats.passengers}</div>
                            <div className="text-blue-100 text-sm">Pasajeros Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{formatCurrency(todayStats.revenue)}</div>
                            <div className="text-green-100 text-sm">Ingresos Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="text-3xl font-bold">{bus.capacity}</div>
                            <div className="text-purple-100 text-sm">Capacidad</div>
                        </div>
                    </div>

                    {/* Live Location Map Card */}
                    {liveLocation && (
                        <div className="bg-white rounded-xl shadow-lg border-2 border-green-500 overflow-hidden">
                            <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Ubicación en Tiempo Real
                                </h3>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-green-600 font-medium">
                                        Actualizado: {new Date(liveLocation.timestamp).toLocaleTimeString('es-VE')}
                                    </span>
                                    {Math.abs(new Date().getTime() - new Date(liveLocation.timestamp).getTime()) > 600000 && (
                                        <span className="text-[10px] text-amber-600 font-bold uppercase">Señal demorada</span>
                                    )}
                                </div>
                            </div>
                            <div className="h-64 w-full relative z-0">
                                <MapContainer 
                                    center={[liveLocation.lat, liveLocation.lng]} 
                                    zoom={15} 
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                                    key={`live-map-${liveLocation.lat}-${liveLocation.lng}`}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker 
                                        position={[liveLocation.lat, liveLocation.lng]}
                                        icon={createTransportUnitIcon(bus.plate)}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="font-bold">{bus.plate}</p>
                                                <p className="text-xs text-gray-500">{new Date(liveLocation.timestamp).toLocaleString('es-VE')}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}

                    {/* Bus Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Información de la Unidad</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Última Señal</dt>
                                <dd className="font-medium">
                                    {bus.last_seen_at ? new Date(bus.last_seen_at).toLocaleString('es-VE') : 'Nunca'}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Ubicación GPS</dt>
                                <dd className="text-sm font-mono text-gray-600">
                                    {bus.last_latitude ? `${Number(bus.last_latitude).toFixed(5)}, ${Number(bus.last_longitude).toFixed(5)}` : 'No disponible'}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Placa</dt>
                                <dd className="font-medium">{bus.plate}</dd>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Modelo</dt>
                                <dd>{bus.model || '—'}</dd>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Dispositivo</dt>
                                <dd>{bus.device_mac
                                    ? <code className="bg-gray-100 px-2 py-1 rounded text-sm">{bus.device_mac}</code>
                                    : <span className="text-gray-400">Sin dispositivo</span>
                                }</dd>
                            </div>
                            <div className="flex justify-between border-b pb-2 items-center">
                                <dt className="text-gray-500">Ruta</dt>
                                <dd className="flex items-center gap-2">
                                    <span>{bus.route?.name || '—'}</span>
                                    {bus.route && (
                                        <button
                                            onClick={() => setShowPoster(true)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                                            title="Ver cartel de pagos"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Cartel de Pagos
                                        </button>
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Conductor</dt>
                                <dd>{bus.driver?.name || '—'}</dd>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <dt className="text-gray-500">Estado</dt>
                                <dd>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bus.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {bus.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Recent Events */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Eventos Recientes</h3>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasajeros</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm">
                                                {new Date(event.event_timestamp).toLocaleString('es-VE')}
                                            </td>
                                            <td className="px-6 py-3 font-medium">{event.passenger_count}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">
                                                {event.latitude && event.longitude ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>{`${Number(event.latitude).toFixed(4)}, ${Number(event.longitude).toFixed(4)}`}</span>
                                                        <button 
                                                            onClick={() => openMapModal(event)}
                                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                                                            title="Ver en mapa"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{event.location_source || '—'}</td>
                                        </tr>
                                    ))}
                                    {recentEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Sin eventos registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cartel de Pagos Modal */}
            <PaymentPosterModal bus={showPoster ? bus : null} onClose={() => setShowPoster(false)} />

            {/* Modal de Mapa */}
            <Modal show={isMapModalOpen} onClose={closeMapModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Ubicación del evento
                        </h2>
                        <button onClick={closeMapModal} className="text-gray-400 hover:text-gray-500 rounded-lg p-1 hover:bg-gray-100 transition-colors">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {selectedEvent && selectedEvent.latitude && selectedEvent.longitude ? (
                        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
                            <MapContainer 
                                center={[Number(selectedEvent.latitude), Number(selectedEvent.longitude)]} 
                                zoom={16} 
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%', zIndex: 1 }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[Number(selectedEvent.latitude), Number(selectedEvent.longitude)]}>
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-semibold mb-1">Pasajeros abordados: {selectedEvent.passenger_count}</p>
                                            <p className="text-xs text-gray-500">Hora: {new Date(selectedEvent.event_timestamp).toLocaleTimeString('es-VE')}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <div className="h-96 w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">No hay datos de ubicación disponibles para este evento.</p>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={closeMapModal}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-300"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
