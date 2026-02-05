'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { createIngreso } from '@/actions/cashActions';

interface Props {
    sessionDate: string;
    organizationId?: string;
}

export const IncomeForm = ({ sessionDate, organizationId }: Props) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isPending) return;

        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0 && description.trim()) {

            startTransition(() => {
                createIngreso(sessionDate, {
                    description: description,
                    amount: val,
                    type: 'EFECTIVO'
                }, organizationId).then(() => {
                    // Reset
                    setDescription('');
                    setAmount('');
                });
            });
        }
    };

    return (
        <div className="w-full mb-6">
            <h3 className="text-secondary mb-4 uppercase tracking-wider text-xs">Otros Ingresos</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                {/* Description */}
                <div className="w-full">
                    <div className="input-group w-full h-12">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción (ej: Aporte Socio, Cambio...)"
                            className="input-field h-full border-none focus:ring-0"
                            disabled={isPending}
                        />
                    </div>
                </div>

                {/* Amount + Button Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-10 w-full">
                        <div className="input-group w-full h-14 !border-green-500/50 focus-within:!border-green-500 focus-within:!ring-green-500/20">
                            <span className="input-prefix !text-green-400 text-xl font-bold bg-green-500/10 !border-green-500/30">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="input-field h-full text-2xl font-bold text-center border-none focus:ring-0"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 w-full">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn h-14 w-full flex items-center justify-center bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg shadow-green-900/20"
                            title="Agregar Ingreso"
                        >
                            <span className="text-3xl font-bold">{isPending ? '⏳' : '+'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
