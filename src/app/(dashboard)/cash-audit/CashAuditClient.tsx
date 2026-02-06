'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Closing } from '@/components/Closing';
import type { CashRegisterRecord } from '@/types';
import { closeSession } from '@/actions/cashActions';
import { ReopenSessionButton } from './components/ReopenSessionButton';

interface CashAuditClientProps {
    initialData: CashRegisterRecord;
    theoreticalTotal: number;
    organizationId?: string;
}

export default function CashAuditClient({ initialData, theoreticalTotal, organizationId }: CashAuditClientProps) {
    const router = useRouter();
    const [localData, setLocalData] = useState<CashRegisterRecord>(initialData);
    const [isPending, startTransition] = useTransition();

    const updateAudit = (field: 'realCash' | 'realDigital', value: number | "") => {
        setLocalData(prev => ({
            ...prev,
            audit: {
                ...prev.audit,
                [field]: value
            }
        }));
    };

    const closeSessionHandler = async (shouldDownload: boolean, notes: string = '') => {
        return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
            startTransition(async () => {
                try {
                    const realCash = localData.audit.realCash === "" ? 0 : Number(localData.audit.realCash);
                    const realDigital = localData.audit.realDigital === "" ? 0 : Number(localData.audit.realDigital);

                    const res = await closeSession(localData.date, {
                        realCash,
                        realDigital,
                        notes,
                        shouldDownload
                    }, organizationId);

                    if (res.success) {
                        // Router refresh handled by startTransition
                        resolve({ success: true, url: res.url });
                    } else {
                        resolve({ success: false, error: res.error });
                    }
                } catch (e) {
                    resolve({ success: false, error: 'Error de red' });
                }
            });
        });
    };

    const realCash = localData.audit.realCash === "" ? 0 : Number(localData.audit.realCash);
    const realDigital = localData.audit.realDigital === "" ? 0 : Number(localData.audit.realDigital);
    const totalReal = realCash + realDigital;
    const difference = totalReal - theoreticalTotal;

    const totalsObj = {
        totalTeorico: theoreticalTotal,
        totalReal,
        diferencia: difference
    };

    if (localData.audit?.closed) {
        return (
            <div className="glass-panel text-center py-8 border border-red-500/30 bg-red-900/10">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="section-title text-xl text-white mb-2">CAJA CERRADA</h3>
                <p className="text-secondary mb-6 max-w-sm mx-auto">
                    Esta sesión ha sido finalizada correctamente.
                    <br />
                    <span className="text-xs text-white/50">Fecha de cierre: {new Date(localData.audit.closeDate || Date.now()).toLocaleString()}</span>
                </p>

                <div className="flex-col gap-4 max-w-xs mx-auto">
                    <ReopenSessionButton date={localData.date} organizationId={organizationId || ''} />
                    {localData.audit.notes && (
                        <div className="text-sm text-secondary bg-black/20 p-3 rounded text-left">
                            <strong>Notas de cierre:</strong><br />
                            {localData.audit.notes}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Closing
            data={localData}
            updateArqueo={updateAudit}
            cerrarCaja={closeSessionHandler}
            isClosing={isPending}
            totals={totalsObj}
        />
    );
}
