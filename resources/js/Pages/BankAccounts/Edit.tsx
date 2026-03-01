import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function Edit({ auth, bankAccount }: PageProps<{ bankAccount: any }>) {
    const { data, setData, put, processing, errors } = useForm({
        bank_name: bankAccount.bank_name || '',
        account_number: bankAccount.account_number || '',
        account_type: bankAccount.account_type || '',
        owner_name: bankAccount.owner_name || '',
        identification_document: bankAccount.identification_document || '',
        phone_number: bankAccount.phone_number || '',
        is_mobile_payment_active: bankAccount.is_mobile_payment_active,
        is_transfer_active: bankAccount.is_transfer_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('bank-accounts.update', bankAccount.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Editar Cuenta Bancaria</h2>}>
            <Head title="Editar Cuenta Bancaria" />

            <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 py-8">
                <div className="bg-white overflow-hidden shadow-lg sm:rounded-xl border border-gray-100">
                    <div className="p-6 bg-white">
                        <form onSubmit={submit} className="space-y-6">

                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos del Banco</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="bank_name" value="Nombre del Banco *" />
                                    <TextInput
                                        id="bank_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                        required
                                        placeholder="Ej: Banco de Venezuela"
                                    />
                                    <InputError message={errors.bank_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="account_type" value="Tipo de Cuenta" />
                                    <TextInput
                                        id="account_type"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.account_type}
                                        onChange={(e) => setData('account_type', e.target.value)}
                                        placeholder="Ej: Corriente, Ahorro"
                                    />
                                    <InputError message={errors.account_type} className="mt-2" />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="account_number" value="Número de Cuenta (20 dígitos)" />
                                    <TextInput
                                        id="account_number"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.account_number}
                                        onChange={(e) => setData('account_number', e.target.value)}
                                        placeholder="01020000000000000000"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Requerido si se usará para Transferencias.</p>
                                    <InputError message={errors.account_number} className="mt-2" />
                                </div>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8">Datos del Titular</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="owner_name" value="Nombre o Razón Social *" />
                                    <TextInput
                                        id="owner_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.owner_name}
                                        onChange={(e) => setData('owner_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.owner_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="identification_document" value="Cédula o RIF *" />
                                    <TextInput
                                        id="identification_document"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.identification_document}
                                        onChange={(e) => setData('identification_document', e.target.value)}
                                        required
                                        placeholder="V-12345678 / J-12345678-9"
                                    />
                                    <InputError message={errors.identification_document} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone_number" value="Número de Teléfono" />
                                    <TextInput
                                        id="phone_number"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        placeholder="Ej: 0414-1234567"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Requerido si se usará para Pago Móvil.</p>
                                    <InputError message={errors.phone_number} className="mt-2" />
                                </div>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8">Servicios Activos</h3>
                            <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_mobile_payment_active"
                                        checked={data.is_mobile_payment_active}
                                        onChange={(e) => setData('is_mobile_payment_active', e.target.checked)}
                                    />
                                    <span className="ms-3 text-sm font-medium text-gray-700 font-bold">Activar para Pago Móvil</span>
                                </label>
                                <p className="text-sm text-gray-500 ml-8 mb-2">Requiere Teléfono, Cédula/RIF y Banco.</p>

                                <label className="flex items-center mt-4">
                                    <Checkbox
                                        name="is_transfer_active"
                                        checked={data.is_transfer_active}
                                        onChange={(e) => setData('is_transfer_active', e.target.checked)}
                                    />
                                    <span className="ms-3 text-sm font-medium text-gray-700 font-bold">Activar para Transferencias</span>
                                </label>
                                <p className="text-sm text-gray-500 ml-8">Requiere Número de Cuenta (20 dígitos), Cédula/RIF, Titular y Banco.</p>
                            </div>

                            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                                <Link href={route('bank-accounts.index')} className="text-gray-600 hover:text-gray-900 mr-4 font-medium transition">
                                    Cancelar
                                </Link>
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Actualizar Cuenta
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
