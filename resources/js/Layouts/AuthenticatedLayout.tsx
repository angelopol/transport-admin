import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white h-full shadow-2xl z-20">
                <div className="flex items-center justify-center h-16 border-b border-blue-800/50 bg-blue-950/30 backdrop-blur-sm shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-white p-1 rounded-lg">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-blue-900" />
                        </div>
                        <span className="font-bold text-lg tracking-wide">SIMCI-TU</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
                    <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
                        Principal
                    </p>
                    <NavLink href={route('dashboard')} active={route().current('dashboard')} className="w-full">
                        <span className="mr-3">📊</span> Dashboard
                    </NavLink>
                    <NavLink href={route('reports.index')} active={route().current('reports.index')} className="w-full">
                        <span className="mr-3">📈</span> Reportes
                    </NavLink>

                    <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mt-8 mb-2">
                        Administración
                    </p>
                    <NavLink href={route('buses.index')} active={route().current('buses.*')} className="w-full">
                        <span className="mr-3">🚌</span> Autobuses
                    </NavLink>
                    <NavLink href={route('routes.index')} active={route().current('routes.*')} className="w-full">
                        <span className="mr-3">🛣️</span> Rutas
                    </NavLink>
                    <NavLink href={route('drivers.index')} active={route().current('drivers.*')} className="w-full">
                        <span className="mr-3">👔</span> Conductores
                    </NavLink>
                    <NavLink href={route('users.index')} active={route().current('users.*')} className="w-full">
                        <span className="mr-3">👥</span> Usuarios
                    </NavLink>
                    <NavLink href={route('devices.index')} active={route().current('devices.*')} className="w-full">
                        <span className="mr-3">📡</span> Dispositivos
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-blue-800/50 bg-blue-950/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow-lg">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-blue-300 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-blue-900 text-white shadow-md z-10 shrink-0">
                    <div className="flex items-center justify-between px-4 h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                            <span className="font-bold">SIMCI-TU</span>
                        </Link>
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="p-2 rounded-md hover:bg-blue-800 focus:outline-none"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden bg-blue-800 border-t border-blue-700'}>
                        <div className="pt-2 pb-3 space-y-1">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('reports.index')} active={route().current('reports.index')}>Reportes</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('buses.index')} active={route().current('buses.*')}>Autobuses</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('routes.index')} active={route().current('routes.*')}>Rutas</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('drivers.index')} active={route().current('drivers.*')}>Conductores</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('users.index')} active={route().current('users.*')}>Usuarios</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('devices.index')} active={route().current('devices.*')}>Dispositivos</ResponsiveNavLink>
                        </div>
                        <div className="pt-4 pb-1 border-t border-blue-700">
                            <div className="px-4">
                                <div className="font-medium text-base text-white">{user.name}</div>
                                <div className="font-medium text-sm text-blue-200">{user.email}</div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">Cerrar Sesión</ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Top Bar (Desktop) - User Dropdown & Title */}
                <header className="hidden md:flex bg-white shadow-sm h-16 items-center justify-between px-8 z-10 shrink-0">
                    <div className="flex items-center">
                        {header && <div className="text-xl font-bold text-gray-800">{header}</div>}
                    </div>

                    <div className="flex items-center gap-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
                                        {user.name}
                                        <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Cerrar Sesión</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
