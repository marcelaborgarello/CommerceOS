
interface Props {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({ isOpen, onConfirm, onCancel }: Props) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
            onClick={onCancel}
        >
            <div
                className="glass-panel max-w-md text-center"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold mb-4">⚠️ Confirmar eliminación</h3>
                <p className="text-secondary mb-4">
                    ¿Estás segura de que querés eliminar este registro del historial?
                    <br />
                    <small className="italic">(Esto no afectará los archivos en el Storage)</small>
                </p>
                <div className="flex flex-row gap-4">
                    <button
                        onClick={onConfirm}
                        className="btn text-sm flex-1 bg-red hover:bg-red/80"
                    >
                        Sí, eliminar
                    </button>
                    <button
                        onClick={onCancel}
                        className="btn-secondary text-sm flex-1"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
