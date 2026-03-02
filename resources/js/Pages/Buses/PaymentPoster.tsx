import { Head } from '@inertiajs/react';

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
    route?: { name: string, origin: string, destination: string, fare: number, fare_sunday?: number };
    mobile_payment_account?: BankAccount | null;
    transfer_account?: BankAccount | null;
}

interface Props {
    bus: Bus;
}

export default function PaymentPoster({ bus }: Props) {
    const hasDigitalPayments = bus.mobile_payment_account || bus.transfer_account;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0">
            <Head title={`Cartel de Pagos - Unidad ${bus.plate}`} />

            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Header elements only visible on screen, not print */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center print:hidden">
                    <h2 className="text-lg font-medium text-gray-900">Vista Previa de Cartel</h2>
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold transition-colors"
                    >
                        Imprimir / Guardar PDF
                    </button>
                </div>

                {/* Printable Content */}
                <div className="p-8 print:p-0 bg-white" id="printable-area">
                    {/* Header */}
                    <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
                        <h1 className="text-5xl font-extrabold text-blue-900 uppercase tracking-widest mb-2">Unidad {bus.plate}</h1>
                        {bus.route && (
                            <p className="text-3xl font-bold text-gray-700 uppercase">
                                {bus.route.name}
                            </p>
                        )}
                    </div>

                    {/* Fare Information */}
                    {bus.route ? (
                        <div className="flex flex-col md:flex-row gap-6 mb-10">
                            <div className="bg-yellow-100 border-l-[16px] border-yellow-400 p-6 rounded-r-xl flex-1">
                                <h2 className="text-2xl font-bold text-yellow-800 uppercase mb-2">Tarifa General</h2>
                                <p className="text-5xl font-black text-gray-900">
                                    Bs. {Number(bus.route.fare).toFixed(2)}
                                </p>
                            </div>

                            {bus.route.fare_sunday !== undefined && bus.route.fare_sunday > 0 && (
                                <div className="bg-orange-100 border-l-[16px] border-orange-400 p-6 rounded-r-xl flex-1">
                                    <h2 className="text-2xl font-bold text-orange-800 uppercase mb-2">Feriados y Domingos</h2>
                                    <p className="text-5xl font-black text-gray-900">
                                        Bs. {Number(bus.route.fare_sunday).toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-red-50 border-l-[8px] border-red-500 p-4 mb-8">
                            <p className="text-xl text-red-700 font-bold">Sin ruta asignada, tarifa desconocida.</p>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div className="border-[6px] border-gray-800 p-8 rounded-3xl relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6">
                            <h2 className="text-4xl font-black text-gray-800 uppercase">Métodos de Pago</h2>
                        </div>

                        {!hasDigitalPayments ? (
                            <div className="text-center py-12">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-4xl font-bold text-red-600">
                                    Solo recibimos pagos en efectivo.<br />No aceptamos medios digitales por el momento.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                <div className="grid grid-cols-2 print:grid-cols-2 gap-8 pt-6 min-w-[800px] print:min-w-0">
                                    {/* Mobile Payment section */}
                                    {bus.mobile_payment_account && bus.mobile_payment_account.is_mobile_payment_active && (
                                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-center mb-4">
                                                <span className="text-5xl mr-4">📱</span>
                                                <h3 className="text-3xl font-black text-indigo-900 uppercase">Pago Móvil</h3>
                                            </div>
                                            <div className="space-y-4 text-2xl">
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold text-gray-600">Banco:</span>
                                                    <span className="font-black text-gray-900">{bus.mobile_payment_account.bank_name}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold text-gray-600">Teléfono:</span>
                                                    <span className="font-black text-indigo-700 tracking-wider">
                                                        {bus.mobile_payment_account.phone_number.replace(/(\d{4})(\d{7})/, '$1-$2')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-200 pb-2">
                                                    <span className="font-bold text-gray-600">CI/RIF:</span>
                                                    <span className="font-black text-gray-900">{bus.mobile_payment_account.identification_document}</span>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-center text-sm text-indigo-600 font-bold uppercase tracking-widest bg-indigo-100 py-2 rounded">
                                                Muestre el comprobante al chófer
                                            </p>
                                        </div>
                                    )}

                                    {/* Transfer section */}
                                    {bus.transfer_account && bus.transfer_account.is_transfer_active && (
                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-center mb-4">
                                                <span className="text-5xl mr-4">🏦</span>
                                                <h3 className="text-3xl font-black text-blue-900 uppercase">Transferencia</h3>
                                            </div>
                                            <div className="space-y-4 text-xl">
                                                <div className="flex justify-between border-b border-blue-200 pb-2">
                                                    <span className="font-bold text-gray-600">Banco:</span>
                                                    <span className="font-black text-gray-900">{bus.transfer_account.bank_name}</span>
                                                </div>
                                                <div className="flex flex-col border-b border-blue-200 pb-2">
                                                    <span className="font-bold text-gray-600 mb-1">Cuenta:</span>
                                                    <span className="font-black text-blue-700 tracking-widest break-all">
                                                        {bus.transfer_account.account_number}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-200 pb-2">
                                                    <span className="font-bold text-gray-600">Titular:</span>
                                                    <span className="font-bold text-gray-900 text-right">{bus.transfer_account.owner_name}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-200 pb-2">
                                                    <span className="font-bold text-gray-600">CI/RIF:</span>
                                                    <span className="font-black text-gray-900">{bus.transfer_account.identification_document}</span>
                                                </div>
                                            </div>
                                            {bus.transfer_account.account_type && (
                                                <p className="mt-2 text-center text-sm text-gray-500 font-medium">
                                                    Cuenta tipo {bus.transfer_account.account_type}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { size: portrait; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
