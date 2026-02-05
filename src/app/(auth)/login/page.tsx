import { LoginForm } from './components/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">

            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 border border-white/10 shadow-2xl backdrop-blur-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        CommerceOS
                    </h1>
                    <p className="text-secondary/70 text-sm mt-2">
                        Gestión inteligente para tu negocio
                    </p>
                </div>

                {/* Interactive Login Form (Client Component) */}
                <Suspense fallback={<div className="text-center text-white/50">Cargando...</div>}>
                    <LoginForm />
                </Suspense>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-secondary/40">
                    &copy; 2026 Todos los derechos reservados
                </div>

            </div>
        </div>
    );
}
