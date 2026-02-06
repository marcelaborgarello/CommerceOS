'use client';

import { useState, useTransition } from 'react';
import { EXPENSE_CATEGORIES } from '@/types/index';
import type { Expense, Provider } from '@/types/index';
import { deleteGasto, updateGasto } from '@/actions/cashActions';

interface Props {
    expense: Expense;
    providers?: Provider[];
    readOnly?: boolean;
}

export const ExpenseRow = ({ expense, providers = [], readOnly = false }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Edit State
    // Edit State
    const [editDesc, setEditDesc] = useState(expense.description);
    const [editMonto, setEditMonto] = useState(expense.amount.toString());
    const [editCat, setEditCat] = useState(expense.category);
    const [editProvider, setEditProvider] = useState(expense.providerId || "");

    const handleSave = () => {
        const val = parseFloat(editMonto);
        if (isNaN(val) || val <= 0) return;

        startTransition(async () => {
            await updateGasto(expense.id, {
                description: editDesc,
                amount: val,
                category: editCat,
                providerId: editProvider || undefined
            });
            setIsEditing(false);
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            await deleteGasto(expense.id);
            setDeleteConfirm(false);
        });
    };

    if (isEditing) {
        return (
            <div className="glass-panel p-4 border-l-4 border-red-500/50">
                <div className="flex flex-col gap-3">
                    {/* Row 1: Description & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="input-group">
                            <input
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                className="input-field w-full"
                                placeholder="Descripción"
                                autoFocus
                            />
                        </div>
                        <select
                            value={editCat}
                            onChange={e => setEditCat(e.target.value as any)}
                            className="input-field w-full"
                        >
                            {EXPENSE_CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Row 2: Provider & Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                            value={editProvider}
                            onChange={e => setEditProvider(e.target.value)}
                            className="input-field w-full"
                        >
                            <option value="">(Sin Proveedor)</option>
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="input-group border-red-500/50">
                            <span className="input-prefix text-red-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={editMonto}
                                onChange={e => setEditMonto(e.target.value)}
                                className="input-field font-bold"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleSave} disabled={isPending} className="btn flex-1 bg-green-600 hover:bg-green-500">
                            {isPending ? '💾...' : '✓ Guardar'}
                        </button>
                        <button onClick={() => setIsEditing(false)} disabled={isPending} className="btn-secondary flex-1">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass-panel mb-4 p-4 border-l-4 border-red-500 transition-all hover:bg-white/5">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-lg">{expense.description}</span>
                        <div className="flex flex-row gap-2 items-center text-xs text-secondary">
                            <span className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded border border-red-500/20">{expense.category}</span>
                            {expense.providerName && (
                                <span className="flex items-center gap-1 text-slate-300">
                                    <span>👤</span>
                                    {expense.providerName}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <span className="font-bold text-red-400 text-lg">
                            -${expense.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>

                        {!readOnly && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-full transition-colors"
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(true)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                                    title="Eliminar"
                                    disabled={isPending}
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Delete */}
            {deleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setDeleteConfirm(false)}
                >
                    <div
                        className="glass-panel w-full max-w-sm text-center p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-bold mb-2">¿Eliminar Gasto?</h3>
                        <p className="text-secondary mb-6">"{expense.description}"</p>
                        <div className="flex flex-row gap-3">
                            <button
                                onClick={handleDelete}
                                className="btn bg-red-600 hover:bg-red-700 w-full"
                                disabled={isPending}
                            >
                                {isPending ? 'Eliminando...' : 'Eliminar'}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="btn-secondary w-full"
                                disabled={isPending}
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
