import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { User } from '@/types';
import { useState } from 'react';
import Modal from '@/Components/Modal';

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
    registered_by?: { id: number; name: string; email: string };
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

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');

    const openPreview = (imagePath: string, reference: string | undefined) => {
        setPreviewImage(`/storage/${imagePath}`);
        setPreviewTitle(reference ? `Ref: ${reference}` : 'Comprobante de Pago');
    };

    const closePreview = () => {
        setPreviewImage(null);
        setPreviewTitle('');
    };

    const handlePrint = () => {
        if (!previewImage) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Comprobante - ${previewTitle}</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f3f4f6; }
                            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                            @media print {
                                body { background-color: white; }
                                img { max-width: 100%; max-height: 98vh; page-break-inside: avoid; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${previewImage}" onload="window.print();window.close()" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const formatCurrency = (amount: number | string) => {
        const numericAmount = Number(amount) || 0;
        return `Bs. ${new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericAmount)}`;
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
                        className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
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
                                        {!isOperative && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado por</th>
                                        )}
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
                                                {!isOperative && (
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {entry.registered_by ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                    {entry.registered_by.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-gray-900 truncate">{entry.registered_by.name}</p>
                                                                    <p className="text-xs text-gray-400 truncate">{entry.registered_by.email}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {entry.reference_number && <div><span className="font-semibold">Ref:</span> {entry.reference_number}</div>}
                                                    {entry.identification && <div><span className="font-semibold">C.I:</span> {entry.identification}</div>}
                                                    {entry.phone_or_account && <div><span className="font-semibold">Tel/Cta:</span> {entry.phone_or_account}</div>}
                                                    {!entry.reference_number && !entry.identification && !entry.phone_or_account && <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {entry.reference_image_path ? (
                                                        <button
                                                            onClick={() => openPreview(entry.reference_image_path as string, entry.reference_number)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                            </svg>
                                                            Ver
                                                        </button>
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
            {/* FAB for mobile devices */}
            <Link
                href={route('manual-entries.create')}
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-50"
                aria-label={isOperative ? 'Registrar Pasaje' : 'Registrar Ingreso'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Link>

            {/* Image Preview Modal */}
            <Modal show={!!previewImage} onClose={closePreview} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{previewTitle}</h3>
                        <button
                            onClick={closePreview}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-2 flex justify-center bg-gray-50 rounded-lg p-2 border border-gray-200 min-h-[50vh]">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt={previewTitle}
                                className="max-w-full max-h-[70vh] object-contain rounded shadow-sm"
                            />
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <a
                            href={previewImage || '#'}
                            download={`comprobante_${previewTitle.replace(/\s+/g, '_')}.png`}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Descargar
                        </a>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 items-center gap-2 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                            </svg>
                            Imprimir
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
