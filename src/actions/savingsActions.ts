'use server';

// TODO: Fix TypeScript strict errors
// - Remove unused imports
// - Add null checks for split operations
// - Type all function parameters


import prisma from '@/lib/db';
import { getSession, getLatestSession } from './cashActions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getArgentinaDateKey, now } from '@/utils/dateUtils';
import type { ReserveType } from '@/types';

// Obtener saldo total de la reserva por tipo
export async function getReservaBalance(type: ReserveType = 'CASH') {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('commerceos_org_id')?.value;

        // If no org, return 0 (Safe default)
        if (!orgId) return { success: true, balance: 0 };

        const aggs = await prisma.financialReserve.aggregate({
            _sum: {
                amount: true
            },
            where: {
                type: type,
                organizationId: orgId
            }
        });
        return { success: true, balance: aggs._sum?.amount || 0 };
    } catch (error) {
        console.error('Error getting reserva balance:', error);
        return { success: false, balance: 0 };
    }
}

// Agregar transacción (Guardar o Retirar)
export async function addReservaTransaction(data: {
    amount: number,
    description: string,
    type: 'INCOME' | 'WITHDRAWAL',
    reserveType?: ReserveType
}) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('commerceos_org_id')?.value;
        if (!orgId) throw new Error("No Organization Context");

        const today = getArgentinaDateKey();
        const reserveType = data.reserveType || 'CASH';

        // 1. Validate Session
        // Note: getSession now uses English logic inside but signature is same
        let session = await getSession(today);

        // Fallback
        if (!session.success || !session.data) {
            const latest = await getLatestSession();
            if (latest.success && latest.data && !latest.data.audit.closed) {
                session = latest;
            } else {
                return { success: false, message: 'No hay caja abierta para el día de hoy. Por favor, andá al Inicio primero.' };
            }
        }

        // 2. Determine Sign
        const amount = data.type === 'INCOME' ? Math.abs(data.amount) : -Math.abs(data.amount);

        // 3. Create Record
        await prisma.financialReserve.create({
            data: {
                amount: amount,
                description: data.description,
                date: now(),
                type: reserveType,
                organizationId: orgId
            }
        });

        // 4. Impact Cash Session
        const reserveName = reserveType === 'CASH' ? 'Reserva (Caja Fuerte)' : 'Banco';

        if (session.data?.audit?.closed) {
            // double check
        }

        if (data.type === 'INCOME') {
            // Expense for Cash Register (Cash Leaves -> Goes to Reserve)
            await import('./cashActions').then(mod => mod.createGasto(
                today,
                {
                    description: `Aporte a ${reserveName}: ${data.description}`,
                    amount: Math.abs(data.amount),
                    category: 'Pagos/Inversiones',
                    providerId: undefined,
                    // type: 'EFECTIVO' implicit default
                },
                orgId
            ));

        } else {
            // Income for Cash Register (Cash Enters <- From Reserve)
            await import('./cashActions').then(mod => mod.createIngreso(
                today,
                {
                    description: `Retiro de ${reserveName}: ${data.description}`,
                    amount: Math.abs(data.amount),
                    // type: 'EFECTIVO' implicit
                },
                orgId
            ));
        }

        revalidatePath('/');
        return { success: true };

    } catch (error) {
        console.error('Error adding reserva transaction:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
}
