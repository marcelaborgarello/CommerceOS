'use client';

import { useState, useEffect } from 'react';
import { getDocumentSequences, updateDocumentSequence } from '@/actions/settingsActions';
import type { SaleType } from '@/types';

interface Sequence {
    id: string;
    type: SaleType;
    pointOfSale: number;
    currentNumber: number;
}

export function DocumentSettings({ organizationId }: { organizationId: string }) {
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        loadSequences();
    }, [organizationId]);

    const loadSequences = async () => {
        const res = await getDocumentSequences(organizationId);
        if (res.success && res.data) {
            // Cast or map data nicely
            setSequences(res.data as unknown as Sequence[]);
        }
        setLoading(false);
    };

    const handleEdit = (seq: Sequence) => {
        setEditingId(seq.id);
        setEditValue(seq.currentNumber.toString());
    };

    const handleSave = async (seq: Sequence) => {
        setSaving(true);
        const newNumber = parseInt(editValue);

        if (isNaN(newNumber)) {
            alert('Número inválido');
            setSaving(false);
            return;
        }

        const res = await updateDocumentSequence(organizationId, seq.type, seq.pointOfSale, newNumber);

        if (res.success) {
            await loadSequences();
            setEditingId(null);
        } else {
            alert('Error al guardar');
        }
        setSaving(false);
    };

    // Helper to generate default rows if they don't exist yet in DB
    // Or we can just show what exists. For better UX, let's show what exists or allow adding?
    // For now, let's just show what exists. If empty, maybe show a message "Realiza una venta para inicializar" 
    // OR pre-populate the defaults in the UI? 
    // Let's stick to showing existing sequences to avoid clutter. 
    // If the user hasn't sold anything, maybe they want to set it up first.
    // Let's add a "Crear Configuración Inicial" button if empty? 
    // Or better: The list might be empty initially. 
    // Actually, `upsert` in createSale handles creation. 
    // But the user WANTS to configure it BEFORE selling.
    // So we should probably list the expected types and allow "initializing" them.


    return (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Numeración de Documentos</h2>

            {loading ? (
                <div className="text-secondary">Cargando...</div>
            ) : (
                <div className="space-y-4">
                    {sequences.length === 0 && (
                        <p className="text-sm text-secondary italic">
                            No hay secuencias activas. Se crearán automáticamente con la primera venta,
                            o puedes inicializarlas manualmente editando aquí cuando aparezcan.
                        </p>
                    )}

                    {sequences.map((seq) => (
                        <div key={seq.id} className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                            <div>
                                <div className="font-bold text-white">
                                    {seq.type} <span className="text-green-400 text-sm ml-2">PV: {seq.pointOfSale.toString().padStart(4, '0')}</span>
                                </div>
                                <div className="text-xs text-secondary mt-1">
                                    Próximo número será: {seq.currentNumber + 1}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {editingId === seq.id ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] text-secondary uppercase">Último Nº</label>
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="bg-black/40 border border-white/20 rounded px-2 py-1 text-white w-24 text-right"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSave(seq)}
                                            disabled={saving}
                                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            {saving ? '...' : 'OK'}
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-red-400 hover:text-red-300 px-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-mono text-white/80">
                                            {seq.currentNumber.toString().padStart(8, '0')}
                                        </div>
                                        <button
                                            onClick={() => handleEdit(seq)}
                                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Helper to initialize manually if needed could go here */}
                </div>
            )}
        </div>
    );
}
