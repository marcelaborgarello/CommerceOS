'use client';

import type { Commitment } from '@/types';
import { formatDate, formatCurrency, getDaysFromNow } from '@/utils/dateUtils';

interface CommitmentCardProps {
    item: Commitment;
    onEdit: (item: Commitment) => void;
    onDelete: (id: string) => void;
    onPay: (id: string) => void;
}

export function CommitmentCard({ item, onEdit, onDelete, onPay }: CommitmentCardProps) {
    // ✅ LÓGICA CENTRALIZADA: Una sola línea llamando al utilitario
    const diffDays = getDaysFromNow(item.dueDate);
    const dateDisplay = formatDate(item.dueDate, { day: '2-digit', month: 'short' });

    // --- LOGICA VISUAL (Esto sí puede ir acá porque es UI pura) ---
    let containerClass = "glass-panel p-5 relative group border-l-[3px] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-sky-900/10";
    let statusColor = "border-l-sky-500";
    let badgeClass = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    let icon = "📅";
    let statusLabel = `Vence en ${diffDays} días`;

    if (item.status === 'PAID') {
        statusColor = "border-l-emerald-500";
        containerClass += " opacity-75 hover:opacity-100";
        badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        icon = "✨";
        statusLabel = "Pagado";
    } else if (diffDays < 0) {
        statusColor = "border-l-rose-500";
        containerClass += " bg-rose-900/5";
        badgeClass = "bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 animate-pulse";
        icon = "🚨";
        statusLabel = `Vencido hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
        statusColor = "border-l-amber-500";
        containerClass += " bg-amber-900/5";
        badgeClass = "bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20";
        icon = "🔔";
        statusLabel = "Vence HOY";
    } else if (diffDays === 1) {
        statusColor = "border-l-amber-500";
        badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
        icon = "🕐";
        statusLabel = "Vence Mañana";
    }

    return (
        <div className={`${containerClass} ${statusColor} flex flex-col justify-between h-full overflow-hidden`}>
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-6xl grayscale">
                {icon}
            </div>

            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${badgeClass}`}>
                        <span>{icon}</span>
                        {statusLabel}
                    </span>

                    {item.status === 'PENDING' && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 rounded-md text-slate-400 hover:text-sky-300 hover:bg-sky-400/10 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-slate-100 text-lg leading-snug mb-1 truncate pr-2" title={item.description}>
                    {item.description}
                </h3>

                {item.provider ? (
                    <div className="text-xs text-secondary flex items-center gap-1.5 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        {item.provider.name}
                    </div>
                ) : <div className="mb-4 h-4"></div>}

                <div className="flex justify-between items-end border-t border-slate-700/30 pt-3 mt-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vence</span>
                        <span className="text-sm text-slate-300 font-medium capitalize">{dateDisplay}</span>
                    </div>
                    {/* ✅ ACÁ USAMOS EL UTILITARIO DE MONEDA */}
                    <span className="text-2xl font-black tracking-tight text-white tabular-nums">
                        {formatCurrency(Number(item.amount))}
                    </span>
                </div>
            </div>

            {/* Actions Footer */}
            {item.status === 'PENDING' && (
                <button
                    onClick={() => onPay(item.id)}
                    className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                >
                    <span>Pagar</span>
                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            )}

            {item.status === 'PAID' && (
                <div className="mt-5 w-full py-2.5 text-center text-xs text-emerald-400/80 italic border-t border-emerald-500/10">
                    Pagado el {item.paymentDate ? formatDate(item.paymentDate) : '-'}
                </div>
            )}
        </div>
    );
}