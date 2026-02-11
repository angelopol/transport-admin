import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Route {
    id: number;
    name: string;
    fare: number;
    fare_student: number;
    fare_senior: number;
    fare_disabled: number;
    fare_sunday: number;
}

interface Props {
    routes: Route[];
}

export default function Create({ routes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        route_id: '',
        user_type: 'general',
        payment_method: 'cash',
        amount: 0, // Just for display, backend recalculates
        registered_at: '', // Optional date override
    });

    // Calculate display amount whenever inputs change
    useEffect(() => {
        if (!data.route_id) {
            setData('amount', 0);
            return;
        }

        const selectedRoute = routes.find(r => r.id.toString() === data.route_id);
        if (!selectedRoute) return;

        const now = data.registered_at ? new Date(data.registered_at) : new Date();
        const isSunday = now.getDay() === 0;

        let calculatedAmount = Number(selectedRoute.fare);

        // Check Sunday tariff logic matches backend
        if (isSunday && Number(selectedRoute.fare_sunday) > 0) {
            calculatedAmount = Number(selectedRoute.fare_sunday);
        } else {
            switch (data.user_type) {
                case 'student':
                    calculatedAmount = Number(selectedRoute.fare_student) > 0 ? Number(selectedRoute.fare_student) : calculatedAmount;
                    break;
                case 'senior':
                    calculatedAmount = Number(selectedRoute.fare_senior) > 0 ? Number(selectedRoute.fare_senior) : calculatedAmount;
                    break;
                case 'disabled':
                    calculatedAmount = Number(selectedRoute.fare_disabled) > 0 ? Number(selectedRoute.fare_disabled) : calculatedAmount;
                    break;
                default:
                    calculatedAmount = Number(selectedRoute.fare);
            }
        }

        setData('amount', calculatedAmount);
    }, [data.route_id, data.user_type, data.registered_at]);


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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Registrar Ingreso</h2>}
        >
            <Head title="Registrar Ingreso" />

            <div className="py-6">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Route Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ruta *</label>
                                <select
                                    value={data.route_id}
                                    onChange={(e) => setData('route_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                >
                                    <option value="">Seleccione una ruta</option>
                                    {routes.map((route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.route_id && <p className="text-red-500 text-sm mt-1">{errors.route_id}</p>}
                            </div>

                            {/* User Type Selection */}
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

                            {/* Calculated Amount Display */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Monto Calculado</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(Number(data.amount) || 0)}
                                </p>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href={route('manual-entries.index')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || !data.route_id}
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
