import type { CashAudit } from '@/generated/prisma/client';
import type { CashAuditData } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface Props {
    audits: CashAudit[];
    onSelect: (audit: CashAudit) => void;
    onEdit: (audit: CashAudit) => void;
    onDelete: (id: string) => void;
}

export function HistoryList({ audits, onSelect, onEdit, onDelete }: Props) {
    if (audits.length === 0) {
        return (
            <div className="glass-panel text-center py-12">
                <p className="text-secondary">No hay cierres registrados en este período.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold text-secondary uppercase tracking-wider border-b border-white/10">
                <div className="col-span-3">Fecha</div>
                <div className="col-span-3 text-right">Venta Total</div>
                <div className="col-span-2 text-right">Cant.</div>
                <div className="col-span-2 text-right">Diferencia</div>
                <div className="col-span-2 text-center">Acciones</div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                {audits.map(item => {
                    const data = item.data as unknown as CashAuditData;
                    const salesCount = data.sales?.length || 0;

                    return (
                        <div
                            key={item.id}
                            className="group relative glass-panel !p-0 overflow-hidden hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-accent/30 cursor-pointer"
                            onClick={() => onSelect(item)}
                        >
                            {/* Mobile View */}
                            <div className="md:hidden p-4 flex flex-col gap-3">
                                <div className="flex flex-row justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base text-white">{item.date}</span>
                                        <span className="text-xs text-secondary" suppressHydrationWarning>
                                            {formatTime(item.createdAt)} hs
                                        </span>
                                    </div>
                                    <span className={`font-bold ${item.difference === 0 ? 'text-green' : item.difference < 0 ? 'text-red' : 'text-accent'}`}>
                                        ${item.difference.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="flex flex-row justify-between items-center text-sm border-t border-white/5 pt-2">
                                    <span className="text-secondary">
                                        Venta: <span className="text-white font-bold">${item.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                                    </span>
                                    <span className="text-secondary">({salesCount} ops)</span>
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                                {/* Date */}
                                <div className="col-span-3 flex flex-col justify-center">
                                    <span className="font-bold text-white group-hover:text-accent transition-colors">
                                        {item.date}
                                    </span>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="text-xs text-secondary" suppressHydrationWarning>
                                            {formatTime(item.createdAt)} hs
                                        </span>
                                        {item.notes && <span title="Ver observaciones" className="text-xs">📝</span>}
                                    </div>
                                </div>

                                {/* Sales */}
                                <div className="col-span-3 text-right font-mono text-emerald-400 font-bold">
                                    ${item.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </div>

                                {/* Quantity */}
                                <div className="col-span-2 text-right text-secondary text-sm">
                                    {salesCount}
                                </div>

                                {/* Difference */}
                                <div className="col-span-2 text-right font-bold">
                                    <span className={item.difference === 0 ? 'text-green' : item.difference < 0 ? 'text-red' : 'text-accent'}>
                                        {item.difference > 0 ? '+' : ''}{item.difference.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex flex-row justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onEdit(item);
                                        }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="p-2 hover:bg-red-500/20 rounded-full text-red transition-colors"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
