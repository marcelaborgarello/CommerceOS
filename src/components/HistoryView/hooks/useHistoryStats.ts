import { useMemo } from 'react';
import type { CashAudit } from '@/generated/prisma/client';
import type { HistoryStats, CashAuditData } from '@/types';

export function useHistoryStats(filteredAudits: CashAudit[]): HistoryStats {
    return useMemo(() => {
        return filteredAudits.reduce((acc, curr) => {
            const data = curr.data as unknown as CashAuditData;
            const commissions = data?.expenses?.commissions || 0;
            const totalSales = curr.totalSales || 0;
            const difference = curr.difference || 0;

            return {
                totalSales: acc.totalSales + totalSales,
                totalNetSales: acc.totalNetSales + (totalSales - commissions),
                accumulatedDifference: acc.accumulatedDifference + difference,
                daysWorked: acc.daysWorked + 1
            };
        }, {
            totalSales: 0,
            totalNetSales: 0,
            accumulatedDifference: 0,
            daysWorked: 0
        });
    }, [filteredAudits]);
}
