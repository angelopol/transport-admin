import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

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

interface Bus {
    id: number;
    plate: string;
    model: string | null;
    device_mac: string;
    capacity: number;
    is_active: boolean;
    last_seen_at: string | null;
    owner?: { name: string };
    route?: {
        name: string, origin: string, destination: string, fare: number,
        fare_student?: number, fare_senior?: number, fare_disabled?: number,
        is_student_percentage?: boolean, is_senior_percentage?: boolean, is_disabled_percentage?: boolean
    };
    drivers?: { name: string }[];
    collectors?: { name: string }[];
    mobile_payment_account?: BankAccount | null;
    transfer_account?: BankAccount | null;
}

interface PaginatedBuses {
    data: Bus[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    buses: PaginatedBuses;
    isAdmin: boolean;
}

export default function Index({ buses, isAdmin }: Props) {
    const [selectedBusForPoster, setSelectedBusForPoster] = useState<Bus | null>(null);
    const posterRef = useRef<HTMLDivElement>(null);

    const handleDelete = (bus: Bus) => {
        if (confirm(`¿Eliminar la unidad ${bus.plate}? Esta acción no se puede deshacer.`)) {
            router.delete(`/buses/${bus.id}`);
        }
    };

    const handlePrintPoster = () => {
        if (posterRef.current) {
            const printContents = posterRef.current.innerHTML;
            const originalContents = document.body.innerHTML;

            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore React bindings
        }
    };

    const getCalculatedFare = (baseFare: number, value?: number, isPercentage?: boolean) => {
        if (value === undefined || value === null) return null;
        if (isPercentage) {
            return baseFare * (value / 100);
        }
        return value;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Unidades ({buses.total})
                    </h2>
                    <Link
                        href="/buses/create"
                        className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nueva Unidad
                    </Link>
                </div>
            }
        >
            <Head title="Unidades" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {buses.data.map((bus) => (
                                        <tr key={bus.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/buses/${bus.id}`}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {bus.plate}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{bus.model || '—'}</td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {bus.device_mac}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{bus.route?.name || '—'}</td>
                                            <td className="px-6 py-4 text-gray-600">{bus.drivers?.map(d => d.name).join(', ') || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {bus.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => setSelectedBusForPoster(bus)}
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Cartel de Pagos
                                                </button>
                                                <Link
                                                    href={`/buses/${bus.id}/edit`}
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(bus)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {buses.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No hay unidades registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {buses.data.map((bus) => (
                                <div key={bus.id} className="p-4 border-b border-gray-200 last:border-b-0 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link
                                                href={`/buses/${bus.id}`}
                                                className="text-lg font-bold text-blue-600 block"
                                            >
                                                {bus.plate}
                                            </Link>
                                            <span className="text-sm text-gray-500">{bus.model || 'Modelo no especificado'}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {bus.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Ruta</span>
                                            <span className="text-gray-800">{bus.route?.name || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">Conductor</span>
                                            <span className="text-gray-800">{bus.drivers?.map(d => d.name).join(', ') || '—'}</span>
                                        </div>
                                        <div className="col-span-2 mt-1">
                                            <span className="block text-xs font-semibold text-gray-500 uppercase">MAC</span>
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{bus.device_mac}</code>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => setSelectedBusForPoster(bus)}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-sm hover:bg-indigo-100"
                                        >
                                            Cartel
                                        </button>
                                        <Link
                                            href={`/buses/${bus.id}/edit`}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(bus)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {buses.data.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No hay unidades registradas.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {buses.last_page > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                {Array.from({ length: buses.last_page }, (_, i) => (
                                    <Link
                                        key={i + 1}
                                        href={`/buses?page=${i + 1}`}
                                        className={`px-3 py-1 rounded ${buses.current_page === i + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FAB for mobile devices */}
            <Link
                href="/buses/create"
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-50 text-center"
                aria-label="Nueva Unidad"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Link>

            {/* Payment Poster Modal */}
            <Modal show={selectedBusForPoster !== null} onClose={() => setSelectedBusForPoster(null)} maxWidth="2xl">
                {selectedBusForPoster && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Cartel de Pagos - Unidad {selectedBusForPoster.plate}
                            </h2>
                            <button
                                onClick={() => setSelectedBusForPoster(null)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Printable Area Wrapper */}
                        <div ref={posterRef} className="print:m-0 print:p-0 max-h-[60vh] overflow-y-auto pr-1 print:max-h-none print:overflow-visible print:pr-0">
                            {/* Inner Poster Design */}
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 print:border-none print:shadow-none print:rounded-none">
                                <div className="text-center mb-6 border-b-4 border-blue-600 pb-4">
                                    <h1 className="text-4xl font-extrabold text-blue-900 uppercase tracking-widest mb-1">
                                        Unidad {selectedBusForPoster.plate}
                                    </h1>
                                    {selectedBusForPoster.route && (
                                        <p className="text-2xl font-bold text-gray-700 uppercase">
                                            {selectedBusForPoster.route.name}
                                        </p>
                                    )}
                                </div>

                                {/* Fare Information */}
                                {selectedBusForPoster.route ? (
                                    <div className="mb-6">
                                        <div className="bg-yellow-100 border-l-[12px] border-yellow-400 p-4 rounded-r-lg mb-2 flex justify-between items-center group">
                                            <div>
                                                <h2 className="text-xl font-bold text-yellow-800 uppercase mb-1">Tarifa General</h2>
                                                <p className="text-4xl font-black text-gray-900">
                                                    Bs. {Number(selectedBusForPoster.route.fare).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Special Fares Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedBusForPoster.route.fare_student !== undefined && selectedBusForPoster.route.fare_student !== null && (
                                                <div className="bg-blue-50 border-t-4 border-blue-400 p-3 rounded-b-lg text-center shadow-sm">
                                                    <h3 className="text-sm font-bold text-blue-800 uppercase mb-1">Estudiantes</h3>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        Bs. {Number(getCalculatedFare(selectedBusForPoster.route.fare, selectedBusForPoster.route.fare_student, selectedBusForPoster.route.is_student_percentage)).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedBusForPoster.route.fare_senior !== undefined && selectedBusForPoster.route.fare_senior !== null && (
                                                <div className="bg-emerald-50 border-t-4 border-emerald-400 p-3 rounded-b-lg text-center shadow-sm">
                                                    <h3 className="text-sm font-bold text-emerald-800 uppercase mb-1">Adulto Mayor</h3>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        Bs. {Number(getCalculatedFare(selectedBusForPoster.route.fare, selectedBusForPoster.route.fare_senior, selectedBusForPoster.route.is_senior_percentage)).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedBusForPoster.route.fare_disabled !== undefined && selectedBusForPoster.route.fare_disabled !== null && (
                                                <div className="bg-purple-50 border-t-4 border-purple-400 p-3 rounded-b-lg text-center shadow-sm">
                                                    <h3 className="text-sm font-bold text-purple-800 uppercase mb-1">Discapacitados</h3>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        Bs. {Number(getCalculatedFare(selectedBusForPoster.route.fare, selectedBusForPoster.route.fare_disabled, selectedBusForPoster.route.is_disabled_percentage)).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border-l-[6px] border-red-500 p-3 mb-6">
                                        <p className="text-lg text-red-700 font-bold">Sin tarifa asignada</p>
                                    </div>
                                )}

                                {/* Payment Methods */}
                                <div className="border-[4px] border-gray-800 p-6 rounded-2xl relative mt-8">
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                                        <h2 className="text-2xl font-black text-gray-800 uppercase">Pagos</h2>
                                    </div>

                                    {!(selectedBusForPoster.mobile_payment_account || selectedBusForPoster.transfer_account) ? (
                                        <div className="text-center py-6">
                                            <p className="text-2xl font-bold text-red-600">Solo Efectivo</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 custom-scrollbar">
                                            <div className="grid grid-cols-2 gap-4 pt-4 text-sm sm:text-base min-w-[600px] print:min-w-0">
                                                {/* Mobile Payment */}
                                                {selectedBusForPoster.mobile_payment_account?.is_mobile_payment_active && (
                                                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                                                        <div className="flex items-center mb-3">
                                                            <span className="text-3xl mr-3">📱</span>
                                                            <h3 className="text-xl font-black text-indigo-900 uppercase">Pago Móvil</h3>
                                                        </div>
                                                        <div className="space-y-2 font-medium">
                                                            <div className="flex justify-between border-b border-indigo-200 pb-1">
                                                                <span className="text-gray-600">Banco:</span>
                                                                <span className="font-bold text-gray-900">{selectedBusForPoster.mobile_payment_account.bank_name}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-indigo-200 pb-1">
                                                                <span className="text-gray-600">Teléfono:</span>
                                                                <span className="font-black text-indigo-700 tracking-wider">
                                                                    {selectedBusForPoster.mobile_payment_account.phone_number.replace(/(\d{4})(\d{7})/, '$1-$2')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-indigo-200 pb-1">
                                                                <span className="text-gray-600">CI/RIF:</span>
                                                                <span className="font-bold text-gray-900">{selectedBusForPoster.mobile_payment_account.identification_document}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Transfers */}
                                                {selectedBusForPoster.transfer_account?.is_transfer_active && (
                                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                                        <div className="flex items-center mb-3">
                                                            <span className="text-3xl mr-3">🏦</span>
                                                            <h3 className="text-xl font-black text-blue-900 uppercase">Transferencia</h3>
                                                        </div>
                                                        <div className="space-y-2 font-medium">
                                                            <div className="flex justify-between border-b border-blue-200 pb-1">
                                                                <span className="text-gray-600">Banco:</span>
                                                                <span className="font-bold text-gray-900">{selectedBusForPoster.transfer_account.bank_name}</span>
                                                            </div>
                                                            <div className="flex flex-col border-b border-blue-200 pb-1">
                                                                <span className="text-gray-600 mb-0.5">Cuenta:</span>
                                                                <span className="font-black text-blue-700 tracking-wider break-all text-sm leading-tight text-right">
                                                                    {selectedBusForPoster.transfer_account.account_number}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-blue-200 pb-1 mt-1">
                                                                <span className="text-gray-600">CI/RIF:</span>
                                                                <span className="font-bold text-gray-900">{selectedBusForPoster.transfer_account.identification_document}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-6 flex justify-end gap-3 print:hidden">
                            <button
                                onClick={() => setSelectedBusForPoster(null)}
                                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={handlePrintPoster}
                                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir / Descargar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Print Styles applied globally so it only triggers on inner content */}
            <style>{`
                @media print {
                    @page { size: portrait; margin: 0; }
                    body * {
                        visibility: hidden;
                    }
                    .print\\:m-0, .print\\:m-0 * {
                        visibility: visible;
                    }
                    .print\\:m-0 {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
