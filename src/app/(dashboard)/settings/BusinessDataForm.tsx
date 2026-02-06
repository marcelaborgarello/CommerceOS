'use client';

import { useState, useTransition } from 'react';
import { updateBusinessData } from '@/actions/settingsActions';
import Image from 'next/image';

interface Props {
    organizationData: {
        name: string;
        type: string;
        logoUrl?: string | null;
        address?: string | null;
        phone?: string | null;
        themePrimary: string;
        themeSecondary: string;
        themeAccent: string;
    };
}

export function BusinessDataForm({ organizationData }: Props) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(organizationData.logoUrl || null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);

        startTransition(async () => {
            const result = await updateBusinessData(formData);

            if (result.success) {
                setMessage({ text: result.message || 'Datos actualizados correctamente', type: 'success' });
            } else {
                setMessage({ text: result.error || 'Error al actualizar datos', type: 'error' });
            }
        });
    }

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-6">Datos del Negocio</h2>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/50 text-green-200'
                    : 'bg-red-500/10 border border-red-500/50 text-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                {/* Logo Upload */}
                <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">
                        Logo del Negocio
                    </label>

                    <div className="flex items-center gap-6">
                        {/* Logo Preview */}
                        <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {logoPreview ? (
                                <Image
                                    src={logoPreview}
                                    alt="Logo"
                                    width={96}
                                    height={96}
                                    className="object-contain"
                                />
                            ) : (
                                <span className="text-4xl">🏪</span>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1">
                            <input
                                type="file"
                                name="logo"
                                id="logo-upload"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="logo-upload"
                                className="btn bg-white/10 hover:bg-white/20 text-white px-4 py-2 cursor-pointer inline-block"
                            >
                                📸 Cambiar Logo
                            </label>
                            <p className="text-xs text-secondary mt-2">
                                Formatos: JPG, PNG. Tamaño recomendado: 500x500px
                            </p>
                        </div>
                    </div>
                </div>

                {/* Business Name */}
                <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">
                        Nombre del Negocio
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={organizationData.name}
                        required
                        placeholder="Ej: Mi Negocio"
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50 w-full"
                    />
                </div>

                {/* Business Type */}
                <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">
                        Rubro / Tipo de Negocio
                    </label>
                    <input
                        type="text"
                        name="type"
                        defaultValue={organizationData.type}
                        required
                        placeholder="Ej: Imprenta, Kiosco, Restaurante"
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50 w-full"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">
                        Dirección
                    </label>
                    <input
                        type="text"
                        name="address"
                        defaultValue={organizationData.address || ''}
                        placeholder="Ej: Av. Principal 123"
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50 w-full"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={organizationData.phone || ''}
                        placeholder="Ej: 3585062870"
                        className="input-field bg-white/5 border-white/10 focus:border-green-500/50 w-full"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-white/10">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3 disabled:opacity-50"
                    >
                        {isPending ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
