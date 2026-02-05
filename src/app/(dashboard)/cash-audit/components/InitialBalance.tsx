'use client';

import { useState } from 'react';
import { updateInicioCaja } from '@/actions/cashActions';

interface Props {
    sessionDate: string;
    startCash: number;
    startDigital: number;
    readOnly?: boolean;
    organizationId: string;
}

export const InitialBalance = ({ sessionDate, startCash, startDigital, readOnly = false, organizationId }: Props) => {
    // Initialize with 2 decimals
    const [efectivo, setEfectivo] = useState(startCash.toFixed(2));
    const [digital, setDigital] = useState(startDigital.toFixed(2));

    // Auto-save & Format on blur
    const handleBlur = async (field: 'startCash' | 'startDigital', value: string) => {
        if (readOnly) return;
        const num = parseFloat(value) || 0;

        // Update local state to show decimals
        if (field === 'startCash') setEfectivo(num.toFixed(2));
        if (field === 'startDigital') setDigital(num.toFixed(2));

        await updateInicioCaja(sessionDate, field, num, organizationId);
    };

    return (
        <div className="flex-row mb-4 gap-4">
            <div className="flex-col w-full">
                <label className="text-sm text-secondary">Inicio Efectivo (Día anterior)</label>
                <div className="input-group">
                    <span className="input-prefix">$</span>
                    <input
                        type="number"
                        step="0.01"
                        className={`input-field font-bold text-lg ${readOnly ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                        value={efectivo}
                        onChange={e => setEfectivo(e.target.value)}
                        onBlur={e => handleBlur('startCash', e.target.value)}
                        disabled={readOnly}
                    />
                </div>
            </div>
            <div className="flex-col w-full">
                <label className="text-sm text-secondary">Inicio Digital (Día anterior)</label>
                <div className="input-group">
                    <span className="input-prefix">$</span>
                    <input
                        type="number"
                        step="0.01"
                        className={`input-field font-bold text-lg ${readOnly ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                        value={digital}
                        onChange={e => setDigital(e.target.value)}
                        onBlur={e => handleBlur('startDigital', e.target.value)}
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
    );
};
