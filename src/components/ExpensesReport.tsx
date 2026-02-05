import { getMonthlyStats } from '@/actions/reportActions';

interface Props {
    month: number;
    year: number;
    organizationId?: string;
}

export const ExpensesReport = async ({ month, year, organizationId }: Props) => {
    // Server-side fetching directly
    const res = await getMonthlyStats(month, year, organizationId);
    if (!res.success || !res.data) {
        return <div className="p-8 text-center text-secondary">No se pudo cargar el reporte. Error: {res.error}</div>;
    }

    const stats = res.data;

    return (
        <div className="flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Tarjetas de Resumen KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ventas */}
                <div className="glass-panel p-4 flex flex-col items-center border-b-2 border-green">
                    <span className="text-xs text-secondary uppercase tracking-wider">Ventas Totales</span>
                    <span className="text-2xl font-bold text-green mt-1">
                        ${stats.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>

                {/* Comisiones */}
                <div className="glass-panel p-4 flex flex-col items-center border-b-2 border-red/50">
                    <span className="text-xs text-secondary uppercase tracking-wider">Comisiones</span>
                    <span className="text-xl font-bold text-red/80 mt-1">
                        -${stats.totalCommissions.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>

                {/* Gastos Operativos (Negocio + Compras + Inversiones) */}
                <div className="glass-panel p-4 flex flex-col items-center border-b-2 border-red">
                    <span className="text-xs text-secondary uppercase tracking-wider">Costos Operativos</span>
                    <span className="text-xl font-bold text-red mt-1">
                        -${(stats.totalOperatingExpenses + stats.totalCommissions).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-red/70 mt-1">
                        (Comis. + Negocio + Fletes + Inv.)
                    </span>
                </div>

                {/* Resultado Operativo (El dato que le importa al usuario) */}
                <div className="glass-panel p-4 flex flex-col items-center border-b-4 border-blue bg-blue/5">
                    <span className="text-xs text-blue uppercase tracking-wider font-bold">Resultado Operativo</span>
                    <span className="text-2xl font-bold text-blue mt-1">
                        ${stats.operatingProfit.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-blue/70 mt-1">
                        (Ventas - Costos Operativos)
                    </span>
                </div>

                {/* Retiros Personales / Otros */}
                <div className="glass-panel p-4 flex flex-col items-center border-b-2 border-orange-400">
                    <span className="text-xs text-orange-400 uppercase tracking-wider">Retiros / Otros</span>
                    <span className="text-xl font-bold text-orange-400 mt-1">
                        -${stats.totalWithdrawals.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-orange-400/70 mt-1">
                        (No afectan Resultado Op.)
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desglose por Categoría */}
                <div className="glass-panel">
                    <h3 className="text-sm font-bold mb-4 text-white/90">📉 Gastos por Categoría</h3>
                    <div className="flex-col gap-3">
                        {Object.entries(stats.expensesByCategory)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([cat, amount]) => {
                                // Color code based on deductibility
                                const isDeductible = ['Negocio', 'Compras/Fletes', 'Pagos/Inversiones'].includes(cat);
                                const barColor = isDeductible ? 'bg-red' : 'bg-orange-400';

                                return (
                                    <div key={cat} className="flex-col">
                                        <div className="flex-row justify-between text-xs mb-1">
                                            <span className="text-secondary">
                                                {cat} {!isDeductible && '(No Deducible)'}
                                            </span>
                                            <span className="font-bold text-white">${(amount as number).toLocaleString('es-AR')}</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${barColor}`}
                                                style={{ width: `${((amount as number) / stats.totalExpenses) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        {Object.keys(stats.expensesByCategory).length === 0 && (
                            <p className="text-xs text-secondary italic">Sin gastos registrados este mes.</p>
                        )}
                    </div>
                </div>

                {/* Desglose por Proveedor */}
                <div className="glass-panel">
                    <h3 className="text-sm font-bold mb-4 text-white/90">🚚 Gastos por Proveedor</h3>
                    <div className="flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(stats.expensesByProvider)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([prov, amount]) => (
                                <div key={prov} className="flex-row justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                                    <span className="text-xs font-bold text-white/80 truncate flex-1 pr-4">{prov}</span>
                                    <span className="text-xs font-mono text-white/60">${(amount as number).toLocaleString('es-AR')}</span>
                                </div>
                            ))}
                        {Object.keys(stats.expensesByProvider).length === 0 && (
                            <p className="text-xs text-secondary italic">Sin gastos con proveedor.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Listado Detallado de Gastos */}
            <div className="glass-panel">
                <h3 className="text-sm font-bold mb-4 text-white/90">📋 Detalle de Movimientos (Gastos)</h3>
                <div className="flex-col gap-2">
                    {stats.expenseList.map((gasto, index) => (
                        <div key={`${gasto.id}-${index}`} className="grid grid-cols-12 gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-xs items-center">
                            <div className="col-span-2 text-secondary">{gasto.date}</div>
                            <div className="col-span-4 font-bold text-white">{gasto.description}</div>
                            <div className="col-span-2 text-center">
                                <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white/70 uppercase">{gasto.category}</span>
                            </div>
                            <div className="col-span-2 text-center truncate text-secondary" title={gasto.providerName}>
                                {gasto.providerName || '-'}
                            </div>
                            <div className="col-span-2 text-right font-mono text-red font-bold">
                                -${gasto.amount.toLocaleString('es-AR')}
                            </div>
                        </div>
                    ))}
                    {stats.expenseList.length === 0 && (
                        <p className="text-center text-sm text-secondary py-8">No hay registros de gastos este mes.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
