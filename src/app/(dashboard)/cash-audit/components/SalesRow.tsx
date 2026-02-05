'use client';

import { useState, useTransition } from 'react';
import type { Sale, PaymentMethod } from '@/types/index';
import { PAYMENT_METHODS, METHODS_WITH_COMMISSION } from '@/types/index';
import { updateVenta, deleteVenta } from '@/actions/cashActions';

interface Props {
    venta: Sale;
    readOnly?: boolean;
}

const getMedioPagoLabel = (medio: PaymentMethod): string => {
    const found = PAYMENT_METHODS.find(m => m.value === medio);
    return found ? found.label : medio;
};

export const SalesRow = ({ venta, readOnly = false }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editMonto, setEditMonto] = useState(venta.amount.toFixed(2));
    const [editMedioPago, setEditMedioPago] = useState<PaymentMethod>(venta.paymentMethod);
    const [editComision, setEditComision] = useState((venta.commission || 0).toFixed(2));
    const [isSaving, setIsSaving] = useState(false);

    // Delete state
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();

    const showEditComision = METHODS_WITH_COMMISSION.includes(editMedioPago);

    const handleSave = async () => {
        setIsSaving(true);
        const val = parseFloat(editMonto);
        if (!isNaN(val) && val > 0) {
            const comisionVal = showEditComision ? (parseFloat(editComision) || 0) : 0;
            // Native Action call for update
            await updateVenta(venta.id, {
                amount: val,
                paymentMethod: editMedioPago,
                commission: comisionVal,
                description: venta.description || ''
            });
            setIsEditing(false);
        }
        setIsSaving(false);
    };

    const handleDelete = () => {
        startDeleteTransition(async () => {
            await deleteVenta(venta.id);
            // Modal closes as component unmounts or we close it
            setDeleteConfirm(false);
        });
    };

    if (isEditing) {
        return (
            <div className="glass-panel mb-2" style={{ padding: '0.75rem' }}>
                <div className="flex-col">
                    <div className="flex-row items-center mb-2">
                        <div className="input-group" style={{ flex: 1.5 }}>
                            <span className="input-prefix">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={editMonto}
                                onChange={(e) => setEditMonto(e.target.value)}
                                className="input-field"
                                autoFocus
                                disabled={isSaving}
                            />
                        </div>
                        <select
                            value={editMedioPago}
                            onChange={(e) => setEditMedioPago(e.target.value as PaymentMethod)}
                            className="input-field"
                            style={{ flex: 1 }}
                            disabled={isSaving}
                        >
                            {PAYMENT_METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    {showEditComision && (
                        <div className="input-group mb-2" style={{ borderColor: 'var(--warning-color)' }}>
                            <span className="input-prefix">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={editComision}
                                onChange={(e) => setEditComision(e.target.value)}
                                placeholder="Comisión..."
                                className="input-field"
                                disabled={isSaving}
                            />
                        </div>
                    )}
                    <div className="flex-row">
                        <button onClick={handleSave} disabled={isSaving} className="btn text-sm" style={{ flex: 1 }}>
                            {isSaving ? '💾...' : '✓ Guardar'}
                        </button>
                        <button onClick={() => setIsEditing(false)} disabled={isSaving} className="btn-secondary text-sm" style={{ flex: 1 }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass-panel mb-2 p-3 transition-all hover:bg-white/5 border-l-4 border-green-500/50">
                <div className="flex flex-row justify-between items-center">
                    {/* Left: Amount & Details */}
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-green-400 text-xl tracking-tight">
                            ${venta.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className="flex flex-row items-center gap-2 text-xs text-secondary font-medium uppercase tracking-wider">
                            <span>{getMedioPagoLabel(venta.paymentMethod)}</span>
                            <span className="text-slate-600">•</span>
                            <span>{venta.time}</span>
                        </div>
                    </div>

                    {/* Right: Commission & Actions */}
                    <div className="flex flex-row items-center gap-4">
                        {venta.commission ? (
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-xs text-red-400 font-bold">
                                    -${venta.commission.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-[10px] text-red-400/60 uppercase">Comisión</span>
                            </div>
                        ) : null}

                        {!readOnly && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    ✏️
                                </button>

                                <button
                                    onClick={() => setDeleteConfirm(true)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            {deleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setDeleteConfirm(false)}
                >
                    <div
                        className="glass-panel w-full max-w-sm text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-bold mb-2">¿Eliminar Venta?</h3>
                        <p className="text-secondary text-sm mb-6">
                            Esta acción no se puede deshacer.
                        </p>

                        <div className="flex flex-row gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="btn w-full text-sm flex items-center justify-center"
                                style={{ background: 'var(--error-color)', color: 'white' }}
                            >
                                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="btn-secondary w-full text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
