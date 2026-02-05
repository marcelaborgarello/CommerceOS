'use server';

import prisma from '@/lib/db';
import { CashRegisterRecord, Expense } from '@/types';
import { cookies } from 'next/headers';

export interface MonthlyStats {
    totalSales: number;
    totalCommissions: number;
    totalExpenses: number; // Total absoluto
    totalOperatingExpenses: number; // Negocio + Compras + Inversiones (Deducibles)
    totalWithdrawals: number; // Personal + Otros (No Deducibles)
    expensesByCategory: Record<string, number>;
    expensesByProvider: Record<string, number>;
    operatingProfit: number; // Ventas - Comisiones - Gastos Operativos
    netProfit: number; // Ventas - Comisiones - Total Gastos
    expenseList: (Expense & { date: string; auditId: string })[];
}

export async function getMonthlyStats(month: number, year: number, organizationId?: string) {
    try {
        let orgId = organizationId;

        if (!orgId) {
            const cookieStore = await cookies();
            orgId = cookieStore.get('commerceos_org_id')?.value;
        }

        if (!orgId) {
            return { success: false, error: "No organization selected" };
        }

        // Search by String Date Range
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

        const audits = await prisma.cashAudit.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                organizationId: orgId
            }
        });

        const stats: MonthlyStats = {
            totalSales: 0,
            totalCommissions: 0,
            totalExpenses: 0,
            totalOperatingExpenses: 0,
            totalWithdrawals: 0,
            expensesByCategory: {},
            expensesByProvider: {},
            operatingProfit: 0,
            netProfit: 0,
            expenseList: []
        };

        audits.forEach(audit => {
            const data = audit.data as unknown as CashRegisterRecord;

            // 1. Sum Sales
            const dailySales = audit.totalSales || 0;
            stats.totalSales += dailySales;

            // 2. Sum Commissions
            const dailyCommissions = data.sales.reduce((acc, v) => acc + (v.commission || 0), 0);
            stats.totalCommissions += dailyCommissions;

            // 3. Process Expenses
            if (data.expenses && data.expenses.others) {
                data.expenses.others.forEach(expense => {
                    const amount = expense.amount || 0;
                    stats.totalExpenses += amount;

                    // By Category
                    const cat = expense.category || 'Otros';
                    stats.expensesByCategory[cat] = (stats.expensesByCategory[cat] || 0) + amount;

                    // Classification: Operating vs Withdrawal
                    // DEDUCIBLE: Negocio, Compras/Fletes, Pagos/Inversiones
                    const isOperating = ['Negocio', 'Compras/Fletes', 'Pagos/Inversiones'].includes(cat);

                    if (isOperating) {
                        stats.totalOperatingExpenses += amount;
                    } else {
                        stats.totalWithdrawals += amount;
                    }

                    // By Provider
                    const prov = expense.providerName || 'Sin Proveedor';
                    stats.expensesByProvider[prov] = (stats.expensesByProvider[prov] || 0) + amount;

                    // Add to flat list
                    stats.expenseList.push({
                        ...expense,
                        date: audit.date, // audit.date is string YYYY-MM-DD
                        auditId: audit.id
                    });
                });
            }
        });

        // Calculate Profitability
        // 1. Operating Profit (Pure Business Yield)
        stats.operatingProfit = stats.totalSales - stats.totalCommissions - stats.totalOperatingExpenses;

        // 2. Net Profit (What remains in hand)
        stats.netProfit = stats.totalSales - stats.totalCommissions - stats.totalExpenses;

        // Sort expenses by date descending
        stats.expenseList.sort((a, b) => b.date.localeCompare(a.date));

        return { success: true, data: stats };

    } catch (error) {
        console.error("Error generating monthly report:", error);
        return { success: false, error: "Failed to generate report" };
    }
}
