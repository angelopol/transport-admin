import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ' +
                (active
                    ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/30'
                    : 'text-blue-100 hover:bg-blue-800/50 hover:text-white') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
