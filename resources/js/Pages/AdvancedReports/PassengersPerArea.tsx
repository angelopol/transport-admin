import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportTabs from '@/Components/ReportTabs';
import CompanyPrintHeader, { getCompanyCsvHeader } from '@/Components/CompanyPrintHeader';
import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, Rectangle, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Stats {
    total_passengers: number;
    total_events: number;
    average_passengers_per_stop: number;
}

interface Bounds {
    minLat: number | string;
    maxLat: number | string;
    minLng: number | string;
    maxLng: number | string;
}

interface NumericBounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

interface TelemetryEvent {
    id: number;
    bus_id: number;
    latitude: number | string;
    longitude: number | string;
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

function normalizeBounds(value: Bounds | null): NumericBounds | null {
    if (!value) {
        return null;
    }

    const minLat = Number(value.minLat);
    const maxLat = Number(value.maxLat);
    const minLng = Number(value.minLng);
    const maxLng = Number(value.maxLng);

    if (![minLat, maxLat, minLng, maxLng].every(Number.isFinite)) {
        return null;
    }

    return { minLat, maxLat, minLng, maxLng };
}

function AreaSelector({
    enabled,
    onSelectionChange,
}: {
    enabled: boolean;
    onSelectionChange: (bounds: L.LatLngBounds) => void;
}) {
    const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
    const [currentPoint, setCurrentPoint] = useState<L.LatLng | null>(null);

    const map = useMapEvents({
        mousedown: (e) => {
            if (!enabled) return;
            setStartPoint(e.latlng);
            setCurrentPoint(e.latlng);
            map.dragging.disable();
        },
        mousemove: (e) => {
            if (!enabled || !startPoint) return;
            setCurrentPoint(e.latlng);
        },
        mouseup: () => {
            if (!enabled || !startPoint || !currentPoint) return;

            const bounds = L.latLngBounds(startPoint, currentPoint);
            onSelectionChange(bounds);
            setStartPoint(null);
            setCurrentPoint(null);
            map.dragging.enable();
        },
    });

    useEffect(() => {
        if (!enabled) {
            setStartPoint(null);
            setCurrentPoint(null);
            map.dragging.enable();
        }
    }, [enabled, map]);

    if (enabled && startPoint && currentPoint) {
        return (
            <Rectangle
                bounds={L.latLngBounds(startPoint, currentPoint)}
                pathOptions={{ color: '#4f46e5', weight: 2, fillOpacity: 0.2 }}
            />
        );
    }

    return null;
}

export default function PassengersPerArea({ stats, selectedDate, bounds, events = [] }: Props) {
    const [date, setDate] = useState(selectedDate);
    const [activeBounds, setActiveBounds] = useState<Bounds | null>(normalizeBounds(bounds));
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const center = [10.4806, -66.9036] as [number, number];
    const safeActiveBounds = normalizeBounds(activeBounds);

    const applyFilters = useCallback((newDate: string, newBounds: Bounds | null) => {
        const params: any = { date: newDate };
        if (newBounds) {
            params.bounds = newBounds;
        }

        router.get(route('advanced-reports.passengers-area'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDate(newDate);
        applyFilters(newDate, safeActiveBounds);
    };

    const handleMapSelection = (leafletBounds: L.LatLngBounds) => {
        const newBounds: Bounds = {
            minLat: leafletBounds.getSouth(),
            maxLat: leafletBounds.getNorth(),
            minLng: leafletBounds.getWest(),
            maxLng: leafletBounds.getEast(),
        };

        setActiveBounds(newBounds);
        setIsSelectionMode(false);
    };

    const applyMapFilter = () => {
        applyFilters(date, safeActiveBounds);
    };

    const clearMapFilter = () => {
        setActiveBounds(null);
        setIsSelectionMode(false);
        applyFilters(date, null);
    };

    const handlePrint = () => {
        window.print();
    };

    const user = usePage().props.auth.user as any;

    const handleExportCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += getCompanyCsvHeader(user);
        csvContent += '=== REPORTE DE PASAJEROS POR ZONA ===\n';
        csvContent += `Fecha:,${date}\n`;
        csvContent += `Filtro de Mapa:,${safeActiveBounds ? 'Activo' : 'Inactivo'}\n\n`;

        csvContent += 'Métricas\n';
        csvContent += `Total Pasajeros:,${stats.total_passengers}\n`;
        csvContent += `Eventos Reportados:,${stats.total_events}\n`;
        csvContent += `Promedio abordaje:,${stats.average_passengers_per_stop}\n\n`;

        if (events.length > 0) {
            csvContent += '=== DETALLE DE EVENTOS ===\n';
            csvContent += 'Hora,Unidad,Pasajeros abordados,Latitud,Longitud\n';
            events.forEach((event) => {
                const timeStr = new Date(event.event_timestamp).toLocaleTimeString();
                const plate = event.bus ? event.bus.plate : 'Sin placa';
                csvContent += `${timeStr},${plate},${event.passenger_count},${event.latitude},${event.longitude}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Reporte_Pasajeros_Zona_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCoordinate = (value: number | string) => {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue.toFixed(5) : 'N/D';
    };

    const formatBounds = (currentBounds: Bounds | null) => {
        const normalized = normalizeBounds(currentBounds);

        if (!normalized) {
            return 'Sin filtro geográfico aplicado';
        }

        return `Lat ${normalized.minLat.toFixed(4)} a ${normalized.maxLat.toFixed(4)} | Lng ${normalized.minLng.toFixed(4)} a ${normalized.maxLng.toFixed(4)}`;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pasajeros por Zona</h2>}
        >
            <Head title="Pasajeros por Zona" />

            <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden py-6">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
                    <ReportTabs />

                    <div className="mb-6 flex flex-col justify-between gap-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm print:hidden lg:flex-row">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:w-2/3">
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-800">Total Pasajeros</p>
                                <p className="text-3xl font-black text-indigo-600">{stats.total_passengers}</p>
                            </div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-800">Eventos Reportados</p>
                                <p className="text-3xl font-black text-blue-600">{stats.total_events}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800">Promedio abordaje</p>
                                <p className="text-3xl font-black text-emerald-600">{stats.average_passengers_per_stop}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center gap-3 lg:w-1/3">
                            <div className="mb-2 flex justify-end gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimir
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Exportar
                                </button>
                            </div>

                            <div>
                                <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
                                    Fecha del Reporte:
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsSelectionMode((current) => !current)}
                                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                                        isSelectionMode
                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {isSelectionMode ? 'Cancelar Selección' : 'Seleccionar Zona'}
                                </button>
                                <button
                                    onClick={applyMapFilter}
                                    disabled={!safeActiveBounds}
                                    className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    Aplicar Filtro
                                </button>
                                <button
                                    onClick={clearMapFilter}
                                    disabled={!safeActiveBounds && !normalizeBounds(bounds)}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 hidden bg-white text-black print:block">
                        <CompanyPrintHeader />
                        <div className="mb-4 border-b border-gray-300 pb-4">
                            <h1 className="text-2xl font-bold">Reporte de Pasajeros por Zona</h1>
                            <p className="mt-1 text-sm">Fecha: {date}</p>
                            <p className="mt-1 text-sm">Filtro geográfico: {formatBounds(activeBounds)}</p>
                        </div>

                        <div className="mb-6 grid grid-cols-3 gap-4">
                            <div className="rounded-lg border border-gray-300 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Total Pasajeros</p>
                                <p className="mt-2 text-2xl font-bold">{stats.total_passengers}</p>
                            </div>
                            <div className="rounded-lg border border-gray-300 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Eventos Reportados</p>
                                <p className="mt-2 text-2xl font-bold">{stats.total_events}</p>
                            </div>
                            <div className="rounded-lg border border-gray-300 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Promedio Abordaje</p>
                                <p className="mt-2 text-2xl font-bold">{stats.average_passengers_per_stop}</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-3 text-lg font-bold">Detalle de eventos</h2>
                            {events.length === 0 ? (
                                <p className="text-sm text-gray-600">No hay eventos registrados para los filtros seleccionados.</p>
                            ) : (
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-left">
                                            <th className="py-2 pr-3">Hora</th>
                                            <th className="py-2 pr-3">Unidad</th>
                                            <th className="py-2 pr-3">Pasajeros</th>
                                            <th className="py-2 pr-3">Latitud</th>
                                            <th className="py-2 pr-3">Longitud</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((event) => (
                                            <tr key={`print-${event.id}`} className="border-b border-gray-200">
                                                <td className="py-2 pr-3">{new Date(event.event_timestamp).toLocaleTimeString('es-VE')}</td>
                                                <td className="py-2 pr-3">{event.bus?.plate || 'Desconocida'}</td>
                                                <td className="py-2 pr-3">{event.passenger_count}</td>
                                                <td className="py-2 pr-3">{formatCoordinate(event.latitude)}</td>
                                                <td className="py-2 pr-3">{formatCoordinate(event.longitude)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm print:hidden">
                        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 transform rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow backdrop-blur">
                            {isSelectionMode
                                ? 'Selección activa: haz clic y arrastra para dibujar el area'
                                : 'Modo navegación: mueve el mapa libremente o activa "Seleccionar Zona"'}
                        </div>

                        <div className="relative z-0 flex-1 w-full">
                            <MapContainer center={center} zoom={12} scrollWheelZoom={true} className="h-full w-full">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <AreaSelector enabled={isSelectionMode} onSelectionChange={handleMapSelection} />

                                {safeActiveBounds && (
                                    <Rectangle
                                        bounds={[
                                            [Number(safeActiveBounds.minLat), Number(safeActiveBounds.minLng)],
                                            [Number(safeActiveBounds.maxLat), Number(safeActiveBounds.maxLng)],
                                        ]}
                                        pathOptions={{ color: '#ef4444', weight: 2, fillOpacity: 0.1, dashArray: '5, 10' }}
                                    />
                                )}

                                {events.map((event) => (
                                    <Marker key={event.id} position={[Number(event.latitude), Number(event.longitude)]}>
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="mb-1 border-b pb-1 font-bold">
                                                    Unidad: <span className="text-indigo-600">{event.bus?.plate || 'Desconocida'}</span>
                                                </p>
                                                <p>
                                                    Pasajeros abordados: <span className="font-bold text-emerald-600">{event.passenger_count}</span>
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Hora: {new Date(event.event_timestamp).toLocaleTimeString('es-VE')}
                                                </p>
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
