'use server';

import prisma from '@/lib/db';
import { withAuth } from '@/utils/withAuth'; // El guardia que creamos recién
import { Provider, CashSessionData, ProviderExpense } from '@/types';
import { Prisma } from '@/generated/prisma/client';

export type ProviderData = {
    id?: string;
    name: string;
    category?: string | null;
    phone?: string | null;
    active?: boolean;
};

// 1. OBTENER PROVEEDORES (Ya no lee la cookie a ciegas)
export async function getProviders() {
    return withAuth(async (orgId) => {
        const providers = await prisma.provider.findMany({
            where: {
                organizationId: orgId,
                active: true
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: providers as Provider[] };
    });
}

// 2. GUARDAR / ACTUALIZAR PROVEEDOR
export async function saveProvider(data: ProviderData) {
    return withAuth(async (orgId) => {
        if (data.id) {
            // Update
            await prisma.provider.update({
                where: { id: data.id, organizationId: orgId }, // Verificamos orgId por seguridad
                data: {
                    name: data.name,
                    category: data.category,
                    phone: data.phone,
                    active: data.active
                }
            });
        } else {
            // Create
            await prisma.provider.create({
                data: {
                    organizationId: orgId, // Ahora sí guardamos el ID de la organización
                    name: data.name,
                    category: data.category,
                    phone: data.phone,
                    active: true
                }
            });
        }
        return { success: true };
    });
}

// 3. ELIMINAR (Soft delete)
export async function deleteProvider(id: string) {
    return withAuth(async (orgId) => {
        await prisma.provider.update({
            where: { id, organizationId: orgId },
            data: { active: false }
        });
        return { success: true };
    });
}

// 4. HISTORIAL DE GASTOS POR PROVEEDOR
export async function getProviderExpenses(providerId: string, auditId?: string) {
    return withAuth(async (orgId) => {
        // Acá podrías incluso validar que el providerId pertenezca a la orgId
        // pero por ahora vamos con la lógica que tenías protegida por withAuth

        let audits = [];
        if (auditId) {
            const audit = await prisma.cashAudit.findFirst({
                where: { id: auditId, organizationId: orgId }
            });
            audits = audit ? [audit] : [];
        } else {
            audits = await prisma.cashAudit.findMany({
                where: { organizationId: orgId },
                orderBy: { date: 'desc' }
            });
        }

        const activeSessions = await prisma.cashSession.findMany({
            where: { organizationId: orgId, status: 'OPEN' }
        });

        // ... (el resto de tu lógica de procesamiento de gastos se mantiene igual)
        // Solo asegúrate de filtrar siempre por orgId en las consultas de Prisma anteriores

        // [Copiá acá el resto de la lógica de ordenamiento y filtrado que ya tenías]
        return { success: true, data: [] }; // (Simplificado para el ejemplo)
    });
}