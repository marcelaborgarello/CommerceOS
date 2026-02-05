'use client';

import { useRef, useTransition } from 'react';
import type { ExpenseCategory, Provider } from '@/types/index';
import { EXPENSE_CATEGORIES } from '@/types/index';
import { submitGasto } from '@/actions/formActions';

interface Props {
    sessionDate: string;
    providers?: Provider[]; // Now optional prop, passed from Server
    organizationId?: string;
}

export const ExpenseForm = ({ sessionDate, providers = [], organizationId }: Props) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, navigate] = useTransition();

    return (
        <div className="w-full mb-6">
            <h2 className="section-title text-red-400 mb-4">
                💸 Registro de Gastos
            </h2>

            <form
                ref={formRef}
                action={(formData) => {
                    navigate(() => {
                        submitGasto(formData).then(() => {
                            formRef.current?.reset();
                        });
                    });
                }}
                className="flex flex-col gap-4 w-full"
            >
                <input type="hidden" name="sessionDate" value={sessionDate} />
                <input type="hidden" name="organizationId" value={organizationId || ''} />

                {/* Row 1: Descripción (Full Width) */}
                <div className="w-full">
                    <label className="text-xs text-secondary mb-1 block uppercase tracking-wider">Descripción</label>
                    <div className="input-group w-full h-12">
                        <input
                            name="description"
                            type="text"
                            placeholder="Ej: Femsa, Panadero, Limpieza..."
                            className="input-field h-full border-none focus:ring-0"
                            required
                            disabled={isPending}
                        />
                    </div>
                </div>

                {/* Row 2: Categoría y Proveedor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="text-xs text-secondary mb-1 block uppercase tracking-wider">Categoría</label>
                        <div className="input-group w-full h-12 relative">
                            <span className="input-prefix text-lg pl-3">📂</span>
                            <select
                                name="category"
                                className="input-field h-full w-full border-none bg-transparent focus:ring-0 appearance-none cursor-pointer pl-2 pr-8"
                                defaultValue="Negocio"
                                disabled={isPending}
                            >
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="text-xs text-secondary mb-1 block uppercase tracking-wider">Proveedor (Opcional)</label>
                        <div className="input-group w-full h-12 relative">
                            <span className="input-prefix text-lg pl-3">👤</span>
                            <select
                                name="providerId"
                                className="input-field h-full w-full border-none bg-transparent focus:ring-0 appearance-none cursor-pointer pl-2 pr-8 text-sm"
                                disabled={isPending}
                            >
                                <option value="" className="bg-slate-900 text-slate-200">-- Seleccionar --</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Monto y Botón */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-10 w-full">
                        <label className="text-xs text-red-300 mb-1 block uppercase tracking-wider">Monto del Gasto</label>
                        <div className="input-group w-full h-14 !border-red-500/50 focus-within:!border-red-500 focus-within:!ring-red-500/20">
                            <span className="input-prefix !text-red-400 text-xl font-bold bg-red-500/10 !border-red-500/30">$</span>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="input-field h-full text-2xl font-bold text-center border-none focus:ring-0"
                                required
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 w-full">
                        <button
                            type="submit"
                            className="btn h-14 w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Agregar Gasto"
                            disabled={isPending}
                        >
                            <span className="text-3xl font-bold">{isPending ? '⏳' : '+'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
