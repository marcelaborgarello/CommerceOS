'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadLogo } from '@/actions/organizationActions';

interface ImageUploaderProps {
    currentUrl?: string | null;
    onUploadComplete: (url: string) => void;
}

export const ImageUploader = ({ currentUrl, onUploadComplete }: ImageUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg(null);
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadLogo(formData);

            if (!result.success || !result.url) {
                throw new Error(result.error || 'Error al subir imagen');
            }


            setPreview(result.url);
            onUploadComplete(result.url);

        } catch (error) {
            console.error("❌ Upload error:", error);
            const message = error instanceof Error ? error.message : 'Error al subir imagen. Revisa permisos.';
            setErrorMsg(message);
            // Allow user to try again
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {errorMsg && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                    ⚠️ {errorMsg}
                    <p className="text-[10px] opacity-70 mt-1">
                        Asegúrate de que el bucket "logos" tenga políticas de escritura (INSERT) habilitadas en Supabase.
                    </p>
                </div>
            )}

            <div className="flex items-center gap-6">
                {/* Preview Circle */}
                <div
                    className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-white/5 relative group transition-colors ${errorMsg ? 'border-red-500/50' : 'border-gray-600 hover:border-gray-400'}`}
                >
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Logo Preview"
                            fill
                            className="object-contain"
                            sizes="96px"
                        />
                    ) : (
                        <span className="text-4xl opacity-20">🏢</span>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn-secondary text-sm py-2 px-4 shadow-lg active:scale-95 transition-transform"
                    >
                        {uploading ? 'Subiendo...' : '📷 Subir Logo'}
                    </button>
                    <p className="text-secondary text-xs max-w-[200px]">
                        Recomendado: 200x200px. PNG o JPG.
                        Fondo transparente es mejor.
                    </p>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};
