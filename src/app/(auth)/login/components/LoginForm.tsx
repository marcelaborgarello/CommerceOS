'use client';

import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { login, signup, loginWithGoogle } from '@/actions/authActions';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Define a type that satisfies the button formAction requirement while allowing our async server action
// Using any to bypass strict React type mismatch for Server Actions in this specific setup
type ServerAction = any;

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

export function LoginForm() {
    const searchParams = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loginMode, setLoginMode] = useState<'password' | 'magiclink'>('password');

    useEffect(() => {
        const error = searchParams.get('error');
        const message = searchParams.get('message');
        if (error) setErrorMessage(error);
        if (message) setErrorMessage(message);
    }, [searchParams]);

    // Wrapper to intercept Server Action result
    async function handleAction(formData: FormData, action: typeof login | typeof signup) {
        setErrorMessage(null);
        setSuccessMessage(null);

        const result = await action(formData);
        if (result?.error) {
            setErrorMessage(result.error);
        } else {
            // If no error returned and it was signup, likely success (check email)
            if (action === signup) {
                setSuccessMessage("¡Cuenta creada! Revisá tu email para confirmar.");
            }
        }
    }

    // Handle magic link
    async function handleMagicLink(formData: FormData) {
        setErrorMessage(null);
        setSuccessMessage(null);

        const { sendMagicLink } = await import('@/actions/authActions');
        const result = await sendMagicLink(formData);

        if (result?.error) {
            setErrorMessage(result.error);
        } else if (result?.success) {
            setSuccessMessage(result.message || '¡Revisá tu email!');
        }
    }

    return (
        <div>
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                    ⚠️ {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-200 text-sm text-center">
                    📩 {successMessage}
                </div>
            )}

            {/* Google Login */}
            <form action={loginWithGoogle}>
                <SubmitButton
                    formAction={loginWithGoogle}
                    className="btn w-full py-3 bg-white text-gray-800 font-bold shadow-lg hover:bg-gray-100 flex items-center justify-center gap-3 transition-colors mb-5"
                >
                    <Image src="https://authjs.dev/img/providers/google.svg" width={20} height={20} alt="Google" />
                    <span>Ingresar con Google</span>
                </SubmitButton>
            </form>

            <div className="relative flex py-2 items-center mb-5">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-xs text-secondary/50">O usa tu email</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Toggle between Password and Magic Link */}
            <div className="flex gap-2 mb-5 bg-white/5 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setLoginMode('password')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${loginMode === 'password'
                            ? 'bg-green-600 text-white'
                            : 'text-secondary hover:text-white'
                        }`}
                >
                    Con Contraseña
                </button>
                <button
                    type="button"
                    onClick={() => setLoginMode('magiclink')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${loginMode === 'magiclink'
                            ? 'bg-green-600 text-white'
                            : 'text-secondary hover:text-white'
                        }`}
                >
                    Link por Email
                </button>
            </div>

            {/* Magic Link Form */}
            {loginMode === 'magiclink' && (
                <form className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="usuario@negocio.com"
                            className="input-field bg-white/5 border-white/10 focus:border-green-500/50"
                        />
                    </div>

                    <SubmitButton
                        formAction={handleMagicLink}
                        className="btn w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-900/20"
                    >
                        Enviar Link de Acceso
                    </SubmitButton>

                    <p className="text-xs text-center text-secondary/70">
                        Te enviaremos un link mágico para ingresar sin contraseña
                    </p>
                </form>
            )}

            {/* Password Form */}
            {loginMode === 'password' && (
                <form className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="usuario@negocio.com"
                            className="input-field bg-white/5 border-white/10 focus:border-green-500/50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="input-field bg-white/5 border-white/10 focus:border-green-500/50"
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <SubmitButton
                            formAction={async (formData: FormData) => handleAction(formData, login)}
                            className="btn w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-900/20"
                        >
                            Ingresar
                        </SubmitButton>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink mx-4 text-xs text-secondary/50">O crea tu cuenta</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <SubmitButton
                            formAction={async (formData: FormData) => handleAction(formData, signup)}
                            className="btn w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-white transition-colors"
                        >
                            Registrarse
                        </SubmitButton>
                    </div>
                </form>
            )}
        </div>
    );
}
