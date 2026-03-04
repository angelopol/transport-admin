import { Link, usePage } from '@inertiajs/react';

export default function ReportTabs() {
    const { url } = usePage();

    const tabs = [
        {
            name: 'General (Financiero)',
            href: route('reports.index'),
            active: url === '/reports' || url.startsWith('/reports?'),
            icon: '📊'
        },
        {
            name: 'Calendario de Ingresos',
            href: route('reports.calendar'),
            active: url.startsWith('/reports/calendar'),
            icon: '📅'
        },
        {
            name: 'Espaciado de Unidades',
            href: route('advanced-reports.unit-spacing'),
            active: url.startsWith('/advanced-reports/unit-spacing'),
            icon: '🚌'
        },
        {
            name: 'Pasajeros por Zona',
            href: route('advanced-reports.passengers-area'),
            active: url.startsWith('/advanced-reports/passengers-area'),
            icon: '📍'
        },
        {
            name: 'Tiempos Promedio',
            href: route('advanced-reports.route-times'),
            active: url.startsWith('/advanced-reports/route-times'),
            icon: '⏱️'
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden print:hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href!}
                        className={`flex items-center gap-2 whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 transition-colors ${tab.active
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
