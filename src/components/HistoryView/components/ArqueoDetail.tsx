import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CashAudit } from '@/generated/prisma/client';
import type { CashAuditData } from '@/types';

interface Props {
    audit: CashAudit;
    onBack: () => void;
}

export function ArqueoDetail({ audit, onBack }: Props) {
    const router = useRouter();
    const data = audit.data as unknown as CashAuditData;

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
            <div className="flex flex-row justify-between items-center mb-4">
                <button onClick={onBack} className="btn-secondary text-sm">
                    ← Volver al Listado
                </button>
                <h2 className="section-title mb-0">Detalle del {audit.date}</h2>
            </div>

            <div className="flex flex-col gap-6 w-full">
                {/* Resumen */}
                <div className="glass-panel w-full">
                    <h3 className="section-title text-sm">📊 Resumen General</h3>
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex flex-row justify-between">
                            <span className="text-secondary">Ventas Totales:</span>
                            <span className="text-green font-bold">
                                ${audit.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-row justify-between">
                            <span className="text-secondary">Diferencia:</span>
                            <span className={audit.difference === 0 ? 'text-green' : audit.difference < 0 ? 'text-red' : 'text-accent'}>
                                ${audit.difference.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {audit.reportUrl ? (
                            <Link
                                href={audit.reportUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="btn text-sm text-center mt-4"
                            >
                                📥 Descargar Reporte Excel
                            </Link>
                        ) : (
                            <button
                                onClick={async () => {
                                    if (confirm('¿Generar el reporte Excel ahora?')) {
                                        try {
                                            const { regenerateArqueoReport } = await import('@/actions/arqueoActions');
                                            const res = await regenerateArqueoReport(audit.id);
                                            if (res.success && res.url) {
                                                router.refresh();
                                            } else {
                                                alert('Error: ' + res.error);
                                            }
                                        } catch (e) {
                                            alert('Error al regenerar: ' + e);
                                        }
                                    }
                                }}
                                className="btn-secondary text-sm text-center mt-4 border-dashed"
                            >
                                🔄 Generar Reporte Faltante
                            </button>
                        )}
                    </div>
                </div>

                {/* Observaciones */}
                {audit.notes && (
                    <div className="glass-panel w-full border-l-4 border-accent">
                        <h3 className="section-title text-sm">📝 Notas / Observaciones</h3>
                        <p className="text-sm mt-2 whitespace-pre-wrap">{audit.notes}</p>
                    </div>
                )}

                {/* Detalle de Ventas por Medio */}
                <div className="glass-panel w-full">
                    <h3 className="section-title text-sm">💰 Desglose de Ventas</h3>
                    <div className="flex flex-col gap-2 mt-4">
                        {['efectivo', 'qr', 'transferencia', 'debito', 'credito'].map(method => {
                            const totalMethod = data.sales
                                .filter(v => v.paymentMethod.toLowerCase() === method.toLowerCase())
                                .reduce((sum, v) => sum + v.amount, 0);

                            return (
                                <div key={method} className="flex flex-row justify-between text-sm">
                                    <span className={`capitalize ${totalMethod === 0 ? 'text-white/20' : 'text-secondary'}`}>
                                        {method}:
                                    </span>
                                    <span className={`font-bold ${totalMethod === 0 ? 'text-white/20' : 'text-white'}`}>
                                        ${totalMethod.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Otros Movimientos */}
                <div className="glass-panel md:col-span-2">
                    <h3 className="section-title text-sm">🔄 Otros Movimientos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Ingresos */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs uppercase font-bold text-green">Otros Ingresos</span>
                            {data.income?.others?.length > 0 ? (
                                data.income.others.map(inc => (
                                    <div key={inc.id} className="flex flex-row justify-between text-xs bg-white/5 p-2 rounded">
                                        <span>{inc.description}</span>
                                        <span className="text-green font-bold">
                                            +${inc.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-secondary italic">Sin otros ingresos</span>
                            )}
                        </div>

                        {/* Egresos */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs uppercase font-bold text-red">Otros Egresos</span>
                            {data.expenses?.others?.length > 0 ? (
                                data.expenses.others.map(exp => (
                                    <div key={exp.id} className="flex flex-col bg-white/5 p-2 rounded">
                                        <div className="flex flex-row justify-between text-xs">
                                            <span>{exp.description}</span>
                                            <span className="text-red font-bold">
                                                -${exp.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-secondary">{exp.category}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-secondary italic">Sin otros egresos</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel mt-4">
                <p className="text-secondary text-sm italic">
                    Nota: Esta es una vista simplificada. Los detalles completos se encuentran en el archivo Excel adjunto.
                </p>
            </div>
        </div>
    );
}
