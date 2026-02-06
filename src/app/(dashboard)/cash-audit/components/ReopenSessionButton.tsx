'use client';

import { useState } from 'react';
import { reopenSession } from '@/actions/cashActions';
import { useRouter } from 'next/navigation';

interface Props {
    date: string;
    organizationId: string;
}

export function ReopenSessionButton({ date, organizationId }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsLoading(true);
        const res = await reopenSession(date, organizationId);
        setIsLoading(false);
        if (res.success) {
            setShowModal(false);
            // Refresh to update UI state
            router.refresh();
        } else {
            alert('Error al reabrir: ' + (res.error || 'Error desconocido'));
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold uppercase text-xs tracking-wider rounded-lg shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2"
            >
                🔓 Reabrir Caja
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <span className="text-4xl">🔓</span>
                            <h3 className="text-xl font-bold text-white">¿Reabrir Caja Cerrada?</h3>
                            <p className="text-secondary text-sm">
                                Esto habilitará nuevamente las ventas en el POS y borrará el cierre actual.
                                Deberás volver a contar el dinero y cerrar la caja nuevamente.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isLoading}
                                className="flex-1 py-3 rounded-lg text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20"
                            >
                                {isLoading ? 'Reabriendo...' : 'Sí, Reabrir Caja'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
