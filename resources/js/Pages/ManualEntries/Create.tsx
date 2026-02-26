import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState, useRef } from 'react';

interface Route {
    id: number;
    name: string;
    fare: number;
    fare_student: number;
    fare_senior: number;
    fare_disabled: number;
    fare_sunday: number;
    is_student_percentage: boolean;
    is_senior_percentage: boolean;
    is_disabled_percentage: boolean;
}

interface Bus {
    id: number;
    plate: string;
    route?: Route;
}

interface Props {
    buses: Bus[];
    isOperative: boolean;
}

export default function Create({ buses, isOperative }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        bus_id: '',
        user_type: 'general',
        payment_method: isOperative ? 'digital' : 'cash',
        amount: 0, // Just for display, backend recalculates
        registered_at: '', // Optional date override
        reference_number: '',
        identification: '',
        phone_or_account: '',
        reference_image: null as File | null,
    });

    const isFormDisabled = !data.bus_id || !buses.find(b => b.id.toString() === data.bus_id)?.route;
    const isSubmitDisabled = processing || isFormDisabled || (data.payment_method === 'digital' && !data.reference_image);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const openCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("No se pudo acceder a la cámara. Por favor asegúrese de dar permisos o estar en un dispositivo con cámara.");
            setIsCameraOpen(false);
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setPhotoPreview(dataUrl);

                fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setData('reference_image', file);
                    });

                closeCamera();
            }
        }
    };

    const retakePhoto = () => {
        setPhotoPreview(null);
        setData('reference_image', null);
        openCamera();
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Calculate display amount whenever inputs change
    useEffect(() => {
        if (!data.bus_id) {
            setData('amount', 0);
            return;
        }

        const selectedBus = buses.find(b => b.id.toString() === data.bus_id);
        const selectedRoute = selectedBus?.route;

        if (!selectedRoute) {
            setData('amount', 0);
            return;
        }

        const now = data.registered_at ? new Date(data.registered_at) : new Date();
        const isSunday = now.getDay() === 0;

        const baseFare = (isSunday && Number(selectedRoute.fare_sunday) > 0)
            ? Number(selectedRoute.fare_sunday)
            : Number(selectedRoute.fare);

        let calculatedAmount = baseFare;

        switch (data.user_type) {
            case 'student':
                calculatedAmount = selectedRoute.is_student_percentage
                    ? baseFare - (baseFare * (Number(selectedRoute.fare_student) / 100))
                    : (Number(selectedRoute.fare_student) > 0 ? Number(selectedRoute.fare_student) : baseFare);
                break;
            case 'senior':
                calculatedAmount = selectedRoute.is_senior_percentage
                    ? baseFare - (baseFare * (Number(selectedRoute.fare_senior) / 100))
                    : (Number(selectedRoute.fare_senior) > 0 ? Number(selectedRoute.fare_senior) : baseFare);
                break;
            case 'disabled':
                calculatedAmount = selectedRoute.is_disabled_percentage
                    ? baseFare - (baseFare * (Number(selectedRoute.fare_disabled) / 100))
                    : (Number(selectedRoute.fare_disabled) > 0 ? Number(selectedRoute.fare_disabled) : baseFare);
                break;
            default:
                calculatedAmount = baseFare;
        }

        setData('amount', calculatedAmount);
    }, [data.bus_id, data.user_type, data.registered_at]);


    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/manual-entries');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{isOperative ? 'Registrar Pasaje' : 'Registrar Ingreso'}</h2>}
        >
            <Head title={isOperative ? 'Registrar Pasaje' : 'Registrar Ingreso'} />

            <div className="py-6">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Bus Selection */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad (Bus) *</label>
                                    <select
                                        value={data.bus_id}
                                        onChange={(e) => setData('bus_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">Seleccione una unidad</option>
                                        {buses.map((bus) => (
                                            <option key={bus.id} value={bus.id}>
                                                Placa: {bus.plate} {bus.route ? `(Ruta: ${bus.route.name})` : '(Sin ruta asignada)'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.bus_id && <p className="text-red-500 text-sm mt-1">{errors.bus_id}</p>}
                                    {buses.length === 0 && isOperative && (
                                        <p className="text-red-500 text-sm mt-1">No tiene unidades asignadas.</p>
                                    )}
                                </div>
                            </div>

                            {/* User Type Selection */}
                            <div className={`space-y-6 relative transition-all duration-300 ${isFormDisabled ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'general', label: 'General', icon: '👤' },
                                            { id: 'student', label: 'Estudiante', icon: '🎓' },
                                            { id: 'senior', label: 'Adulto Mayor', icon: '👴' },
                                            { id: 'disabled', label: 'Discapacitado', icon: '♿' },
                                        ].map((type) => (
                                            <div key={type.id} className="relative">
                                                <input
                                                    type="radio"
                                                    name="user_type"
                                                    id={`type-${type.id}`}
                                                    value={type.id}
                                                    checked={data.user_type === type.id}
                                                    onChange={(e) => setData('user_type', e.target.value)}
                                                    className="peer sr-only"
                                                />
                                                <label
                                                    htmlFor={`type-${type.id}`}
                                                    className="flex flex-col items-center justify-center p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 hover:bg-gray-50 transition-all"
                                                >
                                                    <span className="text-2xl mb-1">{type.icon}</span>
                                                    <span className="text-sm font-medium">{type.label}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.user_type && <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>}
                                </div>

                                {/* Payment Method */}
                                {!isOperative && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="cash"
                                                    checked={data.payment_method === 'cash'}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span>Efectivo 💵</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="digital"
                                                    checked={data.payment_method === 'digital'}
                                                    onChange={(e) => setData('payment_method', e.target.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span>Digital 💳</span>
                                            </label>
                                        </div>
                                        {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                                    </div>
                                )}

                                {/* Digital Reference Fields */}
                                {data.payment_method === 'digital' && (
                                    <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Detalles de Transferencia / Pago Digital</h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">N° de Referencia *</label>
                                                <input
                                                    type="text"
                                                    value={data.reference_number}
                                                    onChange={(e) => setData('reference_number', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ej. 123456789"
                                                    required
                                                />
                                                {errors.reference_number && <p className="text-red-500 text-sm mt-1">{errors.reference_number}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / Identificación (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={data.identification}
                                                    onChange={(e) => setData('identification', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ej. 0912345678"
                                                />
                                                {errors.identification && <p className="text-red-500 text-sm mt-1">{errors.identification}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Cuenta (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={data.phone_or_account}
                                                    onChange={(e) => setData('phone_or_account', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ej. 0999999999"
                                                />
                                                {errors.phone_or_account && <p className="text-red-500 text-sm mt-1">{errors.phone_or_account}</p>}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Captura de Pantalla (Obligatorio) *</label>

                                                {!photoPreview && !isCameraOpen && (
                                                    <button
                                                        type="button"
                                                        onClick={openCamera}
                                                        disabled={isFormDisabled}
                                                        className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        <span className="text-4xl">📸</span>
                                                        <span className="font-medium">Tomar Fotografía del Pago</span>
                                                    </button>
                                                )}

                                                {isCameraOpen && (
                                                    <div className="relative rounded-lg overflow-hidden bg-black shadow-inner border border-gray-800">
                                                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-96 object-cover" />
                                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                                                            <button
                                                                type="button"
                                                                onClick={closeCamera}
                                                                className="px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-all shadow-lg"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={takePhoto}
                                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold backdrop-blur-sm shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                                                            >
                                                                <span>Capturar</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {photoPreview && (
                                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                        <img src={photoPreview} alt="Comprobante" className="w-full h-auto max-h-96 object-contain bg-gray-50" />
                                                        <button
                                                            type="button"
                                                            onClick={retakePhoto}
                                                            className="absolute bottom-4 right-4 items-center gap-2 px-4 py-2 bg-gray-900/75 hover:bg-gray-900 text-white rounded-lg text-sm transition-all backdrop-blur-sm shadow"
                                                        >
                                                            <span>↻</span> Volver a tomar
                                                        </button>
                                                    </div>
                                                )}

                                                <canvas ref={canvasRef} className="hidden" />

                                                {errors.reference_image && <p className="text-red-500 text-sm mt-1">{errors.reference_image}</p>}
                                                {data.payment_method === 'digital' && !data.reference_image && (
                                                    <p className="text-orange-500 text-xs mt-2 font-medium">⚠️ La fotografía del pago es obligatoria.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Calculated Amount Display */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 mb-1">Monto Calculado</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(Number(data.amount) || 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <Link href={route('manual-entries.index')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
