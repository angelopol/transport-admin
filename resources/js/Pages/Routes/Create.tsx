import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import FileInput from '@/Components/FileInput';

export default function Create() {
    const { auth } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        origin: '',
        destination: '',
        fare: auth.user?.default_route_fare || '',
        fare_urban: auth.user?.default_route_fare_urban || '',
        is_suburban: false,
        fare_student: '',
        fare_senior: '',
        fare_disabled: '',
        fare_sunday: '',
        is_student_percentage: false,
        is_senior_percentage: false,
        is_disabled_percentage: false,
        official_gazette: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/routes');
    };

    const formatCurrency = (amount: number | string) => {
        const numericAmount = Number(amount) || 0;
        return `Bs. ${new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericAmount)}`;
    };

    const calculateFare = (baseFare: string | number, discountVal: string | number, isPercentage: boolean) => {
        const base = Number(baseFare) || 0;
        const desc = Number(discountVal) || 0;
        if (isPercentage) {
            return base - (base * (desc / 100));
        }
        return desc > 0 ? desc : base;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Nueva Ruta</h2>}
        >
            <Head title="Nueva Ruta" />

            <div className="py-6">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">Nueva Ruta</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ruta Centro - Terminal"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
                                    <input
                                        type="text"
                                        value={data.origin}
                                        onChange={(e) => setData('origin', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Centro"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                                    <input
                                        type="text"
                                        value={data.destination}
                                        onChange={(e) => setData('destination', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Terminal"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        checked={data.is_suburban}
                                        onChange={(e) => setData('is_suburban', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 select-none">Esta es una ruta Suburbana (Posee tarifa urbana adicional)</span>
                                </label>
                            </div>

                            <div className={`grid gap-4 ${data.is_suburban ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{data.is_suburban ? "Tarifa Suburbana General (Bs.) *" : "Tarifa General (Bs.) *"}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.fare}
                                        onChange={(e) => setData('fare', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="1.50"
                                        required
                                    />
                                    {errors.fare && <p className="text-red-500 text-sm mt-1">{errors.fare}</p>}
                                </div>
                                {data.is_suburban && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Urbana (Bs.) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.fare_urban}
                                            onChange={(e) => setData('fare_urban', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                                            placeholder="1.00"
                                            required={data.is_suburban}
                                        />
                                        {errors.fare_urban && <p className="text-red-500 text-sm mt-1">{errors.fare_urban}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">Tarifa Estudiante</label>
                                        <label className="flex items-center gap-1 text-xs text-gray-500">
                                            <input type="checkbox" checked={data.is_student_percentage} onChange={e => setData('is_student_percentage', e.target.checked)} className="rounded border-gray-300 w-3 h-3 text-blue-600" />
                                            %
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.fare_student}
                                        onChange={(e) => setData('fare_student', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={data.is_student_percentage ? "50" : "0.00"}
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">Tarifa Adulto Mayor</label>
                                        <label className="flex items-center gap-1 text-xs text-gray-500">
                                            <input type="checkbox" checked={data.is_senior_percentage} onChange={e => setData('is_senior_percentage', e.target.checked)} className="rounded border-gray-300 w-3 h-3 text-blue-600" />
                                            %
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.fare_senior}
                                        onChange={(e) => setData('fare_senior', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={data.is_senior_percentage ? "50" : "0.00"}
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">Tarifa Discapacitado</label>
                                        <label className="flex items-center gap-1 text-xs text-gray-500">
                                            <input type="checkbox" checked={data.is_disabled_percentage} onChange={e => setData('is_disabled_percentage', e.target.checked)} className="rounded border-gray-300 w-3 h-3 text-blue-600" />
                                            %
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.fare_disabled}
                                        onChange={(e) => setData('fare_disabled', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={data.is_disabled_percentage ? "50" : "0.00"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Domingo (Bs.)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.fare_sunday}
                                        onChange={(e) => setData('fare_sunday', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Cartel de Precios Visual */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6 shadow-inner">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎟️ Vista Previa: Cartel de Precios</h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Tipo de Pasajero</th>
                                                {data.is_suburban && <th className="px-4 py-3 font-semibold text-blue-800">Trayecto Urbano</th>}
                                                <th className="px-4 py-3 font-semibold text-green-800">{data.is_suburban ? 'Trayecto Suburbano' : 'Precio Oficial'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-gray-900">General</td>
                                                {data.is_suburban && <td className="px-4 py-3 font-bold text-blue-600">{formatCurrency(Number(data.fare_urban) || 0)}</td>}
                                                <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(Number(data.fare) || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-gray-700">Domingo / Feriado</td>
                                                {data.is_suburban && <td className="px-4 py-3">{formatCurrency(Number(data.fare_sunday) > 0 ? Number(data.fare_sunday) : Number(data.fare_urban) || 0)}</td>}
                                                <td className="px-4 py-3">{formatCurrency(Number(data.fare_sunday) > 0 ? Number(data.fare_sunday) : Number(data.fare) || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-gray-700">Estudiante{data.is_student_percentage ? ` (-${data.fare_student || 0}%)` : ''}</td>
                                                {data.is_suburban && <td className="px-4 py-3">{formatCurrency(calculateFare(data.fare_urban, data.fare_student, data.is_student_percentage))}</td>}
                                                <td className="px-4 py-3">{formatCurrency(calculateFare(data.fare, data.fare_student, data.is_student_percentage))}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-gray-700">Adulto Mayor{data.is_senior_percentage ? ` (-${data.fare_senior || 0}%)` : ''}</td>
                                                {data.is_suburban && <td className="px-4 py-3">{formatCurrency(calculateFare(data.fare_urban, data.fare_senior, data.is_senior_percentage))}</td>}
                                                <td className="px-4 py-3">{formatCurrency(calculateFare(data.fare, data.fare_senior, data.is_senior_percentage))}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-gray-700">Discapacitado{data.is_disabled_percentage ? ` (-${data.fare_disabled || 0}%)` : ''}</td>
                                                {data.is_suburban && <td className="px-4 py-3">{formatCurrency(calculateFare(data.fare_urban, data.fare_disabled, data.is_disabled_percentage))}</td>}
                                                <td className="px-4 py-3">{formatCurrency(calculateFare(data.fare, data.fare_disabled, data.is_disabled_percentage))}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 text-center">Así se mostrarán los precios automáticamente en la aplicación móvil de los choferes.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cartelera de Precios / Gaceta Oficial (Opcional)</label>
                                <FileInput
                                    accept="image/*"
                                    onChange={(file) => setData('official_gazette', file)}
                                    error={errors.official_gazette}
                                    hint="Sube una imagen de la Gaceta Oficial para respaldo visual (JPG, PNG, WEBP - Máx 2MB)."
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/routes" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Crear Ruta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
