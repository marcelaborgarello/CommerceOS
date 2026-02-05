import { CashRegisterRecord } from '@/types';

export function calculateTotals(data: CashRegisterRecord) {
    // 1. Ingresos
    const inicio = data.income.startCash + data.income.startDigital;
    const otrosIngresos = data.income.others.reduce((acc, i) => acc + i.amount, 0);
    const totalIngresos = inicio + otrosIngresos;

    // 2. Ventas
    const totalVentas = data.sales.reduce((acc, v) => acc + v.amount, 0);

    // Comisiones: Se calculan desde el campo comision de cada venta
    const totalComisionesVentas = data.expenses.commissions || 0;

    const totalVentaNeta = totalVentas - totalComisionesVentas;

    // 3. Egresos
    const totalOtrosEgresos = data.expenses.others.reduce((acc, g) => acc + g.amount, 0);

    // 4. Teórico
    // Teórico = (Inicio + Otros Ingresos) + (Ventas - Comisiones) - Gastos
    const totalTeorico = (totalIngresos + totalVentaNeta) - totalOtrosEgresos;

    return {
        totalIngresos,
        totalVentas,
        totalComisionesVentas,
        totalVentaNeta,
        totalOtrosEgresos,
        totalTeorico
    };
}
