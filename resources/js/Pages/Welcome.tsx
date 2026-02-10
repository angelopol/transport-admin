import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Sistema Inteligente de Monitoreo - Transporte Urbano" />

            <div className="bg-gray-50 text-black/90 dark:bg-gray-900 dark:text-white/90 min-h-screen flex flex-col items-center justify-center selection:bg-blue-500 selection:text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
                    </svg>
                </div>

                <div className="relative z-10 w-full max-w-7xl px-6 lg:px-8">
                    <header className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="" className="h-8 w-auto hidden" /> {/* Placeholder for logo if needed */}
                            <span className="text-2xl font-bold tracking-tight text-blue-800 dark:text-blue-400">
                                SIMCI-TU
                            </span>
                        </div>

                        <nav className="flex gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                                >
                                    Panel Administrativo
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="px-5 py-2.5 rounded-full bg-white text-gray-900 font-medium border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 transition shadow-sm"
                                >
                                    Acceso Operadores
                                </Link>
                            )}
                        </nav>
                    </header>

                    <main className="mt-12 lg:mt-20 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6 dark:bg-blue-900/30 dark:text-blue-300">
                            Proyecto de Grado - Ingeniería en Computación UJAP 2025 - 2026
                        </span>

                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                            Sistema Inteligente de Monitoreo <br />
                            <span className="text-blue-600 dark:text-blue-400">y Control de Ingresos</span>
                        </h1>

                        <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                            Solución tecnológica integral para el transporte urbano que combate la fuga de ingresos y optimiza la gestión operativa.
                            Integra <strong>Visión por Computador</strong>, <strong>Geolocalización (GPS)</strong> e <strong>Internet de las Cosas (IoT)</strong> para garantizar la trazabilidad total del servicio.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16 text-left">
                            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border-t-4 border-blue-500 hover:shadow-lg transition">
                                <div className="text-3xl mb-3">👁️</div>
                                <h3 className="text-lg font-bold mb-2">Visión Artificial</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Conteo automático de pasajeros de alta precisión utilizando algoritmos de Deep Learning y AWS Rekognition.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border-t-4 border-green-500 hover:shadow-lg transition">
                                <div className="text-3xl mb-3">📍</div>
                                <h3 className="text-lg font-bold mb-2">Geolocalización</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Monitoreo en tiempo real de la ubicación de la flota y análisis de afluencia por zonas geográficas.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border-t-4 border-purple-500 hover:shadow-lg transition">
                                <div className="text-3xl mb-3">📱</div>
                                <h3 className="text-lg font-bold mb-2">Control de Ingresos</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Auditoría digital de Pagos Móviles y efectivo. Validación de tarifas subsidiadas (estudiantes, tercera edad).
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border-t-4 border-orange-500 hover:shadow-lg transition">
                                <div className="text-3xl mb-3">📊</div>
                                <h3 className="text-lg font-bold mb-2">Gestión Gerencial</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Reportes estadísticos en Excel/PDF sobre rentabilidad, frecuencia de rutas y desempeño de conductores.
                                </p>
                            </div>
                        </div>
                    </main>

                    <footer className="mt-20 py-8 border-t border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Autor: Angelo Polgrossi | Tutor: Manuel Figueira</p>
                        <p className="text-sm text-gray-400 mt-2">Universidad José Antonio Páez - Facultad de Ingeniería</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
