import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Reportes Avanzados</h2>}
        >
            <Head title="Reportes Avanzados" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Comparative Report */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow border border-indigo-100">
                            <div className="p-6">
                                <div className="text-4xl mb-4">📊</div>
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Comparativo de Unidades</h3>
                                <p className="text-indigo-800 text-sm mb-4">
                                    Visualiza y compara el rendimiento, ingresos y evasión entre todas las unidades operativas durante el mes actual.
                                </p>
                                <Link
                                    href={route('advanced-reports.comparative')}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
                                >
                                    Ver Reporte <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Unit Spacing Report */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="text-4xl mb-4">⏱️</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Espaciado de Unidades</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Analiza la distancia y el tiempo entre las unidades activas en tiempo real para una ruta específica.
                                    Ideal para detectar aglomeraciones o baches en el servicio.
                                </p>
                                <Link
                                    href={route('advanced-reports.unit-spacing')}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                >
                                    Ver Reporte <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Passengers per Area Report */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="text-4xl mb-4">🗺️</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Pasajeros por Zona</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Selecciona un área en el mapa para descubrir cuántos pasajeros abordan en esa zona específica.
                                    Útil para identificar paradas de alta demanda.
                                </p>
                                <Link
                                    href={route('advanced-reports.passengers-area')}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                >
                                    Ver Reporte <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Route Times Report */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="text-4xl mb-4">⏳</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Tiempos de Ruta</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Observa el tiempo promedio estimado que le toma a las unidades completar sus recorridos a lo largo del día, segmentado por rutas.
                                </p>
                                <Link
                                    href={route('advanced-reports.route-times')}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                >
                                    Ver Reporte <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
