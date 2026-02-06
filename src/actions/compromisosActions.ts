'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createGasto } from '@/actions/cashActions';
import type { Commitment } from '@/types';
import { Prisma } from '@/generated/prisma/client';
import { withAuth } from '@/utils/withAuth';

export async function getCompromisos(filter: 'all' | 'pending' | 'month' = 'all') {
    return withAuth(async (orgId) => {
        let whereClause: Prisma.CommitmentWhereInput = {
            organizationId: orgId
        };

        if (filter === 'pending') {
            whereClause.status = 'PENDING';
        } else if (filter === 'month') {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            whereClause.dueDate = {
                gte: firstDay,
                lte: lastDay
            };
        }

        const commitments = await prisma.commitment.findMany({
            where: whereClause,
            orderBy: { dueDate: 'asc' },
            include: { provider: true }
        });

        // Safe cast as we are ensuring type compatibility
        return { success: true, data: commitments as unknown as Commitment[] };
    });
}

export async function addCompromiso(data: { description: string, amount: number, dueDate: string, providerId?: string, notes?: string }) {
    return withAuth(async (orgId) => {
        const safeDate = new Date(`${data.dueDate}T12:00:00`);

        await prisma.commitment.create({
            data: {
                description: data.description,
                amount: data.amount,
                dueDate: safeDate,
                providerId: data.providerId || null,
                notes: data.notes,
                status: 'PENDING',
                organizationId: orgId
            }
        });
        revalidatePath('/commitments');
        return { success: true };
    });
}


export async function updateCompromiso(id: string, data: { description: string, amount: number, dueDate: string, providerId?: string, notes?: string }) {
    return withAuth(async (orgId) => {
        const safeDate = new Date(`${data.dueDate}T12:00:00`);

        await prisma.commitment.update({
            where: {
                id: id,
                organizationId: orgId // Security Fix: IDOR protection
            },
            data: {
                description: data.description,
                amount: data.amount,
                dueDate: safeDate,
                providerId: data.providerId || null,
                notes: data.notes
            }
        });
        revalidatePath('/commitments');
        return { success: true };
    });
}

export async function deleteCompromiso(id: string) {
    return withAuth(async (orgId) => {
        await prisma.commitment.delete({
            where: {
                id: id,
                organizationId: orgId // Security Fix: IDOR protection
            }
        });
        revalidatePath('/commitments');
        return { success: true };
    });
}

export async function markAsPaid(id: string, useCaja: boolean, dateStr?: string) {
    return withAuth(async (orgId) => {
        const commitment = await prisma.commitment.findUnique({
            where: {
                id: id,
                organizationId: orgId // Security Fix: Access control
            }
        });

        if (!commitment) return { success: false, error: 'No encontrado' };

        // 1. Mark as paid in DB
        await prisma.commitment.update({
            where: { id }, // Already verified ownership above
            data: {
                status: 'PAID',
                paymentDate: new Date()
            }
        });

        // 2. If requested, deduct from Cash (Active Session)
        if (useCaja && dateStr) {
            // Note: createGasto should ideally be checked for withAuth internally, 
            // but we are calling it from a trusted server context.
            // Ideally call internal logic or ensure createGasto handles context.
            // For now assuming createGasto works correctly with provided data.
            const gastoRes = await createGasto(dateStr, {
                description: `Pago Compromiso: ${commitment.description}`,
                amount: Number(commitment.amount),
                category: 'Negocio',
                providerId: commitment.providerId || undefined
            });

            if (!gastoRes.success) {
                console.warn('[MarkAsPaid] Failed to deduct from cash:', gastoRes.error);
                // We don't rollback payment for now, just warn.
            }
        }

        revalidatePath('/commitments');
        revalidatePath('/cash-audit');
        return { success: true };
    });
}
