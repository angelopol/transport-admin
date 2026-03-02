import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
});

// Custom Icons
const createBusIcon = (plate: string) => {
    return L.divIcon({
        className: 'custom-bus-marker',
        html: `<div class="bg-indigo-600 text-white px-2 py-1 rounded-md shadow-lg border-2 border-white text-xs font-bold whitespace-nowrap flex items-center gap-1">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                 ${plate}
               </div>`,
        iconAnchor: [30, 15],
    });
};

const createBoardingIcon = (count: number) => {
    return L.divIcon({
        className: 'custom-boarding-marker',
        html: `<div class="bg-emerald-500 text-white w-6 h-6 rounded-full shadow border border-white flex items-center justify-center text-xs font-bold">
                 ${count}
               </div>`,
        iconAnchor: [12, 12],
    });
};

// Component to handle auto-fitting bounds when path changes
function ChangeView({ path }: { path: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            map.fitBounds(path);
        }
    }, [path, map]);
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

    // Live State
    const [liveData, setLiveData] = useState<LiveBus[]>([]);
    const [liveInterval, setLiveInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // History State
    const [selectedBus, setSelectedBus] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [historyPath, setHistoryPath] = useState<[number, number][]>([]);
    const [historyBoardings, setHistoryBoardings] = useState<BoardingEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');

    // Default center (Caracas, or user's general area)
    const [center, setCenter] = useState<[number, number]>([10.4806, -66.9036]);

    // Fetch Live Data
    const fetchLiveData = async () => {
        try {
            const res = await axios.get('/maps/live');
            setLiveData(res.data);
            setLastRefresh(new Date());

            // Adjust center to first bus if available and we haven't manually moved much (optional)
            if (res.data.length > 0 && liveData.length === 0) {
                const firstValid = res.data.find((b: any) => b.latitude != null && b.longitude != null);
                if (firstValid) {
                    setCenter([firstValid.latitude, firstValid.longitude]);
                }
            }
        } catch (error) {
            console.error("Error fetching live data", error);
        }
    };

    // Manage Live Interval
    useEffect(() => {
        if (mode === 'live') {
            fetchLiveData();
            const id = setInterval(fetchLiveData, 15000); // 15 seconds
            setLiveInterval(id);
        } else {
            if (liveInterval) clearInterval(liveInterval);
        }
        return () => {
            if (liveInterval) clearInterval(liveInterval);
        };
    }, [mode]);

    // Fetch History Data
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
                    end_time: endTime
                }
            });

            setHistoryPath(res.data.path);
            setHistoryBoardings(res.data.boardingEvents);

        } catch (error: any) {
            console.error("Error fetching history data", error);
            setHistoryError(error.response?.data?.message || 'Error al cargar el historial. Revise las fechas (máx 24h).');
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mapas Multi-Unidad</h2>}
        >
            <Head title="Mapas" />

            <div className="py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 w-full flex-1 flex flex-col md:flex-row gap-6">

                    {/* Sidebar / Control Panel */}
                    <div className="w-full md:w-80 flex flex-col gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => setMode('live')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'live' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    🔴 En Vivo
                                </button>
                                <button
                                    onClick={() => setMode('history')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'history' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    ⏪ Histórico
                                </button>
                            </div>

                            {mode === 'live' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Última actualización:</span>
                                        <span className="font-medium text-gray-700">{lastRefresh ? lastRefresh.toLocaleTimeString() : '...'}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Unidades Activas ({liveData.length})</h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                                        {liveData.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No hay unidades transmitiendo en las últimas 2 horas.</p>
                                        ) : (
                                            liveData.map(bus => (
                                                <div key={bus.bus_id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-start gap-3">
                                                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full mt-0.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{bus.plate}</p>
                                                        <p className="text-xs text-gray-500">{bus.route_name || 'Sin ruta'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">🕒 {new Date(bus.event_timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
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
                                            {buses.map(b => (
                                                <option key={b.id} value={b.id}>{b.plate} - {b.model}</option>
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
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Hasta (Máx 24h)</label>
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

                    {/* Map Area */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
                        <MapContainer
                            center={center}
                            zoom={12}
                            scrollWheelZoom={true}
                            className="h-full w-full"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Live Markers */}
                            {mode === 'live' && liveData.filter(bus => bus.latitude != null && bus.longitude != null).map(bus => (
                                <Marker
                                    key={`live-${bus.bus_id}`}
                                    position={[bus.latitude, bus.longitude]}
                                    icon={createBusIcon(bus.plate)}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold border-b pb-1 mb-1">{bus.plate}</p>
                                            <p className="text-gray-600">Ruta: <span className="font-medium">{bus.route_name || 'N/A'}</span></p>
                                            <p className="text-gray-600">Último Abordaje: <span className="font-medium text-emerald-600">+{bus.passenger_count} pasajeros</span></p>
                                            <p className="text-xs text-gray-400 mt-2">🕒 {new Date(bus.event_timestamp).toLocaleString()}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Historical Path and Boardings */}
                            {mode === 'history' && historyPath.length > 0 && (
                                <>
                                    <Polyline
                                        positions={historyPath}
                                        pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.7 }}
                                    />
                                    <ChangeView path={historyPath} />

                                    {/* Start & End markers */}
                                    <Marker position={historyPath[0]}>
                                        <Popup>Punto de Inicio</Popup>
                                    </Marker>
                                    <Marker position={historyPath[historyPath.length - 1]}>
                                        <Popup>Último Punto</Popup>
                                    </Marker>

                                    {/* Boarding events */}
                                    {historyBoardings.filter(ev => ev.lat != null && ev.lng != null).map(ev => (
                                        <Marker
                                            key={`hist-${ev.id}`}
                                            position={[ev.lat, ev.lng]}
                                            icon={createBoardingIcon(ev.passengers)}
                                        >
                                            <Popup>
                                                <div className="text-sm">
                                                    <p className="font-bold text-emerald-600 pb-1 mb-1 border-b">¡Abordaje!</p>
                                                    <p>Subieron: <span className="font-bold">{ev.passengers}</span> pasajeros</p>
                                                    <p className="text-xs text-gray-500 mt-1">🕒 {ev.timestamp}</p>
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
