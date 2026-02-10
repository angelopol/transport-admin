import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950 pt-6 sm:pt-0 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" className="text-blue-800" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center mb-8">
                <Link href="/" className="mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-xl">
                        <ApplicationLogo className="h-16 w-16 fill-current text-blue-900" />
                    </div>
                </Link>
                <h1 className="text-3xl font-bold text-white tracking-tight">SIMCI-TU</h1>
                <p className="text-blue-200 mt-2 text-sm">Acceso Administrativo</p>
            </div>

            <div className="relative z-10 w-full overflow-hidden bg-white/95 backdrop-blur-sm px-8 py-8 shadow-2xl sm:max-w-md sm:rounded-2xl border border-white/20">
                {children}
            </div>

            <div className="relative z-10 mt-8 text-center text-xs text-blue-300/60">
                &copy; 2026 Universidad José Antonio Páez
            </div>
        </div>
    );
}
