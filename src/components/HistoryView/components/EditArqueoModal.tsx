import type { EditArqueoState } from '@/types';

interface Props {
    state: EditArqueoState | null;
    onUpdate: (state: EditArqueoState) => void;
    onCancel: () => void;
    onChange: (state: EditArqueoState) => void;
}

export function EditArqueoModal({ state, onUpdate, onCancel, onChange }: Props) {
    if (!state) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
            onClick={onCancel}
        >
            <div
                className="glass-panel w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="section-title text-lg mb-4">✏️ Editar Cierre</h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-secondary text-xs uppercase">Fecha del Cierre</label>
                        <input
                            type="date"
                            className="input-field"
                            value={state.date}
                            onChange={e => onChange({ ...state, date: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-secondary text-xs uppercase">Notas / Observaciones</label>
                        <textarea
                            className="input-field min-h-[100px]"
                            value={state.notes}
                            onChange={e => onChange({ ...state, notes: e.target.value })}
                            placeholder="Escribí acá tus notas..."
                        />
                    </div>

                    <div className="flex flex-row gap-2 mt-2">
                        <button
                            onClick={() => onUpdate(state)}
                            className="btn flex-1"
                        >
                            💾 Guardar Cambios
                        </button>
                        <button
                            onClick={onCancel}
                            className="btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
