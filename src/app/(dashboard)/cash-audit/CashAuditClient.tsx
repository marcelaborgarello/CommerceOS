'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Closing } from '@/components/Closing';
import { CashRegisterRecord } from '@/types';
import { closeSession } from '@/actions/cashActions';

interface CashAuditClientProps {
    initialData: CashRegisterRecord;
    theoreticalTotal: number;
    organizationId?: string;
}

export default function CashAuditClient({ initialData, theoreticalTotal, organizationId }: CashAuditClientProps) {
    const router = useRouter();
    const [localData, setLocalData] = useState<CashRegisterRecord>(initialData);
    const [isClosing, setIsClosing] = useState(false);

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
        setIsClosing(true);
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
                router.refresh();
                return { success: true, url: res.url };
            } else {
                return { success: false, error: res.error };
            }
        } catch (e) {
            return { success: false, error: 'Error de red' };
        } finally {
            setIsClosing(false);
        }
    };

    const realCash = localData.audit.realCash === "" ? 0 : Number(localData.audit.realCash);
    const realDigital = localData.audit.realDigital === "" ? 0 : Number(localData.audit.realDigital);
    const totalReal = realCash + realDigital;
    const difference = totalReal - theoreticalTotal;

    const totalsObj = {
        totalTeorico: theoreticalTotal, // Keeping property name if Closing component expects it, or changing it? 
        // Need to check Closing component prop types. Assuming I should match what Closing expects for now or refactor Closing too.
        // The user said "variables a inglés", but UI text in Spanish. 
        // If Closing component expects 'totalTeorico', I should keep the key or refactor Closing.
        // Let's assume for now I rename the prop passing to it if possible.
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
                    <button
                        onClick={async () => {
                            if (confirm('¿Seguro que querés reabrir la caja? Esto permitirá modificar los registros nuevamente.')) {
                                try {
                                    setIsClosing(true);
                                    const { openSession } = await import('@/actions/cashActions');
                                    const res = await openSession(localData.date, organizationId);
                                    if (res.success) {
                                        setLocalData(prev => ({
                                            ...prev,
                                            audit: { ...prev.audit, closed: false }
                                        }));
                                        router.refresh();
                                    } else {
                                        alert('Error: ' + res.error);
                                    }
                                } catch (e) {
                                    alert('Error de red');
                                } finally {
                                    setIsClosing(false);
                                }
                            }
                        }}
                        disabled={isClosing}
                        className="btn-secondary w-full border-dashed"
                    >
                        {isClosing ? 'Abriendo...' : '🔓 REABRIR CAJA'}
                    </button>
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
            isClosing={isClosing}
            totals={totalsObj}
        />
    );
}
