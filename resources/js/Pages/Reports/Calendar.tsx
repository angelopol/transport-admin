import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import ReportTabs from '@/Components/ReportTabs';

interface CalendarProps extends Record<string, unknown> {
    currentMonth: string; // "YYYY-MM"
    daysMap: Record<string, { income: number; passengers: number }>;
}

export default function CalendarIndex({ auth, currentMonth, daysMap }: PageProps<CalendarProps>) {
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(Number(amount));
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const [yearStr, monthStr] = currentMonth.split('-');
        let year = parseInt(yearStr, 10);
        let month = parseInt(monthStr, 10);

        if (direction === 'prev') {
            month -= 1;
            if (month < 1) {
                month = 12;
                year -= 1;
            }
        } else {
            month += 1;
            if (month > 12) {
                month = 1;
                year += 1;
            }
        }

        const newMonth = `${year}-${String(month).padStart(2, '0')}`;
        // Pass the query parameter explicitly through Inertia's data object instead of Ziggy
        router.get('/reports/calendar', { month: newMonth }, { preserveState: false, preserveScroll: false });
    };

    const navigateToDayReport = (dateString: string) => {
        if (!daysMap[dateString]) return; // Only navigate if there's data
        router.get(route('reports.index', { start_date: dateString, end_date: dateString }));
    };

    // Calendar Generation Logic
    const current = new Date(`${currentMonth}-01T12:00:00`); // Use noon to avoid timezone shift to prev month
    const year = current.getFullYear();
    const month = current.getMonth();

    // First day of target month (0 for Sunday, 1 for Monday...)
    const firstDay = new Date(year, month, 1).getDay();
    // Days in target month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust firstDay because standard JS calendar starts on Sunday (0). We want Monday (1) to be index 0
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const calendarGrid = [];
    let currentDay = 1;

    for (let i = 0; i < 6; i++) { // Max 6 rows in a month
        const week = [];
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startOffset) {
                week.push(null); // Empty cell
            } else if (currentDay > daysInMonth) {
                week.push(null); // Empty cell
            } else {
                week.push(currentDay);
                currentDay++;
            }
        }
        calendarGrid.push(week);
        if (currentDay > daysInMonth) break;
    }

    const monthName = current.toLocaleString('es-VE', { month: 'long', year: 'numeric' });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Calendario de Ingresos
                    </h2>
                </div>
            }
        >
            <Head title="Calendario - Reportes" />

            <div className="py-6 pt-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ReportTabs />

                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Calendar Header Controls */}
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
                            <button
                                onClick={() => handleMonthChange('prev')}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>

                            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">{monthName}</h3>

                            <button
                                onClick={() => handleMonthChange('next')}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>

                        {/* Calendar Grid Container */}
                        <div className="p-6 overflow-x-auto">
                            <div className="min-w-[800px]">
                                <div className="grid grid-cols-7 gap-4 mb-4">
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                                        <div key={day} className="text-center font-bold text-xs text-gray-600 uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {calendarGrid.map((week, wIndex) => (
                                        <div key={`w-${wIndex}`} className="grid grid-cols-7 gap-4">
                                            {week.map((dayNum, dIndex) => {
                                                if (dayNum === null) {
                                                    return <div key={`empty-${wIndex}-${dIndex}`} className="h-32 bg-gray-100/50 rounded-lg border border-transparent"></div>;
                                                }

                                                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                                const dayData = daysMap[dateString];
                                                const isToday = new Date().toISOString().split('T')[0] === dateString;

                                                return (
                                                    <div
                                                        key={dayNum}
                                                        onClick={() => navigateToDayReport(dateString)}
                                                        className={`h-32 p-3 rounded-lg border transition duration-200 flex flex-col 
                                                        ${dayData ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200'}
                                                        ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                                                    `}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                                            ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 bg-white border border-gray-300 shadow-sm'}
                                                        `}>
                                                                {dayNum}
                                                            </span>
                                                            {dayData && (
                                                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                                    Datos
                                                                </span>
                                                            )}
                                                        </div>

                                                        {dayData ? (
                                                            <div className="mt-auto space-y-1">
                                                                <p className="text-xs text-gray-600 font-medium">Ingresos:</p>
                                                                <p className="text-sm font-black text-gray-900 leading-none">
                                                                    {formatCurrency(dayData.income)}
                                                                </p>
                                                                <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 rounded px-1.5 py-1">
                                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                                    {dayData.passengers}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-auto text-center">
                                                                <span className="text-xs text-gray-500 font-semibold tracking-wide">Sin registros</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
