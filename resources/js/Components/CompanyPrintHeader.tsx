import { usePage } from '@inertiajs/react';

/**
 * Reusable company header for print views and PDF exports.
 * Renders the company logo, name and RIF if they are configured.
 * Hidden on screen, only visible when printing (print:block).
 */
export default function CompanyPrintHeader({ className = '' }: { className?: string }) {
    const user = usePage().props.auth.user as any;

    if (!user.company_name && !user.company_logo_path) {
        return null;
    }

    return (
        <div className={`text-center mb-4 pb-3 border-b border-gray-300 ${className}`}>
            {user.company_logo_path && (
                <img
                    src={`/storage/${user.company_logo_path}`}
                    alt="Logo Empresa"
                    className="h-16 object-contain mx-auto mb-2"
                />
            )}
            {user.company_name && (
                <h2 className="text-xl font-black text-gray-800 uppercase leading-tight tracking-wide">
                    {user.company_name}
                </h2>
            )}
            {user.rif && (
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    {user.rif}
                </p>
            )}
        </div>
    );
}

/**
 * Returns company info lines for CSV export headers.
 */
export function getCompanyCsvHeader(user: any): string {
    let header = '';
    if (user.company_name) {
        header += `Empresa:,${user.company_name}\n`;
    }
    if (user.rif) {
        header += `RIF:,${user.rif}\n`;
    }
    if (header) {
        header += '\n';
    }
    return header;
}
