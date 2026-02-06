'use client';

import { useState } from 'react';
import { PAYMENT_METHODS } from '@/types';
import type { PaymentMethod } from '@/types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentMethod: PaymentMethod, discount: number, surcharge: number) => void;
    total: number;
}

export function CheckoutModal({ isOpen, onClose, onConfirm, total }: CheckoutModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('EFECTIVO');
    const [discount, setDiscount] = useState<string>('');
    const [discountType, setDiscountType] = useState<'AMOUNT' | 'PERCENT'>('AMOUNT');
    const [surcharge, setSurcharge] = useState<string>('');

    if (!isOpen) return null;

    const rawDiscount = parseFloat(discount) || 0;
    const numSurcharge = parseFloat(surcharge) || 0;

    const calculatedDiscount = discountType === 'PERCENT'
        ? (total * rawDiscount) / 100
        : rawDiscount;

    const finalTotal = total - calculatedDiscount + numSurcharge;

    const handleConfirm = () => {
        onConfirm(selectedMethod, calculatedDiscount, numSurcharge);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 border-2 border-white/20 shadow-2xl">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Confirmar Venta</h2>
                    <p className="text-secondary text-sm">Seleccioná el medio de pago</p>
                </div>

                {/* Total Display */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 text-center border border-white/10">
                    <span className="text-sm text-secondary uppercase tracking-wider block mb-1">Total a Cobrar</span>
                    <span className="text-4xl font-bold text-green-400">
                        ${finalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                    {(calculatedDiscount > 0 || numSurcharge > 0) && (
                        <div className="text-xs text-secondary mt-2 flex justify-center gap-3">
                            {calculatedDiscount > 0 && <span className="text-red-300">Desc: -${calculatedDiscount.toLocaleString('es-AR')}</span>}
                            {numSurcharge > 0 && <span className="text-yellow-300">Rec: +${numSurcharge.toLocaleString('es-AR')}</span>}
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <label className="block text-sm text-secondary mb-2">Medio de Pago</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method.value}
                                onClick={() => setSelectedMethod(method.value)}
                                className={`p-3 rounded-lg border transition-all text-sm font-bold ${selectedMethod === method.value
                                    ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]'
                                    : 'bg-white/5 border-white/10 text-secondary hover:bg-white/10'
                                    }`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Extras (Discount/Surcharge) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-secondary">Descuento</label>
                            <div className="flex bg-white/10 rounded overflow-hidden">
                                <button
                                    onClick={() => setDiscountType('AMOUNT')}
                                    className={`px-2 py-0.5 text-[10px] font-bold ${discountType === 'AMOUNT' ? 'bg-green-600 text-white' : 'text-secondary hover:text-white'}`}
                                >
                                    $
                                </button>
                                <button
                                    onClick={() => setDiscountType('PERCENT')}
                                    className={`px-2 py-0.5 text-[10px] font-bold ${discountType === 'PERCENT' ? 'bg-green-600 text-white' : 'text-secondary hover:text-white'}`}
                                >
                                    %
                                </button>
                            </div>
                        </div>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="input-field w-full text-center"
                            placeholder={discountType === 'PERCENT' ? "Ej: 10" : "0"}
                        />
                        {discountType === 'PERCENT' && parseFloat(discount) > 0 && (
                            <div className="text-xs text-red-300 text-center mt-1">
                                -${((total * (parseFloat(discount) || 0)) / 100).toLocaleString('es-AR')}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs text-secondary mb-1">Recargo ($)</label>
                        <input
                            type="number"
                            value={surcharge}
                            onChange={(e) => setSurcharge(e.target.value)}
                            className="input-field w-full text-center"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn-secondary flex-1 py-3"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg hover:shadow-green-500/20"
                    >
                        ✅ CONFIRMAR
                    </button>
                </div>

            </div>
        </div>
    );
}
