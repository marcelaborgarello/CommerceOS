'use server';

import prisma from '@/lib/db';
import { withAuth } from '@/utils/withAuth'; // Asegurate de que la ruta sea correcta

export interface SupplyData {
    id?: string;
    name: string;
    unit: string;
    unitCost: number;
    stock?: number;
    minStock?: number;
    providerId?: string;
    lastCost?: number;
}

// 1. OBTENER INSUMOS
export async function getSupplies() {
    return withAuth(async (orgId) => {
        const supplies = await prisma.supply.findMany({
            where: { organizationId: orgId },
            orderBy: { name: 'asc' },
            include: { provider: true }
        });
        return { success: true, data: supplies };
    });
}

// 2. GUARDAR / ACTUALIZAR INSUMO
export async function saveSupply(data: SupplyData) {
    return withAuth(async (orgId) => {
        if (data.id) {
            // Update
            const currentSupply = await prisma.supply.findUnique({
                where: { id: data.id, organizationId: orgId } // Verificamos que sea de su organización
            });

            let historyUpdate = {};
            if (currentSupply) {
                if (Math.abs((currentSupply.unitCost || 0) - data.unitCost) > 0.01) {
                    historyUpdate = { lastCost: currentSupply.unitCost };
                }
            }

            await prisma.supply.update({
                where: { id: data.id, organizationId: orgId },
                data: {
                    name: data.name,
                    unit: data.unit,
                    unitCost: data.unitCost,
                    stock: data.stock !== undefined ? data.stock : undefined,
                    minStock: data.minStock !== undefined ? data.minStock : undefined,
                    providerId: data.providerId || null,
                    ...historyUpdate
                }
            });
        } else {
            // Create
            await prisma.supply.create({
                data: {
                    organizationId: orgId,
                    name: data.name,
                    unit: data.unit,
                    unitCost: data.unitCost,
                    stock: data.stock || 0,
                    minStock: data.minStock || 5,
                    providerId: data.providerId || null,
                    lastCost: null
                }
            });
        }
        return { success: true };
    });
}

// 3. ELIMINAR INSUMO (¡Ahora con seguridad!)
export async function deleteSupply(id: string) {
    return withAuth(async (orgId) => {
        await prisma.supply.delete({
            where: {
                id: id,
                organizationId: orgId // ¡Fundamental para que no borren lo ajeno!
            }
        });
        return { success: true };
    });
}