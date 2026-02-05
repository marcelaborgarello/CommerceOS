import type { HistoryStats } from '@/types';

interface Props {
    stats: HistoryStats;
    monthName: string;
}

export function HistoryStatsCards({ stats, monthName }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {/* Sales Card */}
            <div className="glass-panel py-3 border-b-2 border-accent flex flex-col gap-3 justify-center">
                <div className="flex flex-row justify-between items-end border-b border-white/10 pb-2">
                    <span className="text-xs text-secondary uppercase">Venta Bruta (Mes)</span>
                    <span className="text-lg font-bold text-green">
                        ${stats.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="flex flex-row justify-between items-end">
                    <span className="text-xs text-secondary uppercase">Venta Neta (Mes)</span>
                    <span className="text-xl font-bold text-accent-color">
                        ${stats.totalNetSales.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>

            {/* Efficiency Card */}
            <div
                className={`glass-panel text-center py-4 border-b-2 flex flex-col gap-1 justify-center ${stats.accumulatedDifference >= 0 ? 'border-accent' : 'border-red'
                    }`}
            >
                <span className="text-xs text-secondary uppercase block">Eficiencia (Dif.)</span>
                <span
                    className={`text-xl font-bold ${stats.accumulatedDifference >= 0 ? 'text-accent' : 'text-red'
                        }`}
                >
                    ${stats.accumulatedDifference.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
            </div>

            {/* Days Worked Card */}
            <div className="glass-panel text-center py-4 border-b-2 border-white/20 flex flex-col gap-1 justify-center">
                <span className="text-xs text-secondary uppercase block">Días Trabajados</span>
                <span className="text-xl font-bold">{stats.daysWorked}</span>
            </div>
        </div>
    );
}
