import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { createTransportUnitIcon } from '@/lib/mapIcons';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createBoardingIcon = (count: number) =>
    L.divIcon({
        className: 'custom-boarding-marker',
        html: `<div class="bg-emerald-500 text-white w-6 h-6 rounded-full shadow border border-white flex items-center justify-center text-xs font-bold">
                 ${count}
               </div>`,
        iconAnchor: [12, 12],
    });

function ChangeView({ path }: { path: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (path.length > 0) {
            map.fitBounds(path);
        }
    }, [path, map]);

    return null;
}

function FocusLiveBus({ bus }: { bus: LiveBus | null }) {
    const map = useMap();

    useEffect(() => {
        if (bus) {
            map.flyTo([bus.latitude, bus.longitude], Math.max(map.getZoom(), 15), {
                duration: 0.8,
            });
        }
    }, [bus, map]);

    return null;
}

interface Bus {
    id: number;
    plate: string;
    model: string;
    route_id: number | null;
    route?: { id: number; name: string };
}

interface LiveBus {
    bus_id: number;
    plate: string;
    model: string;
    route_name: string | null;
    latitude: number;
    longitude: number;
    passenger_count: number;
    event_timestamp: string;
    address: string | null;
}

interface BoardingEvent {
    id: number;
    lat: number;
    lng: number;
    passengers: number;
    timestamp: string;
}

interface Props {
    buses: Bus[];
}

export default function MapsIndex({ buses }: Props) {
    const [mode, setMode] = useState<'live' | 'history'>('live');
    const [liveData, setLiveData] = useState<LiveBus[]>([]);
    const [liveInterval, setLiveInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [selectedLiveBusId, setSelectedLiveBusId] = useState<number | null>(null);

    const [selectedBus, setSelectedBus] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [historyPath, setHistoryPath] = useState<[number, number][]>([]);
    const [historyBoardings, setHistoryBoardings] = useState<BoardingEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');

    const [center, setCenter] = useState<[number, number]>([10.4806, -66.9036]);

    const fetchLiveData = async () => {
        try {
            const res = await axios.get('/maps/live');
            const busesInLive: LiveBus[] = res.data;

            setLiveData(busesInLive);
            setLastRefresh(new Date());
            setSelectedLiveBusId((currentSelectedId) => {
                if (!busesInLive.length) {
                    return null;
                }

                if (currentSelectedId && busesInLive.some((bus) => bus.bus_id === currentSelectedId)) {
                    return currentSelectedId;
                }

                return busesInLive[0].bus_id;
            });

            if (busesInLive.length > 0 && liveData.length === 0) {
                const firstValid = busesInLive.find((bus) => bus.latitude != null && bus.longitude != null);
                if (firstValid) {
                    setCenter([firstValid.latitude, firstValid.longitude]);
                }
            }
        } catch (error) {
            console.error('Error fetching live data', error);
        }
    };

    useEffect(() => {
        if (mode === 'live') {
            fetchLiveData();
            const id = setInterval(fetchLiveData, 15000);
            setLiveInterval(id);
        } else if (liveInterval) {
            clearInterval(liveInterval);
        }

        return () => {
            if (liveInterval) {
                clearInterval(liveInterval);
            }
        };
    }, [mode]);

    const fetchHistoryData = async (e: React.FormEvent) => {
        e.preventDefault();
        setHistoryError('');

        if (!selectedBus || !startTime || !endTime) {
            setHistoryError('Por favor complete todos los campos.');
            return;
        }

        setLoadingHistory(true);
        try {
            const res = await axios.get('/maps/history', {
                params: {
                    bus_id: selectedBus,
                    start_time: startTime,
                    end_time: endTime,
                },
            });

            setHistoryPath(res.data.path);
            setHistoryBoardings(res.data.boardingEvents);
        } catch (error: any) {
            console.error('Error fetching history data', error);
            setHistoryError(error.response?.data?.message || 'Error al cargar el historial. Revise las fechas (max 24h).');
        } finally {
            setLoadingHistory(false);
        }
    };

    const selectedLiveBus = liveData.find((bus) => bus.bus_id === selectedLiveBusId) ?? null;

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mapas Multi-Unidad</h2>}
        >
            <Head title="Mapas" />

            <div className="py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 w-full flex-1 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-96 flex flex-col gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => setMode('live')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'live' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    En Vivo
                                </button>
                                <button
                                    onClick={() => setMode('history')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'history' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Historico
                                </button>
                            </div>

                            {mode === 'live' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Última actualización:</span>
                                        <span className="font-medium text-gray-700">{lastRefresh ? lastRefresh.toLocaleTimeString('es-VE') : '...'}</span>
                                    </div>

                                    {selectedLiveBus && (
                                        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Unidad seleccionada</p>
                                                    <h3 className="mt-1 text-lg font-bold text-gray-900">{selectedLiveBus.plate}</h3>
                                                    <p className="text-sm text-gray-500">{selectedLiveBus.route_name || 'Sin ruta asignada'}</p>
                                                </div>
                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                    En linea
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-2 text-sm text-gray-600">
                                                <p>
                                                    <span className="font-semibold text-gray-800">Dirección:</span>{' '}
                                                    {selectedLiveBus.address || 'Ubicación aproximada sin dirección disponible'}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-gray-800">Coordenadas:</span>{' '}
                                                    {selectedLiveBus.latitude.toFixed(5)}, {selectedLiveBus.longitude.toFixed(5)}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-gray-800">Último reporte:</span>{' '}
                                                    {new Date(selectedLiveBus.event_timestamp).toLocaleString('es-VE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
                                        Unidades Activas ({liveData.length})
                                    </h3>

                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                                        {liveData.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No hay unidades transmitiendo en las ultimas 2 horas.</p>
                                        ) : (
                                            liveData.map((bus) => (
                                                <button
                                                    key={bus.bus_id}
                                                    type="button"
                                                    onClick={() => setSelectedLiveBusId(bus.bus_id)}
                                                    className={`w-full p-3 rounded-lg border text-left transition flex items-start gap-3 ${
                                                        selectedLiveBusId === bus.bus_id
                                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                            : 'bg-gray-50 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/40'
                                                    }`}
                                                >
                                                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full mt-0.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-gray-800 text-sm">{bus.plate}</p>
                                                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{bus.route_name || 'Sin ruta'}</p>
                                                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                                            {bus.address || 'Dirección no disponible todavía'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{new Date(bus.event_timestamp).toLocaleTimeString('es-VE')}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {mode === 'history' && (
                                <form onSubmit={fetchHistoryData} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                                        <select
                                            value={selectedBus}
                                            onChange={(e) => setSelectedBus(e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Seleccione una unidad</option>
                                            {buses.map((bus) => (
                                                <option key={bus.id} value={bus.id}>
                                                    {bus.plate} - {bus.model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                                        <input
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Hasta (Max 24h)</label>
                                        <input
                                            type="datetime-local"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            min={startTime}
                                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    {historyError && (
                                        <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md">
                                            {historyError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loadingHistory}
                                        className="w-full bg-indigo-600 text-white font-medium text-sm py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        {loadingHistory ? 'Cargando...' : 'Buscar Historial'}
                                    </button>

                                    {historyPath.length > 0 && (
                                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                            <p className="text-xs text-emerald-800 font-medium">Resultados encontrados:</p>
                                            <ul className="text-xs text-emerald-700 mt-1 list-disc list-inside">
                                                <li>{historyPath.length} puntos de ruta generados</li>
                                                <li>{historyBoardings.length} eventos de abordaje registrados</li>
                                            </ul>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
                        <MapContainer center={center} zoom={12} scrollWheelZoom={true} className="h-full w-full">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {mode === 'live' && <FocusLiveBus bus={selectedLiveBus} />}

                            {mode === 'live' &&
                                liveData
                                    .filter((bus) => bus.latitude != null && bus.longitude != null)
                                    .map((bus) => (
                                        <Marker
                                            key={`live-${bus.bus_id}`}
                                            position={[bus.latitude, bus.longitude]}
                                            icon={createTransportUnitIcon(bus.plate)}
                                        >
                                            <Popup>
                                                <div className="text-sm">
                                                    <p className="font-bold border-b pb-1 mb-1">{bus.plate}</p>
                                                    <p className="text-gray-600">
                                                        Ruta: <span className="font-medium">{bus.route_name || 'Sin ruta asignada'}</span>
                                                    </p>
                                                    <p className="text-gray-600 mt-1">
                                                        Dirección: <span className="font-medium">{bus.address || 'No disponible'}</span>
                                                    </p>
                                                    <p className="text-gray-600 mt-1">
                                                        Coordenadas:{' '}
                                                        <span className="font-medium">
                                                            {bus.latitude.toFixed(5)}, {bus.longitude.toFixed(5)}
                                                        </span>
                                                    </p>
                                                    <p className="text-gray-600 mt-1">
                                                        Último abordaje:{' '}
                                                        <span className="font-medium text-emerald-600">+{bus.passenger_count} pasajeros</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(bus.event_timestamp).toLocaleString('es-VE')}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                            {mode === 'history' && historyPath.length > 0 && (
                                <>
                                    <Polyline positions={historyPath} pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.7 }} />
                                    <ChangeView path={historyPath} />

                                    <Marker position={historyPath[0]}>
                                        <Popup>Punto de Inicio</Popup>
                                    </Marker>
                                    <Marker position={historyPath[historyPath.length - 1]}>
                                        <Popup>Último Punto</Popup>
                                    </Marker>

                                    {historyBoardings
                                        .filter((event) => event.lat != null && event.lng != null)
                                        .map((event) => (
                                            <Marker
                                                key={`hist-${event.id}`}
                                                position={[event.lat, event.lng]}
                                                icon={createBoardingIcon(event.passengers)}
                                            >
                                                <Popup>
                                                    <div className="text-sm">
                                                        <p className="font-bold text-emerald-600 pb-1 mb-1 border-b">Abordaje</p>
                                                        <p>
                                                            Subieron: <span className="font-bold">{event.passengers}</span> pasajeros
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                </>
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
