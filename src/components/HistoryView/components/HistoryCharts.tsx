import type { CashAudit } from '@/generated/prisma/client';

interface Props {
    audits: CashAudit[];
    selectedMonth: number;
    selectedYear: number;
    monthName: string;
}

export function HistoryCharts({ audits, selectedMonth, selectedYear, monthName }: Props) {
    // Daily Chart Data
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const maxSales = Math.max(...audits.map(a => a.totalSales), 1000);
    const avgSales = audits.reduce((sum, a) => sum + a.totalSales, 0) / (audits.length || 1);

    return (
        <div className="flex flex-col gap-8 py-4">
            {/* Daily Sales Chart */}
            <div className="glass-panel">
                <h3 className="section-title text-sm mb-6">
                    📈 Ventas por Día ({monthName}) - Cantidad de Ventas
                </h3>
                <div className="h-64 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                        {/* Average Line */}
                        {audits.length > 0 && (
                            <g>
                                <line
                                    x1="50"
                                    y1={170 - (avgSales / maxSales) * 150}
                                    x2="950"
                                    y2={170 - (avgSales / maxSales) * 150}
                                    stroke="var(--brand-peach)"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    opacity="0.7"
                                />
                                <text
                                    x="960"
                                    y={170 - (avgSales / maxSales) * 150 + 3}
                                    fill="var(--brand-peach)"
                                    className="text-[10px]"
                                >
                                    AVG
                                </text>
                            </g>
                        )}

                        {/* Bars */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dailyAudits = audits.filter(a => a.date === dateStr);
                            const totalDailySales = dailyAudits.reduce((sum, a) => sum + a.totalSales, 0);

                            const height = totalDailySales > 0 ? (totalDailySales / maxSales) * 150 : 2;
                            const isWeekend = [0, 6].includes(new Date(selectedYear, selectedMonth, day).getDay());
                            const barWidth = 900 / daysInMonth;
                            const x = 50 + (i * barWidth);

                            return (
                                <g key={day}>
                                    <rect
                                        x={x}
                                        y={170 - height}
                                        width={barWidth - 4}
                                        height={height}
                                        fill={totalDailySales > 0 ? (isWeekend ? 'var(--accent-color)' : 'var(--success-color)') : 'rgba(255,255,255,0.05)'}
                                        rx="2"
                                    />
                                    <text
                                        x={x + (barWidth / 2)}
                                        y="190"
                                        textAnchor="middle"
                                        fill="var(--text-secondary)"
                                        className="text-[8px]"
                                    >
                                        {day}
                                    </text>
                                    {dailyAudits.length > 0 && (
                                        <text
                                            x={x + (barWidth / 2)}
                                            y={170 - height - 5}
                                            textAnchor="middle"
                                            fill="white"
                                            className="text-[8px] font-bold"
                                        >
                                            {dailyAudits.length}v
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
                <div className="flex flex-row gap-4 justify-center mt-4">
                    <div className="flex flex-row items-center gap-1">
                        <div className="w-3 h-3 bg-green rounded-full"></div>
                        <span className="text-[10px] text-secondary">Día Hábil</span>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                        <span className="text-[10px] text-secondary">Fin de Semana</span>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                        <div className="w-3 h-1 bg-brand-peach border-t border-dashed border-brand-peach"></div>
                        <span className="text-[10px] text-secondary">Promedio del Mes</span>
                    </div>
                </div>
            </div>

            {/* Info message */}
            <div className="glass-panel text-center">
                <p className="text-secondary text-sm">
                    💡 Más gráficos y análisis detallados próximamente
                </p>
            </div>
        </div>
    );
}
