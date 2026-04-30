import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Session {
    start: string;
    end: string;
}

interface Stop {
    time: string;
    lat: number;
    lon: number;
    passengers: number;
}

interface StopsData {
    date: string;
    total_stops: number;
    stops: Stop[];
}

interface Props {
    busId: number;
    busPlate: string;
}

export default function ConnectionCalendar({ busId, busPlate }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState<Record<string, Session[]>>({});
    const [loadingSessions, setLoadingSessions] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [stopsData, setStopsData] = useState<StopsData | null>(null);
    const [loadingStops, setLoadingStops] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const mapRef = useRef<any>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Fetch sessions for month
    useEffect(() => {
        setLoadingSessions(true);
        setSessions({});
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        fetch(`/buses/${busId}/connections?month=${monthStr}`)
            .then(r => r.ok ? r.json() : {})
            .then(data => setSessions(data))
            .catch(() => {})
            .finally(() => setLoadingSessions(false));
        setSelectedDate(null);
        setStopsData(null);
        setShowMap(false);
    }, [busId, year, month]);

    // Fetch stops when date is selected
    useEffect(() => {
        if (!selectedDate) { setStopsData(null); setShowMap(false); return; }
        setLoadingStops(true);
        setStopsData(null);
        setShowMap(false);
        fetch(`/buses/${busId}/stops?date=${selectedDate}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => setStopsData(data))
            .catch(() => {})
            .finally(() => setLoadingStops(false));
    }, [selectedDate, busId]);

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calendar grid
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const weekDays = ["L","M","X","J","V","S","D"];

    const totalConnectedDays = Object.keys(sessions).length;
    const totalSessions = Object.values(sessions).reduce((a, s) => a + s.length, 0);

    // Color scale for stop markers: green → yellow → red based on passengers
    const markerColor = (passengers: number, max: number) => {
        if (max === 0) return '#3b82f6';
        const ratio = passengers / max;
        if (ratio < 0.33) return '#22c55e';
        if (ratio < 0.66) return '#f59e0b';
        return '#ef4444';
    };
    const maxPassengers = stopsData ? Math.max(...stopsData.stops.map(s => s.passengers), 1) : 1;
    const stopsWithCoords = stopsData?.stops.filter(s => s.lat && s.lon) ?? [];
    const mapCenter: [number, number] = stopsWithCoords.length > 0
        ? [stopsWithCoords.reduce((a, s) => a + s.lat, 0) / stopsWithCoords.length,
           stopsWithCoords.reduce((a, s) => a + s.lon, 0) / stopsWithCoords.length]
        : [10.48, -66.87];

    return (
        <div className="flex flex-col gap-4">
            {/* Navigation & Stats */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-base font-bold text-gray-800 min-w-[160px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
                    {loadingSessions ? (
                        <span className="animate-pulse text-blue-500">Cargando...</span>
                    ) : (
                        <>
                            <span><span className="font-semibold text-gray-800">{totalConnectedDays}</span> días activos</span>
                            <span className="text-gray-300">|</span>
                            <span><span className="font-semibold text-gray-800">{totalSessions}</span> sesiones</span>
                        </>
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {weekDays.map(d => (
                        <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 bg-white">
                    {days.map((day, index) => {
                        if (day === null) return <div key={`e-${index}`} className="min-h-[56px] sm:min-h-[72px] border-b border-r border-gray-100 bg-gray-50/30" />;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const daySessions = sessions[dateStr] || [];
                        const hasConnections = daySessions.length > 0;
                        const isSelected = selectedDate === dateStr;
                        return (
                            <div
                                key={day}
                                onClick={() => hasConnections && setSelectedDate(isSelected ? null : dateStr)}
                                className={[
                                    "min-h-[56px] sm:min-h-[72px] p-1.5 sm:p-2 border-b border-r border-gray-100 transition-all",
                                    hasConnections ? "cursor-pointer hover:bg-blue-50" : "",
                                    isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-400" : "",
                                ].join(" ")}
                            >
                                <span className={`text-xs sm:text-sm font-medium leading-none ${hasConnections ? "text-gray-900" : "text-gray-400"}`}>{day}</span>
                                {hasConnections && (
                                    <div className="mt-1">
                                        <span className="inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 border border-green-200 leading-tight">
                                            <span className="sm:hidden">{daySessions.length}s</span>
                                            <span className="hidden sm:inline">{daySessions.length} {daySessions.length === 1 ? "sesión" : "sesiones"}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty state */}
            {!loadingSessions && Object.keys(sessions).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    No hay conexiones registradas en este mes
                </div>
            )}

            {/* Selected day detail */}
            {selectedDate && sessions[selectedDate] && (
                <div className="space-y-4">
                    {/* Sessions */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-3 text-sm">
                            Conexiones del {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sessions[selectedDate].map((session, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                        <span className="text-sm font-medium text-gray-700">Sesión {idx + 1}</span>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 shrink-0">
                                        {session.start.slice(0, 5)} – {session.end.slice(0, 5)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stops Section */}
                    <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                        {/* Stops Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-semibold text-amber-900 text-sm">Paradas del día</span>
                                {loadingStops && <span className="text-xs text-amber-500 animate-pulse">Calculando...</span>}
                                {stopsData && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                                        {stopsData.total_stops} {stopsData.total_stops === 1 ? 'parada' : 'paradas'}
                                    </span>
                                )}
                            </div>
                            {stopsData && stopsWithCoords.length > 0 && (
                                <button
                                    onClick={() => setShowMap(m => !m)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${showMap ? 'bg-amber-200 text-amber-900 border-amber-300' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                    {showMap ? 'Ocultar mapa' : 'Ver en mapa'}
                                </button>
                            )}
                        </div>

                        {/* Map */}
                        {showMap && stopsWithCoords.length > 0 && (
                            <div className="relative" style={{ height: 240 }}>
                                <MapContainer
                                    key={selectedDate + '-map'}
                                    center={mapCenter}
                                    zoom={14}
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                    ref={mapRef}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {stopsWithCoords.map((stop, i) => (
                                        <CircleMarker
                                            key={i}
                                            center={[stop.lat, stop.lon]}
                                            radius={Math.max(8, Math.min(22, 8 + (stop.passengers / maxPassengers) * 14))}
                                            pathOptions={{
                                                color: '#fff',
                                                weight: 2,
                                                fillColor: markerColor(stop.passengers, maxPassengers),
                                                fillOpacity: 0.9,
                                            }}
                                        >
                                            <Tooltip permanent={stopsWithCoords.length <= 6} direction="top" offset={[0, -8]}>
                                                <div className="text-center leading-tight">
                                                    <div className="font-bold text-xs">{stop.time}</div>
                                                    <div className="text-xs text-gray-600">{stop.passengers} personas</div>
                                                </div>
                                            </Tooltip>
                                        </CircleMarker>
                                    ))}
                                </MapContainer>
                                {/* Legend */}
                                <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-gray-200 shadow-sm text-[10px] space-y-0.5">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Pocos pasajeros</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Moderado</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Alta demanda</div>
                                </div>
                            </div>
                        )}

                        {/* Stops List */}
                        <div className="p-4">
                            {loadingStops && (
                                <div className="text-center py-4 text-sm text-amber-500 animate-pulse">Calculando paradas...</div>
                            )}
                            {!loadingStops && stopsData && stopsData.total_stops === 0 && (
                                <p className="text-sm text-amber-700/70 italic text-center py-2">
                                    No hay eventos de abordaje con coordenadas GPS en este día.
                                </p>
                            )}
                            {!loadingStops && stopsData && stopsData.stops.length > 0 && (
                                <div className="space-y-2">
                                    {stopsData.stops.map((stop, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-amber-100 shadow-sm">
                                            {/* Stop number badge */}
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                                                style={{ backgroundColor: markerColor(stop.passengers, maxPassengers) }}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-semibold text-gray-800">{stop.time}</span>
                                                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                                        {stop.passengers} {stop.passengers === 1 ? 'pasajero' : 'pasajeros'}
                                                    </span>
                                                </div>
                                                {stop.lat && stop.lon && (
                                                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                        {stop.lat.toFixed(5)}, {stop.lon.toFixed(5)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
