'use client';

import { useState, useTransition } from 'react';
import { logout, updatePassword } from '@/actions/authActions';

interface Props {
    userEmail: string;
}

export function AccountSettings({ userEmail }: Props) {
    const [isPending, startTransition] = useTransition();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    async function handlePasswordChange(formData: FormData) {
        setMessage(null);

        startTransition(async () => {
            const result = await updatePassword(formData);

            if (result.success) {
                setMessage({ text: result.message || 'Contraseña actualizada correctamente', type: 'success' });
                setShowPasswordForm(false);
                // Reset form
                (document.getElementById('password-form') as HTMLFormElement)?.reset();
            } else {
                setMessage({ text: result.error || 'Error al actualizar contraseña', type: 'error' });
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Account Info */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold text-white mb-4">Información de Cuenta</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Email</label>
                        <div className="mt-1 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white">{userEmail}</p>
                        </div>
                        <p className="text-xs text-secondary mt-1">
                            Tu email no se puede cambiar. Es tu identificador único.
                        </p>
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold text-white mb-4">Seguridad</h2>

                {!showPasswordForm ? (
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="btn bg-white/10 hover:bg-white/20 text-white px-6 py-3"
                    >
                        🔐 Cambiar Contraseña
                    </button>
                ) : (
                    <form id="password-form" action={handlePasswordChange} className="space-y-4">
                        {message && (
                            <div className={`p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/50 text-green-200'
                                : 'bg-red-500/10 border border-red-500/50 text-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                                className="input-field bg-white/5 border-white/10 focus:border-green-500/50 w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                minLength={6}
                                placeholder="Repetí tu nueva contraseña"
                                className="input-field bg-white/5 border-white/10 focus:border-green-500/50 w-full mt-1"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 disabled:opacity-50"
                            >
                                {isPending ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setMessage(null);
                                }}
                                className="btn bg-white/10 hover:bg-white/20 text-white px-6 py-3"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Logout */}
            <div className="glass-panel p-6 border-l-4 border-red-500">
                <h2 className="text-xl font-bold text-white mb-2">Cerrar Sesión</h2>
                <p className="text-secondary text-sm mb-4">
                    Salir de tu cuenta en este dispositivo
                </p>
                <form action={logout}>
                    <button
                        type="submit"
                        className="btn bg-red-600 hover:bg-red-500 text-white px-6 py-3"
                    >
                        🚪 Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
