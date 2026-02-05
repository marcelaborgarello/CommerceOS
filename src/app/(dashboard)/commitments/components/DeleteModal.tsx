'use client';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-sm text-center animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 border border-red-500/20 shadow-2xl shadow-red-900/10">
                <div className="text-4xl mb-2">🗑️</div>
                <h3 className="text-lg font-bold mb-2">¿Eliminar Compromiso?</h3>
                <p className="text-secondary mb-6 text-sm">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onConfirm} className="btn bg-red-600 hover:bg-red-500 text-white border-none flex-1">
                        Sí, eliminar
                    </button>
                    <button onClick={onClose} className="btn-secondary flex-1">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
