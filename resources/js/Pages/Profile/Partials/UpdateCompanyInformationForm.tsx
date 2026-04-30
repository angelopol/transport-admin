import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdateCompanyInformationForm({
    className = '',
}: {
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        user.company_logo_path ? `/storage/${user.company_logo_path}` : null
    );

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            company_name: user.company_name ?? '',
            rif: user.rif ?? '',
            company_logo: null as File | null,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Usamos post con _method: patch para soportar la subida de archivos en Inertia
        post(route('profile.company.update'), {
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('company_logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className={className}>
            <header>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            Ajustes de Empresa
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Actualiza la información fiscal y la identidad visual de tu línea de transporte.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="company_name" value="Razón Social (Nombre de la Empresa)" />

                    <TextInput
                        id="company_name"
                        className="mt-1 block w-full"
                        value={data.company_name}
                        onChange={(e) => setData('company_name', e.target.value)}
                        placeholder="Ej. Transporte y Logística Los Andes C.A."
                        isFocused
                    />

                    <InputError className="mt-2" message={errors.company_name} />
                </div>

                <div>
                    <InputLabel htmlFor="rif" value="Documento Fiscal (Cédula o RIF)" />

                    <TextInput
                        id="rif"
                        className="mt-1 block w-full font-mono uppercase"
                        value={data.rif}
                        onChange={(e) => setData('rif', e.target.value.toUpperCase())}
                        placeholder="Ej. J-12345678-9 o V-12345678"
                    />
                    <p className="mt-1 text-xs text-gray-500">Formato estricto requerido. Empieza con V, E, J, P o G seguido de un guion y los dígitos.</p>

                    <InputError className="mt-2" message={errors.rif} />
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <InputLabel htmlFor="company_logo" value="Logotipo de la Empresa" />
                    
                    <div className="mt-4 flex items-start gap-6">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white shadow-sm flex items-center justify-center">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain p-1" />
                            ) : (
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                id="company_logo"
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                PNG, JPG o GIF hasta 2MB. Relación de aspecto 1:1 recomendada.
                            </p>
                            <InputError className="mt-2" message={errors.company_logo} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                    <PrimaryButton disabled={processing}>Guardar Ajustes Empresariales</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-green-600">Guardado exitosamente.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
