'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel max-w-md w-full text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red mb-2">Algo salió mal</h2>
                <p className="text-secondary mb-6">
                    {error.message || 'Ocurrió un error inesperado'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="btn bg-accent hover:bg-accent/80"
                    >
                        Intentar de nuevo
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn-secondary"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
