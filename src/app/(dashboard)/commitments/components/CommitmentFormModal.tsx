'use client';

import { useState, useEffect } from 'react';
import type { Provider } from '@/types';
import { getArgentinaDateKey } from '@/utils/dateUtils';

interface CommitmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CommitmentFormData) => void;
    initialData?: CommitmentFormData | null;
    providers: Provider[];
    isEditing: boolean;
}

export interface CommitmentFormData {
    description: string;
    amount: string;
    dueDate: string;
    providerId: string;
    notes: string;
}

const INITIAL_STATE = {
    description: '',
    amount: '',
    dueDate: '',
    providerId: '',
    notes: ''
};

export function CommitmentFormModal({ isOpen, onClose, onSave, initialData, providers, isEditing }: CommitmentFormModalProps) {
    const [formData, setFormData] = useState<CommitmentFormData>(INITIAL_STATE);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    ...INITIAL_STATE,
                    dueDate: getArgentinaDateKey()
                });
            }
        }
    }, [isOpen, initialData]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
    };

    const handleSave = () => {
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <span>📝</span> {isEditing ? 'Editar Compromiso' : 'Nuevo Compromiso'}
                </h3>
                <div className="flex flex-col gap-3" onKeyDown={handleKeyDown}>
                    <div className="space-y-1">
                        <label className="text-xs text-secondary uppercase font-bold">Descripción</label>
                        <input
                            className="input-field"
                            placeholder="Ej: Alquiler, Luz..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-secondary uppercase font-bold">Monto</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-secondary uppercase font-bold">Vencimiento</label>
                        <input
                            type="date"
                            className="input-field"
                            style={{ colorScheme: 'dark' }}
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-secondary uppercase font-bold">Proveedor (Opcional)</label>
                        <select
                            className="input-field"
                            value={formData.providerId}
                            onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                        >
                            <option value="">-- Seleccionar --</option>
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button onClick={handleSave} className="btn flex-1 bg-accent-color text-brand-dark hover:brightness-110">Guardar</button>
                        <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
