import { useForm } from '@inertiajs/react';
import React, { useState, useEffect, FormEventHandler } from 'react';

export default function SettingsModal({ isOpen, onClose, routes, user }: any) {
    const [activeTab, setActiveTab] = useState('defaults');

    // Default form
    const defaultsForm = useForm({
        default_route_fare: user?.default_route_fare || '',
        default_route_fare_urban: user?.default_route_fare_urban || '',
    });

    // Bulk update form
    const bulkForm = useForm({
        fare: '',
        fare_urban: '',
        route_ids: routes.map((r: any) => r.id),
    });

    // Keep route_ids synced if routes change
    useEffect(() => {
        bulkForm.setData('route_ids', routes.map((r: any) => r.id));
    }, [routes]);

    if (!isOpen) return null;

    const toggleRouteSelection = (id: number) => {
        const currentIds = bulkForm.data.route_ids;
        if (currentIds.includes(id)) {
            bulkForm.setData('route_ids', currentIds.filter((routeId: number) => routeId !== id));
        } else {
            bulkForm.setData('route_ids', [...currentIds, id]);
        }
    };

    const submitDefaults: FormEventHandler = (e) => {
        e.preventDefault();
        defaultsForm.post('/routes/settings/defaults', {
            onSuccess: () => {
                alert('Ajustes por defecto guardados exitosamente.');
                onClose();
            }
        });
    };

    const submitBulk: FormEventHandler = (e) => {
        e.preventDefault();
        bulkForm.post('/routes/settings/bulk', {
            onSuccess: () => {
                alert('Rutas actualizadas masivamente exitosamente.');
                bulkForm.reset('fare', 'fare_urban');
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10 pb-10">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Ajustes de Rutas</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        className={`px-6 py-3 font-medium text-sm ${activeTab === 'defaults' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('defaults')}
                    >
                        Valores por Defecto
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm ${activeTab === 'bulk' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('bulk')}
                    >
                        Actualización Masiva
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {activeTab === 'defaults' && (
                        <form onSubmit={submitDefaults} className="space-y-6">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                                Establece el precio predeterminado que aparecerá automáticamente al crear nuevas rutas. Esto no afecta a las rutas ya creadas.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa General Predeterminada ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={defaultsForm.data.default_route_fare}
                                        onChange={(e) => defaultsForm.setData('default_route_fare', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {defaultsForm.errors.default_route_fare && <p className="text-red-500 text-sm mt-1">{defaultsForm.errors.default_route_fare}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Urbana Predeterminada ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={defaultsForm.data.default_route_fare_urban}
                                        onChange={(e) => defaultsForm.setData('default_route_fare_urban', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                    />
                                    {defaultsForm.errors.default_route_fare_urban && <p className="text-red-500 text-sm mt-1">{defaultsForm.errors.default_route_fare_urban}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={defaultsForm.processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {defaultsForm.processing ? 'Guardando...' : 'Guardar Predeterminados'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'bulk' && (
                        <form onSubmit={submitBulk} className="space-y-6">
                            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mb-4">
                                Cambia el precio de múltiples rutas al mismo tiempo. Los descuentos (estudiantes, adulto mayor, etc.) configurados actualmente en cada ruta se mantendrán intactos.
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Tarifa General ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={bulkForm.data.fare}
                                        onChange={(e) => bulkForm.setData('fare', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Tarifa Urbana ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={bulkForm.data.fare_urban}
                                        onChange={(e) => bulkForm.setData('fare_urban', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Solo aplicará si la ruta seleccionada es Suburbana.</p>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col max-h-[300px]">
                                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center font-medium text-sm flex-shrink-0">
                                    <span>Selecciona las rutas a modificar</span>
                                    <button 
                                        type="button" 
                                        onClick={() => bulkForm.setData('route_ids', routes.map((r: any) => r.id))}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Seleccionar Todas
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100 overflow-y-auto p-2">
                                    {routes.map((route: any) => (
                                        <label key={route.id} className="flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer transition">
                                            <input
                                                type="checkbox"
                                                checked={bulkForm.data.route_ids.includes(route.id)}
                                                onChange={() => toggleRouteSelection(route.id)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{route.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {route.origin} - {route.destination} {route.is_suburban ? '(Suburbano)' : ''}
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-700">
                                                $ {parseFloat(route.fare).toFixed(2)}
                                            </div>
                                        </label>
                                    ))}
                                    {routes.length === 0 && (
                                        <div className="p-4 text-center text-sm text-gray-500">No hay rutas registradas.</div>
                                    )}
                                </div>
                            </div>
                            {bulkForm.errors.route_ids && <p className="text-red-500 text-sm">{bulkForm.errors.route_ids}</p>}

                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={bulkForm.processing || bulkForm.data.route_ids.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {bulkForm.processing ? 'Actualizando...' : `Actualizar ${bulkForm.data.route_ids.length} Rutas`}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
