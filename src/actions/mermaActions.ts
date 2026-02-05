'use server';

import prisma from '@/lib/db';

export async function createWastage(data: {
    productId?: string;
    productName: string;
    quantity: number;
    costPerUnit: number;
    reason?: string;
}) {
    try {
        const wastage = await prisma.wastageRecord.create({
            data: {
                productId: data.productId,
                productName: data.productName,
                quantity: data.quantity,
                unitCost: data.costPerUnit,
                reason: data.reason || 'Descarte',
                date: new Date(),
            },
        });
        return { success: true, data: wastage };
    } catch (error) {
        console.error('Error creating wastage:', error);
        return { success: false, error: 'Error al registrar merma' };
    }
}

export async function getWastage(range: 'week' | 'month' = 'week') {
    try {
        const now = new Date();
        let startDate = new Date();

        if (range === 'week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const wastageList = await prisma.wastageRecord.findMany({
            where: {
                date: {
                    gte: startDate,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        const mappedData = wastageList.map(item => ({
            id: item.id,
            productId: item.productId || undefined,
            productName: item.productName,
            quantity: item.quantity,
            unitCost: item.unitCost,
            reason: item.reason,
            date: item.date,
        }));

        return { success: true, data: mappedData };
    } catch (error) {
        console.error('Error fetching wastage:', error);
        return { success: false, error: 'Error al obtener mermas' };
    }
}

export async function deleteWastage(id: string) {
    try {
        await prisma.wastageRecord.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al eliminar merma' };
    }
}

// Alias for backward compatibility
export { createWastage as createMerma };

