import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { User } from '@/types';

interface Route {
    id: number;
    name: string;
}

interface Bus {
    plate: string;
}

interface ManualEntry {
    id: number;
    amount: number;
    user_type: string;
    payment_method: string;
    registered_at: string;
    route: Route;
    bus?: Bus;
    reference_number?: string;
    identification?: string;
    phone_or_account?: string;
    reference_image_path?: string;
    owner?: User;
}

interface Props {
    entries: {
        data: ManualEntry[];
        links: any[];
    };
    auth: {
        user: User;
    };
}

export default function Index({ entries, auth }: Props) {
    const isOperative = auth?.user?.role === 'operative';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const translateUserType = (type: string) => {
        const types: Record<string, string> = {
            general: 'General',
            student: 'Estudiante',
            senior: 'Adulto Mayor',
            disabled: 'Discapacitado',
        };
        return types[type] || type;
    };

    const translatePaymentMethod = (method: string) => {
        const methods: Record<string, string> = {
            cash: 'Efectivo',
            digital: 'Digital',
        };
        return methods[method] || method;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {isOperative ? 'Pasaje' : 'Ingresos'}
                    </h2>
                    <Link
                        href={route('manual-entries.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {isOperative ? 'Registrar Pasaje' : 'Registrar Ingreso'}
                    </Link>
                </div>
            }
        >
            <Head title={isOperative ? 'Pasaje' : 'Ingresos'} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método Pago</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles Ref.</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {entries.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                No hay ingresos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.data.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                                                    {formatDate(entry.registered_at)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {entry.bus?.plate || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {entry.route?.name || 'Ruta eliminada'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${entry.user_type === 'general' ? 'bg-gray-100 text-gray-800' : ''}
                                                        ${entry.user_type === 'student' ? 'bg-blue-100 text-blue-800' : ''}
                                                        ${entry.user_type === 'senior' ? 'bg-purple-100 text-purple-800' : ''}
                                                        ${entry.user_type === 'disabled' ? 'bg-orange-100 text-orange-800' : ''}
                                                    `}>
                                                        {translateUserType(entry.user_type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${entry.payment_method === 'cash' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}
                                                    `}>
                                                        {translatePaymentMethod(entry.payment_method)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {entry.reference_number && <div><span className="font-semibold">Ref:</span> {entry.reference_number}</div>}
                                                    {entry.identification && <div><span className="font-semibold">C.I:</span> {entry.identification}</div>}
                                                    {entry.phone_or_account && <div><span className="font-semibold">Tel/Cta:</span> {entry.phone_or_account}</div>}
                                                    {!entry.reference_number && !entry.identification && !entry.phone_or_account && <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {entry.reference_image_path ? (
                                                        <a href={`/storage/${entry.reference_image_path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                                                            Ver Adjunto
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                    {formatCurrency(Number(entry.amount))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination would go here */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
