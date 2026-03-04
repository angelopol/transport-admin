import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Rectangle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix for default leaflet icons in React
import ReportTabs from '@/Components/ReportTabs';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
});

interface Stats {
    total_passengers: number;
    total_events: number;
    average_passengers_per_stop: number;
}

interface Bounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

interface TelemetryEvent {
    id: number;
    bus_id: number;
    latitude: number;
    longitude: number;
    passenger_count: number;
    event_timestamp: string;
    bus?: {
        id: number;
        plate: string;
    };
}

interface Props {
    stats: Stats;
    selectedDate: string;
    bounds: Bounds | null;
    events?: TelemetryEvent[];
}

function AreaSelector({
    onSelectionChange
}: {
    onSelectionChange: (bounds: L.LatLngBounds) => void
}) {
    const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
    const [currentPoint, setCurrentPoint] = useState<L.LatLng | null>(null);

    const map = useMapEvents({
        mousedown: (e) => {
            setStartPoint(e.latlng);
            setCurrentPoint(e.latlng);
            map.dragging.disable();
        },
        mousemove: (e) => {
            if (startPoint) {
                setCurrentPoint(e.latlng);
            }
        },
        mouseup: () => {
            if (startPoint && currentPoint) {
                const bounds = L.latLngBounds(startPoint, currentPoint);
                onSelectionChange(bounds);
                setStartPoint(null);
                setCurrentPoint(null);
                map.dragging.enable();
            }
        }
    });

    if (startPoint && currentPoint) {
        return <Rectangle bounds={L.latLngBounds(startPoint, currentPoint)} pathOptions={{ color: '#4f46e5', weight: 2, fillOpacity: 0.2 }} />;
    }

    return null;
}


export default function PassengersPerArea({ stats, selectedDate, bounds, events = [] }: Props) {
    const [date, setDate] = useState(selectedDate);
    const [activeBounds, setActiveBounds] = useState<Bounds | null>(bounds);

    // Default center to Venezuela. Ideally this should come from config.
    const center = [10.4806, -66.9036] as [number, number];

    const applyFilters = useCallback((newDate: string, newBounds: Bounds | null) => {
        const params: any = { date: newDate };
        if (newBounds) {
            params.bounds = newBounds;
        }
        router.get(route('advanced-reports.passengers-area'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDate(newDate);
        applyFilters(newDate, activeBounds);
    };

    const handleMapSelection = (leafletBounds: L.LatLngBounds) => {
        const newBounds = {
            minLat: leafletBounds.getSouth(),
            maxLat: leafletBounds.getNorth(),
            minLng: leafletBounds.getWest(),
            maxLng: leafletBounds.getEast(),
        };
        setActiveBounds(newBounds);
    };

    const applyMapFilter = () => {
        applyFilters(date, activeBounds);
    };

    const clearMapFilter = () => {
        setActiveBounds(null);
        applyFilters(date, null);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "=== REPORTE DE PASAJEROS POR ZONA ===\n";
        csvContent += `Fecha:,${date}\n`;
        csvContent += `Filtro de Mapa:,${activeBounds ? 'Activo' : 'Inactivo'}\n\n`;

        csvContent += "Metricas\n";
        csvContent += `Total Pasajeros:,${stats.total_passengers}\n`;
        csvContent += `Eventos Reportados:,${stats.total_events}\n`;
        csvContent += `Promedio abordaje:,${stats.average_passengers_per_stop}\n\n`;

        if (events && events.length > 0) {
            csvContent += "=== DETALLE DE EVENTOS ===\n";
            csvContent += "Hora,Unidad,Pasajeros abordados,Latitud,Longitud\n";
            events.forEach(ev => {
                const timeStr = new Date(ev.event_timestamp).toLocaleTimeString();
                const plate = ev.bus ? ev.bus.plate : 'N/A';
                csvContent += `${timeStr},${plate},${ev.passenger_count},${ev.latitude},${ev.longitude}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Pasajeros_Zona_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pasajeros por Zona</h2>}
        >
            <Head title="Pasajeros por Zona" />

            <div className="py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">

                    <ReportTabs />

                    {/* Controls & Summary */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg mb-6 flex flex-col lg:flex-row gap-6 justify-between border border-gray-100 print:hidden">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-2/3">
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Total Pasajeros</p>
                                <p className="text-3xl font-black text-indigo-600">{stats.total_passengers}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Eventos Reportados</p>
                                <p className="text-3xl font-black text-blue-600">{stats.total_events}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Promedio abordaje</p>
                                <p className="text-3xl font-black text-emerald-600">{stats.average_passengers_per_stop}</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-3 lg:w-1/3 justify-center">
                            <div className="flex gap-2 justify-end mb-2">
                                <button onClick={handlePrint} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Imprimir
                                </button>
                                <button onClick={handleExportCSV} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Exportar
                                </button>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha del Reporte:</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={applyMapFilter}
                                    disabled={!activeBounds}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition font-medium text-sm"
                                >
                                    Aplicar Filtro de Mapa
                                </button>
                                <button
                                    onClick={clearMapFilter}
                                    disabled={!activeBounds && !bounds}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition text-sm font-medium"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 flex-1 relative flex flex-col">
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow border border-gray-200 pointer-events-none text-sm font-medium text-gray-700">
                            🖱️ Haz clic y arrastra en el mapa para dibujar un área de búsqueda
                        </div>

                        <div className="flex-1 w-full relative z-0">
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

                                <AreaSelector onSelectionChange={handleMapSelection} />

                                {/* Render active bounds as a persistent rectangle if established */}
                                {activeBounds && (
                                    <Rectangle
                                        bounds={[
                                            [activeBounds.minLat, activeBounds.minLng],
                                            [activeBounds.maxLat, activeBounds.maxLng]
                                        ]}
                                        pathOptions={{ color: '#ef4444', weight: 2, fillOpacity: 0.1, dashArray: '5, 10' }}
                                    />
                                )}

                                {/* Render passenger event markers */}
                                {events && events.map((ev) => (
                                    <Marker key={ev.id} position={[ev.latitude, ev.longitude]}>
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="font-bold border-b pb-1 mb-1">
                                                    Unidad: <span className="text-indigo-600">{ev.bus?.plate || 'Desconocida'}</span>
                                                </p>
                                                <p>Pasajeros abordados: <span className="font-bold text-emerald-600">{ev.passenger_count}</span></p>
                                                <p className="text-gray-500 text-xs mt-1">Hora: {new Date(ev.event_timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
