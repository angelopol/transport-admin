import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { User } from '@/types';

interface Route {
    id: number;
    name: string;
}

interface ManualEntry {
    id: number;
    amount: number;
    user_type: string;
    payment_method: string;
    registered_at: string;
    route: Route;
    owner?: User;
}

interface Props {
    entries: {
        data: ManualEntry[];
        links: any[];
    };
}

export default function Index({ entries }: Props) {
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
                        Ingresos
                    </h2>
                    <Link
                        href={route('manual-entries.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Registrar Ingreso
                    </Link>
                </div>
            }
        >
            <Head title="Ingresos" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Ruta</th>
                                        <th className="px-6 py-3">Tipo Usuario</th>
                                        <th className="px-6 py-3">Método Pago</th>
                                        <th className="px-6 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                No hay ingresos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.data.map((entry) => (
                                            <tr key={entry.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {formatDate(entry.registered_at)}
                                                </td>
                                                <td className="px-6 py-4">
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
