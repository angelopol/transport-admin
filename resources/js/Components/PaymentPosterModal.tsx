import { useRef } from 'react';
import Modal from '@/Components/Modal';
import { usePage } from '@inertiajs/react';

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

export interface PaymentPosterBus {
    id: number;
    plate: string;
    route?: {
        name: string;
        origin?: string;
        destination?: string;
        fare: number;
        fare_sunday?: number | null;
        fare_student?: number | null;
        fare_senior?: number | null;
        fare_disabled?: number | null;
        is_student_percentage?: boolean;
        is_senior_percentage?: boolean;
        is_disabled_percentage?: boolean;
        is_suburban?: boolean;
        fare_urban?: number | null;
    };
    mobile_payment_account?: BankAccount | null;
    transfer_account?: BankAccount | null;
}

interface Props {
    bus: PaymentPosterBus | null;
    onClose: () => void;
}

export default function PaymentPosterModal({ bus, onClose }: Props) {
    const posterRef = useRef<HTMLDivElement>(null);
    const user = usePage().props.auth.user as any;

    const handlePrint = () => {
        if (!posterRef.current) return;
        const printContents = posterRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        
        // Simple and effective print method for this case
        document.body.innerHTML = `
            <style>
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body { margin: 0; padding: 0; }
                    .print-container { width: 100%; margin: 0; padding: 0; }
                }
                * { box-sizing: border-box; }
                body { font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
            <div class="print-container">${printContents}</div>
        `;
        window.print();
        window.location.reload(); // Necessary to restore React state after nuking body
    };

    const handleDownloadPDF = async () => {
        if (!posterRef.current) return;
        
        const element = posterRef.current;
        const html2pdf = (await import('html2pdf.js')).default;
        
        const opt = {
            margin: [10, 10] as [number, number],
            filename: `cartel-pagos-${bus?.plate ?? 'unidad'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                letterRendering: true,
                scrollY: 0,
                windowHeight: element.scrollHeight + 100 // Ensure full height is captured
            },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    const getCalculatedFare = (baseFare: number | string, value?: number | string | null, isPercentage?: boolean | number): number => {
        const numBase = Number(baseFare);
        if (value === undefined || value === null || value === '') return numBase;
        const numVal = Number(value);
        if (isPercentage) return numBase - numBase * (numVal / 100);
        return numVal > 0 ? numVal : numBase;
    };

    return (
        <Modal show={bus !== null} onClose={onClose} maxWidth="2xl">
            {bus && (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Cartel de Pagos — Unidad {bus.plate}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Printable Area */}
                    <div className="max-h-[65vh] overflow-y-auto pr-1">
                        <div ref={posterRef} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                            
                            {/* Company Header */}
                            {(user.company_name || user.company_logo_path) && (
                                <div className="text-center mb-6 border-b border-gray-200 pb-4">
                                    {user.company_logo_path && (
                                        <img src={`/storage/${user.company_logo_path}`} alt="Logo Empresa" className="h-20 object-contain mx-auto mb-2" />
                                    )}
                                    {user.company_name && (
                                        <h2 className="text-xl font-black text-gray-800 uppercase leading-tight tracking-wide">{user.company_name}</h2>
                                    )}
                                    {user.rif && (
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{user.rif}</p>
                                    )}
                                </div>
                            )}

                            {/* Unit Header */}
                            <div className="text-center mb-4 border-b-4 border-blue-600 pb-3">
                                <h1 className="text-3xl font-extrabold text-blue-900 uppercase tracking-widest mb-0.5">
                                    Unidad {bus.plate}
                                </h1>
                                {bus.route && (
                                    <p className="text-xl font-bold text-gray-700 uppercase">
                                        {bus.route.name}
                                    </p>
                                )}
                            </div>

                            {/* Fare Information */}
                            {bus.route ? (
                                <div className="mb-4">
                                    {/* General fare(s) — horizontal row */}
                                    <div className="flex flex-row gap-2 mb-2">
                                        <div className="bg-yellow-100 border-l-[8px] border-yellow-400 p-3 rounded-r-lg flex-1">
                                            <h2 className="text-sm font-bold text-yellow-800 uppercase mb-0.5">
                                                {bus.route.is_suburban ? 'Tarifa Suburbana' : 'Tarifa General'}
                                            </h2>
                                            <p className="text-2xl font-black text-gray-900">
                                                Bs. {Number(bus.route.fare).toFixed(2)}
                                            </p>
                                        </div>
                                        {bus.route.is_suburban && bus.route.fare_urban && (
                                            <div className="bg-sky-100 border-l-[8px] border-sky-400 p-3 rounded-r-lg flex-1">
                                                <h2 className="text-sm font-bold text-sky-800 uppercase mb-0.5">Tarifa Urbana</h2>
                                                <p className="text-2xl font-black text-gray-900">
                                                    Bs. {Number(bus.route.fare_urban).toFixed(2)}
                                                </p>
                                            </div>
                                        )}
                                        {bus.route.fare_sunday !== undefined && bus.route.fare_sunday !== null && bus.route.fare_sunday > 0 && (
                                            <div className="bg-orange-100 border-l-[8px] border-orange-400 p-3 rounded-r-lg flex-1">
                                                <h2 className="text-sm font-bold text-orange-800 uppercase mb-0.5">Feriados / Dom.</h2>
                                                <p className="text-2xl font-black text-gray-900">
                                                    Bs. {Number(bus.route.fare_sunday).toFixed(2)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Special Fares */}
                                    {bus.route.is_suburban && bus.route.fare_urban ? (
                                        /* Suburban: table with urban + suburban columns */
                                        (() => {
                                            const fareU = Number(bus.route.fare_urban);
                                            const fareS = Number(bus.route.fare);
                                            const rows = [
                                                {
                                                    label: 'Estudiantes',
                                                    show: bus.route.fare_student !== undefined && bus.route.fare_student !== null,
                                                    urban: getCalculatedFare(fareU, bus.route.fare_student, bus.route.is_student_percentage),
                                                    suburban: getCalculatedFare(fareS, bus.route.fare_student, bus.route.is_student_percentage),
                                                    suffix: bus.route.is_student_percentage ? ` (−${bus.route.fare_student}%)` : '',
                                                    color: 'text-blue-800',
                                                },
                                                {
                                                    label: 'Adulto Mayor',
                                                    show: bus.route.fare_senior !== undefined && bus.route.fare_senior !== null,
                                                    urban: getCalculatedFare(fareU, bus.route.fare_senior, bus.route.is_senior_percentage),
                                                    suburban: getCalculatedFare(fareS, bus.route.fare_senior, bus.route.is_senior_percentage),
                                                    suffix: bus.route.is_senior_percentage ? ` (−${bus.route.fare_senior}%)` : '',
                                                    color: 'text-emerald-800',
                                                },
                                                {
                                                    label: 'Discapacitados',
                                                    show: bus.route.fare_disabled !== undefined && bus.route.fare_disabled !== null,
                                                    urban: getCalculatedFare(fareU, bus.route.fare_disabled, bus.route.is_disabled_percentage),
                                                    suburban: getCalculatedFare(fareS, bus.route.fare_disabled, bus.route.is_disabled_percentage),
                                                    suffix: bus.route.is_disabled_percentage ? ` (−${bus.route.fare_disabled}%)` : '',
                                                    color: 'text-purple-800',
                                                },
                                            ].filter(r => r.show);

                                            return rows.length > 0 ? (
                                                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-3">
                                                    <table className="w-full text-sm text-center">
                                                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left">Tipo de Pasajero</th>
                                                                <th className="px-3 py-2 text-sky-700">Urbano</th>
                                                                <th className="px-3 py-2 text-yellow-700">Suburbano</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 bg-white">
                                                            {rows.map(row => (
                                                                <tr key={row.label}>
                                                                    <td className={`px-3 py-2 text-left font-bold ${row.color}`}>
                                                                        {row.label}<span className="font-normal text-gray-500">{row.suffix}</span>
                                                                    </td>
                                                                    <td className="px-3 py-2 font-black text-gray-900">
                                                                        Bs. {row.urban.toFixed(2)}
                                                                    </td>
                                                                    <td className="px-3 py-2 font-black text-gray-900">
                                                                        Bs. {row.suburban.toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : null;
                                        })()
                                    ) : (
                                        /* Non-suburban: classic cards grid */
                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            {bus.route.fare_student !== undefined && bus.route.fare_student !== null && (
                                                <div className="bg-blue-50 border-t-4 border-blue-400 p-3 rounded-b-lg text-center shadow-sm">
                                                    <h3 className="text-sm font-bold text-blue-800 uppercase mb-1">Estudiantes</h3>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        Bs. {getCalculatedFare(Number(bus.route.fare), bus.route.fare_student, bus.route.is_student_percentage).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                            {bus.route.fare_senior !== undefined && bus.route.fare_senior !== null && (
                                                <div className="bg-emerald-50 border-t-4 border-emerald-400 p-3 rounded-b-lg text-center shadow-sm">
                                                    <h3 className="text-sm font-bold text-emerald-800 uppercase mb-1">Adulto Mayor</h3>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        Bs. {getCalculatedFare(Number(bus.route.fare), bus.route.fare_senior, bus.route.is_senior_percentage).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                            {bus.route.fare_disabled !== undefined && bus.route.fare_disabled !== null && (
                                                <div className="bg-purple-50 border-t-4 border-purple-400 p-3 rounded-b-lg text-center shadow-sm">
                                                    <h3 className="text-sm font-bold text-purple-800 uppercase mb-1">Discapacitados</h3>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        Bs. {getCalculatedFare(Number(bus.route.fare), bus.route.fare_disabled, bus.route.is_disabled_percentage).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

                                {!(bus.mobile_payment_account || bus.transfer_account) ? (
                                    <div className="text-center py-6">
                                        <p className="text-2xl font-bold text-red-600">Solo Efectivo</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                                        <div className="grid grid-cols-2 gap-4 pt-4 text-sm sm:text-base min-w-[600px] print:min-w-0">
                                            {/* Mobile Payment */}
                                            {bus.mobile_payment_account?.is_mobile_payment_active && (
                                                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                                                    <div className="flex items-center mb-3">
                                                        <span className="text-3xl mr-3">📱</span>
                                                        <h3 className="text-xl font-black text-indigo-900 uppercase">Pago Móvil</h3>
                                                    </div>
                                                    <div className="space-y-2 font-medium">
                                                        <div className="flex justify-between border-b border-indigo-200 pb-1">
                                                            <span className="text-gray-600">Banco:</span>
                                                            <span className="font-bold text-gray-900">{bus.mobile_payment_account.bank_name}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-indigo-200 pb-1">
                                                            <span className="text-gray-600">Teléfono:</span>
                                                            <span className="font-black text-indigo-700 tracking-wider">
                                                                {bus.mobile_payment_account.phone_number.replace(/(\d{4})(\d{7})/, '$1-$2')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-indigo-200 pb-1">
                                                            <span className="text-gray-600">CI/RIF:</span>
                                                            <span className="font-bold text-gray-900">{bus.mobile_payment_account.identification_document}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Transfer */}
                                            {bus.transfer_account?.is_transfer_active && (
                                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                                    <div className="flex items-center mb-3">
                                                        <span className="text-3xl mr-3">🏦</span>
                                                        <h3 className="text-xl font-black text-blue-900 uppercase">Transferencia</h3>
                                                    </div>
                                                    <div className="space-y-2 font-medium">
                                                        <div className="flex justify-between border-b border-blue-200 pb-1">
                                                            <span className="text-gray-600">Banco:</span>
                                                            <span className="font-bold text-gray-900">{bus.transfer_account.bank_name}</span>
                                                        </div>
                                                        <div className="flex flex-col border-b border-blue-200 pb-1">
                                                            <span className="text-gray-600 mb-0.5">Cuenta:</span>
                                                            <span className="font-black text-blue-700 tracking-wider break-all text-sm leading-tight text-right">
                                                                {bus.transfer_account.account_number}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-blue-200 pb-1 mt-1">
                                                            <span className="text-gray-600">CI/RIF:</span>
                                                            <span className="font-bold text-gray-900">{bus.transfer_account.identification_document}</span>
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

                    {/* Actions */}
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 text-sm font-medium rounded-md text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar PDF
                        </button>
                    </div>

                </div>
            )}
        </Modal>
    );
}
