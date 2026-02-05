'use client';

import { useRef, useState, useTransition } from 'react';
import { submitVenta } from '@/actions/formActions';
import { PaymentMethod, METHODS_WITH_COMMISSION } from '@/types/index';
import { PAYMENT_METHODS } from '@/types/index';

interface Props {
    sessionDate: string;
    readOnly?: boolean;
    organizationId?: string;
}

export const SalesForm = ({ sessionDate, readOnly = false, organizationId }: Props) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [medioPago, setMedioPago] = useState<PaymentMethod>('EFECTIVO');
    const [isPending, startTransition] = useTransition();

    const showComision = METHODS_WITH_COMMISSION.includes(medioPago);

    return (
        <div className="w-full mb-4">
            <form
                ref={formRef}
                action={(formData) => {
                    startTransition(async () => {
                        await submitVenta(formData);
                        formRef.current?.reset();
                        setMedioPago('EFECTIVO');
                    });
                }}
                className="flex flex-col md:flex-row gap-4 items-stretch w-full"
            >
                <input type="hidden" name="sessionDate" value={sessionDate} />
                <input type="hidden" name="organizationId" value={organizationId || ''} />

                {/* Monto - Flexible width on mobile, fixed on desktop */}
                <div className="w-full md:w-48">
                    <div className="input-group w-full h-12">
                        <span className="input-prefix">$</span>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="Monto"
                            className="input-field h-full text-center font-bold text-lg border-none focus:ring-0"
                            required
                            autoFocus
                            disabled={isPending || readOnly}
                        />
                    </div>
                </div>

                {/* Medio de Pago - Takes remaining space */}
                <div className="w-full md:flex-1">
                    <div className="input-group w-full h-12 relative">
                        <span className="input-prefix text-2xl pl-3">💳</span>
                        <select
                            name="paymentMethod"
                            className="input-field h-full w-full text-center border-none bg-transparent focus:ring-0 appearance-none cursor-pointer font-medium pr-10"
                            value={medioPago}
                            onChange={(e) => setMedioPago(e.target.value as PaymentMethod)}
                            disabled={isPending || readOnly}
                        >
                            {PAYMENT_METHODS.map(m => (
                                <option key={m.value} value={m.value} className="bg-slate-900 text-slate-200">
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom Dropdown Arrow */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-sky-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Comisión (Conditionally Visible) */}
                {showComision && (
                    <div className="w-full md:w-32 animate-in fade-in slide-in-from-right-4">
                        <div className="input-group w-full h-12 border-warning/50">
                            <span className="input-prefix text-sm text-warning">$</span>
                            <input
                                name="commission"
                                type="number"
                                step="0.01"
                                placeholder="Comisión"
                                className="input-field h-full text-sm text-center border-none focus:ring-0 placeholder:text-warning/50"
                                disabled={isPending || readOnly}
                            />
                        </div>
                    </div>
                )}

                {/* Botón */}
                <button
                    type="submit"
                    className="btn h-12 px-8 flex-1 md:flex-none justify-center bg-success text-slate-900 hover:bg-success/90 whitespace-nowrap shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPending || readOnly}
                >
                    {isPending ? '⏳' : (readOnly ? '🔒' : '+ AGREGAR')}
                </button>
            </form>
        </div>
    );
};
