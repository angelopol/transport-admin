import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_type: string;
    owner_name: string;
    identification_document: string;
    phone_number: string;
    is_mobile_payment_active: boolean;
    is_transfer_active: boolean;
}

export default function Index({ auth, bankAccounts, flash }: PageProps<{ bankAccounts: any, flash: { success?: string } }>) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta cuenta bancaria?')) {
            destroy(route('bank-accounts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Cuentas Bancarias ({bankAccounts.total})</h2>
                    <Link href={route('bank-accounts.create')} className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nueva Cuenta
                    </Link>
                </div>
            }
        >
            <Head title="Cuentas Bancarias" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm" role="alert">
                            <p>{flash.success}</p>
                        </div>
                    )}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Banco / Cuenta</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Titular</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Cédula/RIF</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Servicios Activos</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {bankAccounts.data.map((account: BankAccount) => (
                                        <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{account.bank_name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{account.account_number || 'Sin número'}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{account.owner_name}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium tracking-wide">
                                                {account.identification_document}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5 align-start items-start">
                                                    {account.is_mobile_payment_active ? (
                                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            Pago Móvil
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                            Sin Pago Móvil
                                                        </span>
                                                    )}
                                                    {account.is_transfer_active ? (
                                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                            Transferencias
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                            Sin Transferencias
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link href={route('bank-accounts.edit', account.id)} className="text-gray-600 hover:text-gray-800">
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(account.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {bankAccounts.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No hay cuentas bancarias registradas. Haz clic en "Nueva Cuenta" para comenzar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {bankAccounts.data.map((account: BankAccount) => (
                                <div key={account.id} className="p-4 border-b border-gray-200 last:border-b-0 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">{account.bank_name}</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Titular</span>
                                            <span className="font-medium text-gray-900">{account.owner_name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Cédula/RIF</span>
                                            <span>{account.identification_document}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Cuenta</span>
                                            <span>{account.account_number || 'Sin número'}</span>
                                        </div>
                                        <div className="col-span-2 mt-1">
                                            <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Servicios Activos</span>
                                            <div className="flex gap-2 flex-wrap">
                                                {account.is_mobile_payment_active ? (
                                                    <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Pago Móvil
                                                    </span>
                                                ) : null}
                                                {account.is_transfer_active ? (
                                                    <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                        Transferencias
                                                    </span>
                                                ) : null}
                                                {!account.is_mobile_payment_active && !account.is_transfer_active && (
                                                    <span className="px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                        Ninguno
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Link
                                            href={route('bank-accounts.edit', account.id)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(account.id)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {bankAccounts.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay cuentas bancarias registradas. Haz clic en "Nueva Cuenta" para comenzar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB for mobile devices */}
            <Link
                href={route('bank-accounts.create')}
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-50"
                aria-label="Agregar Cuenta"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Link>
        </AuthenticatedLayout>
    );
}
