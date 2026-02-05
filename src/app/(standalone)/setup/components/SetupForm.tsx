'use client';

import { useFormStatus } from 'react-dom';
import { createOrganization } from '@/actions/setupActions';
import { updateOrganization } from '@/actions/organizationActions';
import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';

// Using any to bypass strict React type mismatch for Server Actions
type ServerAction = any;

interface SetupFormProps {
    initialData?: {
        id: string;
        name: string;
        type: string;
        logoUrl?: string | null;
        address?: string | null;
        phone?: string | null;
    } | null;
}

function SubmitButton({
    children,
    formAction,
    className
}: {
    children: React.ReactNode;
    formAction: ServerAction;
    className: string;
}) {
    const { pending } = useFormStatus();

    return (
        <button
            formAction={formAction}
            disabled={pending}
            className={`${className} ${pending ? 'opacity-70 cursor-wait' : ''}`}
        >
            {pending ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                </span>
            ) : children}
        </button>
    );
}

export function SetupForm({ initialData }: SetupFormProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.logoUrl || null);

    const isEditing = !!initialData;

    // Check if initial type is one of the defaults
    const defaultTypes = ['Verdulería', 'Carnicería', 'Almacén'];
    const initialTypeIsCustom = initialData?.type && !defaultTypes.includes(initialData.type);

    // State to handle type selection
    const [selectedType, setSelectedType] = useState<string>(
        isEditing
            ? (initialTypeIsCustom ? 'Otro' : initialData?.type || '')
            : ''
    );
    const [customType, setCustomType] = useState<string>(
        initialTypeIsCustom ? initialData?.type || '' : ''
    );

    async function handleSubmit(formData: FormData) {
        setErrorMessage(null);

        // Append logoUrl
        if (logoUrl) {
            formData.set('logoUrl', logoUrl);
        }

        // Handle Custom Type
        if (selectedType === 'Otro') {
            if (!customType.trim()) {
                setErrorMessage("⚠️ Por favor ingresá el nombre del rubro.");
                return;
            }
            formData.set('type', customType.trim());
        } else {
            formData.set('type', selectedType);
        }

        let result;
        if (isEditing) {
            formData.set('organizationId', initialData?.id || '');
            // We don't update 'type' for now to avoid breaking changes, but name and logo are fine
            result = await updateOrganization(formData);
        } else {
            result = await createOrganization(formData);
        }

        if (result?.error) {
            setErrorMessage(result.error);
        } else if (isEditing) {
            // For edit, maybe show success or refresh
            setErrorMessage("✅ Cambios guardados correctamente");
        }
        // Success for create redirects automatically
    }

    return (
        <form className="flex flex-col gap-6">
            {errorMessage && (
                <div className={`p-4 border rounded-lg text-sm text-center ${errorMessage.includes('✅') ? 'bg-green-500/10 border-green-500/50 text-green-200' : 'bg-red-500/10 border-red-500/50 text-red-200'}`}>
                    {errorMessage}
                </div>
            )}

            {/* Logo Upload Section */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Logo del Negocio</label>
                <ImageUploader
                    currentUrl={logoUrl}
                    onUploadComplete={(url) => setLogoUrl(url)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Nombre del Negocio</label>
                <input
                    name="name"
                    type="text"
                    required
                    defaultValue={initialData?.name || ''}
                    placeholder="Ej: Verdulería El Tomate"
                    className="input-field bg-white/5 border-white/10 focus:border-green-500/50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Dirección (Opcional)</label>
                    <input
                        name="address"
                        type="text"
                        defaultValue={initialData?.address || ''}
                        placeholder="Ej: Av. San Martín 123"
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Teléfono (Opcional)</label>
                    <input
                        name="phone"
                        type="text"
                        defaultValue={initialData?.phone || ''}
                        placeholder="Ej: 358 123 4567"
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Rubro</label>
                <div className="flex flex-col gap-2">
                    <select
                        name="type_selector" // name changed so it doesn't conflict with direct 'type' override if needed
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50 appearance-none text-white/90 disabled:opacity-50"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        required
                    >
                        <option value="" disabled className="bg-gray-800">Selecciona un rubro...</option>
                        <option value="Verdulería" className="bg-gray-800">🍏 Verdulería</option>
                        <option value="Carnicería" className="bg-gray-800">🥩 Carnicería</option>
                        <option value="Almacén" className="bg-gray-800">🛒 Almacén / Kiosco</option>
                        <option value="Imprenta" className="bg-gray-800">🖨️ Imprenta / Gráfica</option>
                        <option value="Servicios" className="bg-gray-800">🛠️ Servicios / Oficios</option>
                        <option value="Manufactura" className="bg-gray-800">🏭 Manufactura / Taller</option>
                        <option value="Otro" className="bg-gray-800">🏪 Otro (Escribir...)</option>
                    </select>

                    {selectedType === 'Otro' && (
                        <input
                            name="custom_type"
                            type="text"
                            placeholder="Escribí el rubro de tu negocio (Ej: Kiosco)"
                            className="input-field bg-white/5 border-white/10 focus:border-green-500/50 animate-in fade-in slide-in-from-top-1"
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            required={selectedType === 'Otro'}
                        />
                    )}
                </div>
                {!isEditing && <p className="text-[10px] text-secondary/40 mt-1">Si no encontrás el tuyo, elegí "Otro".</p>}
            </div>


            <div className="mt-4">
                <SubmitButton
                    formAction={handleSubmit}
                    className="btn w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-900/20"
                >
                    {isEditing ? 'Guardar Cambios' : 'Crear mi Negocio'}
                </SubmitButton>
            </div>
        </form >
    );
}
