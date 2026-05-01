import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

function NavItemLabel({
    icon,
    label,
}: {
    icon: ReactNode;
    label: string;
}) {
    return (
        <span className="inline-flex items-center">
            <span className="mr-3 inline-flex h-4 w-4 items-center justify-center text-blue-200">{icon}</span>
            <span>{label}</span>
        </span>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 print:h-auto print:overflow-visible print:bg-white">
            <aside className="z-20 hidden h-full w-64 flex-col bg-blue-900 text-white shadow-2xl print:hidden md:flex">
                <div className="h-16 shrink-0 border-b border-blue-800/50 bg-blue-950/30 backdrop-blur-sm">
                    <Link href="/" className="flex h-full items-center justify-center gap-2">
                        <div className="rounded-lg bg-white p-1">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-blue-900" />
                        </div>
                        <span className="text-lg font-bold tracking-wide">SIMCI-TU</span>
                    </Link>
                </div>

                <nav className="sidebar-scroll flex-1 space-y-2 overflow-y-auto px-4 py-6">
                    {user.role === 'owner' && (
                        <>
                            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-blue-300">
                                Principal
                            </p>
                            <NavLink href={route('dashboard')} active={route().current('dashboard')} className="w-full">
                                <NavItemLabel
                                    label="Dashboard"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13h6v7H4zm10-9h6v16h-6zM4 4h6v5H4zm10 7h6v5h-6z" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('maps.index')} active={route().current('maps.*')} className="w-full">
                                <NavItemLabel
                                    label="Mapas"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5-2V6l5 2m0 12l6-2m-6 2V8m6 10l5 2V8l-5-2m0 12V6m-6 2l6-2" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink
                                href={route('reports.index')}
                                active={route().current('reports.index') || route().current('advanced-reports.*')}
                                className="w-full"
                            >
                                <NavItemLabel
                                    label="Reportes"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6m4 6V7m4 10V4M5 20h14" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                        </>
                    )}

                    {user.role === 'owner' && (
                        <>
                            <p className="mb-2 mt-8 px-4 text-xs font-semibold uppercase tracking-wider text-blue-300">
                                Administración
                            </p>
                            <NavLink href={route('buses.index')} active={route().current('buses.*')} className="w-full">
                                <NavItemLabel
                                    label="Autobuses"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h8a3 3 0 013 3v7H5V9a3 3 0 013-3zm-1 10v2m10-2v2M7 18h.01M17 18h.01M7 10h10" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('routes.index')} active={route().current('routes.*')} className="w-full">
                                <NavItemLabel
                                    label="Rutas"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6l6 6-6 6" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4m-4 12h4m8-12h4m-4 12h4" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('drivers.index')} active={route().current('drivers.*')} className="w-full">
                                <NavItemLabel
                                    label="Conductores"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14a4 4 0 10-8 0m8 0a4 4 0 11-8 0m8 0v1a2 2 0 002 2h1m-11-3v1a2 2 0 01-2 2H5" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('collectors.index')} active={route().current('collectors.*')} className="w-full">
                                <NavItemLabel
                                    label="Colectores"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.12-3 2.5S10.343 13 12 13s3 1.12 3 2.5S13.657 18 12 18m0-10V6m0 12v-2" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('bank-accounts.index')} active={route().current('bank-accounts.*')} className="w-full">
                                <NavItemLabel
                                    label="Cuentas Bancarias"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-5 9 5M4 10h16v8H4zm3 4h.01M17 14h.01" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('profile.edit')} active={route().current('profile.edit')} className="w-full">
                                <NavItemLabel
                                    label="Ajustes de Empresa"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                        </>
                    )}

                    {user.role !== 'admin' && (
                        <>
                            <p className="mb-2 mt-8 px-4 text-xs font-semibold uppercase tracking-wider text-blue-300">
                                Operaciones
                            </p>
                            <NavLink href={route('manual-entries.index')} active={route().current('manual-entries.*')} className="w-full">
                                <NavItemLabel
                                    label={user.role === 'operative' ? 'Pasaje' : 'Ingresos'}
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.12-3 2.5S10.343 13 12 13s3 1.12 3 2.5S13.657 18 12 18m0-10V6m0 12v-2" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <NavLink href={route('users.index')} active={route().current('users.*')} className="w-full">
                                <NavItemLabel
                                    label="Usuarios"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20a4 4 0 00-8 0m8 0H7m10 0h3m-3-8a4 4 0 10-8 0m8 0a4 4 0 11-8 0m8 0h3m-3-8a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('devices.index')} active={route().current('devices.*')} className="w-full">
                                <NavItemLabel
                                    label="Dispositivos"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6v4H9zm1 4h4v10h-4zm-3 4h10m-7 8h4" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('admin.health')} active={route().current('admin.health')} className="w-full">
                                <NavItemLabel
                                    label="Salud"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h4l2-5 4 10 2-5h6" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                            <NavLink href={route('audit-logs.index')} active={route().current('audit-logs.*')} className="w-full">
                                <NavItemLabel
                                    label="Auditoría"
                                    icon={
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
                                        </svg>
                                    }
                                />
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="shrink-0 border-t border-blue-800/50 bg-blue-950/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold shadow-lg">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-xs text-blue-300">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden print:h-auto print:overflow-visible">
                <header className="z-10 shrink-0 bg-blue-900 text-white shadow-md print:hidden md:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                            <span className="font-bold">SIMCI-TU</span>
                        </Link>
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="rounded-md p-2 hover:bg-blue-800 focus:outline-none"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path
                                    className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' border-t border-blue-700 bg-blue-800 md:hidden'}>
                        <div className="space-y-1 pb-3 pt-2">
                            {user.role === 'owner' && (
                                <>
                                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('maps.index')} active={route().current('maps.*')}>Mapas</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('reports.index')} active={route().current('reports.index') || route().current('advanced-reports.*')}>Reportes</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('buses.index')} active={route().current('buses.*')}>Autobuses</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('routes.index')} active={route().current('routes.*')}>Rutas</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('drivers.index')} active={route().current('drivers.*')}>Conductores</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('collectors.index')} active={route().current('collectors.*')}>Colectores</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('bank-accounts.index')} active={route().current('bank-accounts.*')}>Cuentas Bancarias</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('profile.edit')} active={route().current('profile.edit')}>Ajustes de Empresa</ResponsiveNavLink>
                                </>
                            )}

                            {user.role !== 'admin' && (
                                <ResponsiveNavLink href={route('manual-entries.index')} active={route().current('manual-entries.*')}>
                                    {user.role === 'operative' ? 'Pasaje' : 'Ingresos'}
                                </ResponsiveNavLink>
                            )}

                            {user.role === 'admin' && (
                                <>
                                    <ResponsiveNavLink href={route('users.index')} active={route().current('users.*')}>Usuarios</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('devices.index')} active={route().current('devices.*')}>Dispositivos</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('admin.health')} active={route().current('admin.health')}>Salud</ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('audit-logs.index')} active={route().current('audit-logs.*')}>Auditoría</ResponsiveNavLink>
                                </>
                            )}
                        </div>

                        <div className="border-t border-blue-700 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-white">{user.name}</div>
                                <div className="text-sm font-medium text-blue-200">{user.email}</div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">Cerrar Sesión</ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </header>

                <header className="z-10 hidden h-16 shrink-0 items-center justify-between bg-white px-8 shadow-sm print:hidden md:flex">
                    <div className="flex items-center">
                        {header && <div className="text-xl font-bold text-gray-800">{header}</div>}
                    </div>

                    <div className="flex items-center gap-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                    >
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

                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 scroll-smooth print:h-auto print:overflow-visible print:bg-white md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
