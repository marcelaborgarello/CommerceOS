'use client';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (useCaja: boolean) => void;
}

export function PaymentModal({ isOpen, onClose, onConfirm }: PaymentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-sm text-center animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 border border-emerald-500/20 shadow-2xl shadow-emerald-900/10">
                <div className="text-4xl mb-2">💸</div>
                <h3 className="text-lg font-bold mb-2 text-white">Registrar Pago</h3>
                <p className="text-secondary mb-6 text-sm">¿De dónde sale el dinero para este pago?</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onConfirm(true)}
                        className="btn bg-emerald-600 hover:bg-emerald-500 text-white border-none py-3 shadow-lg shadow-emerald-900/20"
                    >
                        🏦 Descontar de CAJA
                    </button>
                    <button
                        onClick={() => onConfirm(false)}
                        className="btn-secondary py-3 border border-white/10 hover:bg-white/5"
                    >
                        Solo marcar como PAGADO
                    </button>
                    <button
                        onClick={onClose}
                        className="text-xs text-secondary hover:text-white mt-2 p-2"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
