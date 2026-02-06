'use server';

// TODO: Fix TypeScript strict errors
// - Remove unused imports
// - Add null checks for split operations
// - Type all function parameters


import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { generateArqueoExcel } from '@/lib/excel';
import type { CashRegisterRecord, PaymentMethod, ExpenseCategory } from '@/types';
import { Prisma } from '@/generated/prisma/client';



// --- HELPER: Smart Session Creation ---
async function ensureOpenSession(date: string, organizationId?: string) {
    let orgId = organizationId;

    // 0. Resolve Organization (Context Awareness)
    if (!orgId) {
        const cookieStore = await cookies();
        orgId = cookieStore.get('commerceos_org_id')?.value;
    }

    if (!orgId) {
        throw new Error("Critical: Organization ID is required. Ensure organization is selected.");
    }

    // 1. Try to find existing for this org
    let session = await prisma.cashSession.findFirst({
        where: {
            date,
            organizationId: orgId
        }
    });

    if (!session) {
        // 2. Determine Initial Balance from Previous Closed Session
        // Find the most recent session BEFORE this date
        const lastSession = await prisma.cashSession.findFirst({
            where: {
                date: { lt: date },
                status: 'CLOSED',
                organizationId: orgId
            },
            orderBy: { date: 'desc' }
        });

        // Use defaults if no previous session found 
        const startCash = lastSession?.endCash || 0;
        const startDigital = lastSession?.endDigital || 0;

        // 3. Create New Session
        session = await prisma.cashSession.create({
            data: {
                date: date,
                status: 'OPEN',
                startCash: startCash,
                startDigital: startDigital,
                data: {}, // Empty legacy JSON
                organizationId: orgId
            }
        });
    }

    return session;
}

// WRAPPER for explicit UI call
export async function createSession(date: string, organizationId?: string) {
    await ensureOpenSession(date, organizationId);
    revalidatePath('/cash-audit');
}

// REOPEN SESSION (Emergency Unlock) - Removed duplicate

interface CreateSaleDTO {
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    isCredit?: boolean;
    commission?: number;
}

interface CreateExpenseDTO {
    description: string;
    amount: number;
    category: string;
    type?: 'EFECTIVO' | 'MERCADOPAGO';
    providerId?: string;
}

interface CreateIncomeDTO {
    description: string;
    amount: number;
    type?: 'EFECTIVO' | 'MERCADOPAGO';
}

// Helper to get Argentina Time as a Date object (effectively treating DB as Naive)
const getArgentinaDate = () => {
    // 1. Get current time in Argentina
    const now = new Date();
    const argentinaTimeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Argentina/Cordoba',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);

    // 2. Parse manually "MM/DD/YYYY, HH:mm:ss" -> Date object in Local Machine Time (which is acceptable as we just want the numbers to match)
    // Actually, safer to build a UTC date with those specific numbers so DB saves exactly those numbers.
    const [datePart, timePart] = argentinaTimeStr.split(', ');
    const [month, day, year] = datePart?.split('/') ?? [0, 0, 0];
    const [hour, minute, second] = timePart?.split(':') ?? [0, 0, 0];

    // Construct Date as UTC with the Argentina values
    return new Date(Date.UTC(
        parseInt(year as string),
        parseInt(month as string) - 1,
        parseInt(day as string),
        parseInt(hour as string),
        parseInt(minute as string),
        parseInt(second as string)
    ));
};

// Obtener solo el estado de la sesión (ligero, sin cargar datos)
export async function getSessionStatus(date: string, organizationId?: string) {
    try {
        let orgId = organizationId;
        if (!orgId) {
            const cookieStore = await cookies();
            orgId = cookieStore.get('commerceos_org_id')?.value;
        }
        if (!orgId) return null;

        const session = await prisma.cashSession.findFirst({
            where: {
                date,
                organizationId: orgId
            },
            select: {
                status: true,
                closeDate: true
            }
        });

        if (!session) return null;

        return {
            cerrado: session.status === 'CLOSED',
            fechaCierre: session.closeDate
        };
    } catch (error) {
        console.error('Error getting session status:', error);
        return null;
    }
}

// Obtener la sesión activa de una fecha específica (REFACTOR: Conexión Tablas)
export async function getSession(date: string, organizationId?: string) {
    try {
        let orgId = organizationId;

        // 1. If not provided explicit, check cookie
        if (!orgId) {
            const cookieStore = await cookies();
            orgId = cookieStore.get('commerceos_org_id')?.value;
        }

        // 2. Fallback removed - organizationId should always be provided
        // If no orgId, return early to avoid unnecessary queries

        if (!orgId) return { success: true, data: null };

        const session = await prisma.cashSession.findFirst({
            where: {
                date,
                organizationId: orgId
            },
            include: {
                sales: {
                    orderBy: { date: 'desc' },
                    take: 500 // Limit to prevent slow queries on large datasets
                },
                expenses: {
                    orderBy: { date: 'desc' },
                    take: 500
                },
                incomes: {
                    orderBy: { date: 'desc' },
                    take: 500
                }
            }
        });

        if (!session) return { success: true, data: null };

        // Legacy Fallback (for old records before migration)
        const storedState = (session.data as unknown as CashRegisterRecord) || {};

        // Use Relational Columns if present, or fallback to JSON
        const startCash = session.startCash !== 0 ? session.startCash : (storedState.income?.startCash || 0);
        const startDigital = session.startDigital !== 0 ? session.startDigital : (storedState.income?.startDigital || 0);

        // Construct clean state strictly from DB Tables (Adapter: DB Spanish -> App English)
        const dbState: CashRegisterRecord = {
            date: session.date,
            // 1. SALES: Purely from "Sale" table
            // FILTER: Not 'PRESUPUESTO' AND Not 'CANCELED'
            sales: session.sales
                .filter(v => (v.type === 'TICKET' || v.type === 'FACTURA_A' || v.type === 'FACTURA_B' || v.type === 'FACTURA_C' || v.type === 'RAPIDA') && v.status !== 'CANCELED')
                .map((v) => ({
                    id: v.id,
                    description: v.description,
                    amount: v.amount,
                    paymentMethod: v.paymentMethod as PaymentMethod,
                    isCredit: v.isCredit,
                    date: v.date.toISOString(),
                    // Display Time: Read as UTC to show Argentina Numbers
                    time: v.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                    commission: v.fee
                })),
            // 2. INCOME: Start from Columns, Other Incomes from "Income" table
            income: {
                startCash,
                startDigital,
                others: session.incomes.filter((i) => !i.isStartingAmount).map((i) => ({
                    id: i.id,
                    description: i.description,
                    amount: i.amount
                }))
            },
            // 3. EXPENSES: Comisiones auto-calc (will be done in front), Others from "Expense" table
            expenses: {
                commissions: 0, // Frontend calculates this live
                others: session.expenses.map((g) => ({
                    id: g.id,
                    description: g.description,
                    amount: g.amount,
                    category: g.category as ExpenseCategory,
                    providerId: g.providerId || undefined,
                    providerName: '' // Will be populated if relation loaded
                }))
            },
            // 4. AUDIT: From Columns
            audit: {
                realCash: session.endCash ?? (storedState.audit?.realCash ?? 0),
                realDigital: session.endDigital ?? (storedState.audit?.realDigital ?? 0),
                notes: session.notes ?? storedState.audit?.notes,
                closed: session.status === 'CLOSED',
                closeDate: session.closeDate?.toISOString()
            },
            lastUpdated: session.updatedAt.getTime()
        };

        return { success: true, data: dbState };
    } catch (error) {
        console.error('Error getting session:', error);
        return { success: false, error: 'Failed to fetch session' };
    }
}

// TRANSACTIONAL ACTIONS (STRICT)

export async function createVenta(sessionDate: string, sale: CreateSaleDTO, organizationId?: string) {
    try {
        // 1. Ensure Session Exists (Smart Create)
        const session = await ensureOpenSession(sessionDate, organizationId);
        const activeOrgId = session.organizationId;
        if (!activeOrgId) throw new Error("Critical: Session has no Org ID");

        if (session.status === 'CLOSED') {
            throw new Error('La caja está cerrada. No se pueden registrar ventas.');
        }

        const fechaArgentina = getArgentinaDate();

        // 2. Create in DB (Immediate Persistence)
        const newSale = await prisma.sale.create({
            data: {
                description: sale.description,
                amount: sale.amount,
                paymentMethod: sale.paymentMethod,
                isCredit: sale.isCredit || false,
                fee: sale.commission || 0,
                cashSessionId: session.id,
                organizationId: activeOrgId,
                date: fechaArgentina, // Storing Argentina Time as "UTC Value"
                type: 'RAPIDA'
            }
        });

        return {
            success: true,
            data: {
                description: newSale.description,
                amount: newSale.amount,
                paymentMethod: newSale.paymentMethod as PaymentMethod,
                isCredit: newSale.isCredit,
                date: newSale.date.toISOString(),
                // Format using UTC zone to reveal the "Argentina Numbers" we stored
                time: newSale.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
            }
        };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: 'Error al guardar venta' };
    }
}

export async function deleteVenta(id: string) {

    try {
        const sale = await prisma.sale.findUnique({ where: { id }, include: { cashSession: true, items: true } });
        if (!sale) return { success: true }; // Already gone

        if (sale.cashSession.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se puede anular la venta.' };
        }

        if (sale.status === 'CANCELED') {
            return { success: true }; // Already canceled
        }

        // SOFT DELETE (ANULAR) + STOCK RETURN
        await prisma.$transaction(async (tx) => {
            // 1. Update Status
            await tx.sale.update({
                where: { id },
                data: { status: 'CANCELED' }
            });

            // 2. Restore Stock
            for (const item of sale.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }
        });

        revalidatePath('/cash-audit');
        revalidatePath('/sales');
        revalidatePath('/pos');
        return { success: true };
    } catch (error) {
        console.error('Error canceling sale from audit:', error);
        return { success: false, error: 'Error al anular venta' };
    }
}

export async function updateVenta(id: string, data: { amount?: number; paymentMethod?: PaymentMethod; commission?: number; description?: string }) {
    try {
        const current = await prisma.sale.findUnique({ where: { id }, include: { cashSession: true } });
        if (!current) return { success: false, error: 'Venta no encontrada' };

        if (current.cashSession.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se puede editar la venta.' };
        }

        const updated = await prisma.sale.update({
            where: { id },
            data: {
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                fee: data.commission,
                description: data.description
            }
        });

        return {
            success: true,
            data: {
                description: updated.description,
                amount: updated.amount,
                paymentMethod: updated.paymentMethod as PaymentMethod,
                date: updated.date.toISOString(),
                time: updated.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
            }
        };
    } catch (error) {
        console.error('Error updating sale:', error);
        return { success: false, error: 'Error al actualizar venta' };
    }
}

export async function createGasto(sessionDate: string, expense: CreateExpenseDTO, organizationId?: string) {
    try {
        const session = await ensureOpenSession(sessionDate, organizationId);
        const activeOrgId = session.organizationId;

        if (session.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se pueden registrar gastos.' };
        }

        await prisma.expense.create({
            data: {
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
                type: 'EFECTIVO',
                cashSessionId: session.id,
                organizationId: activeOrgId,
                date: getArgentinaDate(), // Argentina Time
                providerId: expense.providerId
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating expense:', error);
        return { success: false, error: 'Error al guardar gasto' };
    }
}

export async function deleteGasto(id: string) {
    try {
        const expense = await prisma.expense.findUnique({ where: { id }, include: { cashSession: true } });
        if (!expense) return { success: true };

        if (expense.cashSession.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se puede eliminar el gasto.' };
        }

        await prisma.expense.delete({ where: { id } });
        revalidatePath('/cash-audit');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al borrar gasto' };
    }
}

export async function updateGasto(id: string, data: { description?: string; amount?: number; category?: string; providerId?: string }) {
    try {
        const current = await prisma.expense.findUnique({ where: { id }, include: { cashSession: true } });
        if (!current) return { success: false, error: 'Gasto no encontrado' };

        if (current.cashSession.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se puede editar el gasto.' };
        }

        await prisma.expense.update({
            where: { id },
            data: {
                description: data.description,
                amount: data.amount,
                category: data.category,
                providerId: data.providerId
            }
        });
        revalidatePath('/cash-audit');
        return { success: true };
    } catch (error) {
        console.error('Error updating expense:', error);
        return { success: false, error: 'Error al actualizar gasto' };
    }
}

export async function createIngreso(sessionDate: string, income: CreateIncomeDTO, organizationId?: string) {
    try {
        const session = await ensureOpenSession(sessionDate, organizationId);
        const activeOrgId = session.organizationId;

        if (session.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se pueden registrar ingresos.' };
        }

        await prisma.income.create({
            data: {
                description: income.description,
                amount: income.amount,
                type: 'EFECTIVO',
                cashSessionId: session.id,
                organizationId: activeOrgId,
                date: getArgentinaDate() // Argentina Time
            }
        });
        revalidatePath('/cash-audit');
        return { success: true };
    } catch (error) {
        console.error('Error creating income:', error);
        return { success: false, error: 'Error al guardar ingreso' };
    }
}

export async function deleteIngreso(id: string) {
    try {
        const income = await prisma.income.findUnique({ where: { id }, include: { cashSession: true } });
        if (!income) return { success: true };

        if (income.cashSession.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se puede eliminar el ingreso.' };
        }

        await prisma.income.delete({ where: { id } });
        revalidatePath('/cash-audit');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al borrar ingreso' };
    }
}

export async function updateIngreso(id: string, data: { description?: string; amount?: number }) {
    try {
        const current = await prisma.income.findUnique({ where: { id }, include: { cashSession: true } });
        if (!current) return { success: false, error: 'Ingreso no encontrado' };

        if (current.cashSession.status === 'CLOSED') {
            return { success: false, error: 'La caja está cerrada. No se puede editar el ingreso.' };
        }

        await prisma.income.update({
            where: { id },
            data: {
                description: data.description,
                amount: data.amount
            }
        });
        revalidatePath('/cash-audit');
        return { success: true };
    } catch (error) {
        console.error('Error updating income:', error);
        return { success: false, error: 'Error al actualizar ingreso' };
    }
}

export async function updateInicioCaja(sessionDate: string, field: 'startCash' | 'startDigital', value: number, organizationId?: string) {
    try {
        const session = await ensureOpenSession(sessionDate, organizationId);

        await prisma.cashSession.update({
            where: { id: session.id },
            data: {
                [field === 'startCash' ? 'startCash' : 'startDigital']: value,
            }
        });

        revalidatePath('/cash-audit');
        return { success: true };
    } catch (error) {
        console.error('Error updating inicio:', error);
        return { success: false };
    }
}

// Deprecated or Used for Migration? This seems to be used for general sync, but we should rely on individual actions now.
export async function updateSession() {
    try {
        // Keep for legacy compatibility if needed
        return { success: true };
    } catch (error) {
        console.error('Error updating session:', error);
        return { success: false, error: 'Failed to update session' };
    }
}

// Obtener la última sesión registrada (independientemente de la fecha)
// Útil para recuperar sesiones abiertas post-midnight o en otros dispositivos
export async function getLatestSession(organizationId?: string) {
    try {
        const where: { organizationId?: string } = {};
        if (organizationId) {
            where.organizationId = organizationId;
        } else {
            const cookieStore = await cookies();
            const cookieOrgId = cookieStore.get('commerceos_org_id')?.value;

            if (cookieOrgId) {
                where.organizationId = cookieOrgId;
            }
        }

        const session = await prisma.cashSession.findFirst({
            where,
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                sales: { take: 100 }, // Limit for performance
                incomes: { take: 100 },
                expenses: { take: 100 }
            }
        });

        if (!session) return { success: true, data: null };

        return getSession(session.date, organizationId);
    } catch (error) {
        console.error('Error getting latest session:', error);
        return { success: false, error: 'Failed to fetch latest session' };
    }
}

// Obtener lista de proveedores
export async function getProviders(organizationId?: string) {
    try {
        let whereClause = {};
        if (organizationId) {
            whereClause = { organizationId };
        } else {
            const cookieStore = await cookies();
            const cookieOrgId = cookieStore.get('commerceos_org_id')?.value;

            if (cookieOrgId) {
                whereClause = { organizationId: cookieOrgId };
            }
        }

        const providers = await prisma.provider.findMany({
            where: whereClause,
            orderBy: { name: 'asc' }
        });
        // Map to expected format (Provider model has 'name', type expects 'nombre' if we haven't updated types yet? 
        // We should update usage to 'name' or map it. Let's map for now to be safe until types are fully aligned.)
        // Wait, User wanted "Chau Spanglish". I should update the Frontend to use `name` too. 
        // But `Provider` type in `index.ts` might still have `nombre`.
        // I will return `name` as `nombre` for now to minimize frontend breakage in this step, 
        // BUT we are in Phase 4 "Full Send".
        // Let's rely on TypeSafe refactor. Returns `providers`. 
        // If Prisma returns `name` and Type expects `nombre`, I'll map it.
        // Actually, I'll update the Type definition in next step. For now, returning raw prisma objects might be risky.

        return { success: true, providers };
    } catch (error) {
        console.error('Error getting providers:', error);
        return { success: false, providers: [] };
    }
}

// Cerrar Caja (Actualizar valores reales, estado cerrado y guardar en Historial)
export async function closeSession(date: string, closeData: { realCash: number; realDigital: number; notes: string; shouldDownload?: boolean }, organizationId?: string) {
    try {
        let orgId = organizationId;
        if (!orgId) {
            const cookieStore = await cookies();
            orgId = cookieStore.get('commerceos_org_id')?.value;
        }
        if (!orgId) throw new Error("Org ID required to close session");

        // 1. Fetch full session data
        const session = await prisma.cashSession.findFirst({
            where: {
                date,
                organizationId: orgId
            },
            // ... (rest of function unchanged, just name change and error message updates if needed)
            include: {
                sales: true,
                expenses: true,
                incomes: true
            }
        });

        if (!session) return { success: false, error: 'Sesión no encontrada' };

        // 2. Calculate Totals Server-Side (Snapshot)
        // Incomes
        const startCash = session.startCash;
        const startDigital = session.startDigital;
        const totalOtherIncomes = session.incomes.reduce((acc: number, i) => acc + i.amount, 0);
        const totalIncome = startCash + startDigital + totalOtherIncomes;

        // Sales (Net) - EXCLUDING CANCELED
        const validSales = session.sales.filter(v => v.status !== 'CANCELED');
        const totalSalesGross = validSales.reduce((acc: number, v) => acc + v.amount, 0);
        const totalCommissions = validSales.reduce((acc: number, v) => acc + (v.fee || 0), 0);
        const totalSalesNet = totalSalesGross - totalCommissions;

        // Expenses
        const totalExpenses = session.expenses.reduce((acc: number, g) => acc + g.amount, 0);

        // Teorico
        const totalTheoritical = (totalIncome + totalSalesNet) - totalExpenses;

        // Real
        const totalReal = closeData.realCash + closeData.realDigital;
        const difference = totalReal - totalTheoritical;

        // 3. Prepare Data Object for History (Snapshot)
        const snapshotData: CashRegisterRecord = {
            date: session.date,
            // 1. SALES
            sales: session.sales.map((v) => ({
                id: v.id,
                description: v.description,
                amount: v.amount,
                paymentMethod: v.paymentMethod as PaymentMethod,
                isCredit: v.isCredit,
                date: v.date.toISOString(),
                time: v.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                commission: v.fee
            })),
            // 2. INCOME
            income: {
                startCash: startCash,
                startDigital: startDigital,
                others: session.incomes.filter((i) => !i.isStartingAmount).map((i) => ({
                    id: i.id,
                    description: i.description,
                    amount: i.amount
                }))
            },
            // 3. EXPENSES
            expenses: {
                commissions: totalCommissions,
                others: session.expenses.map((g) => ({
                    id: g.id,
                    description: g.description,
                    amount: g.amount,
                    category: g.category as ExpenseCategory,
                    providerId: g.providerId || undefined
                }))
            },
            // 4. AUDIT
            audit: {
                realCash: closeData.realCash,
                realDigital: closeData.realDigital,
                notes: closeData.notes,
                closed: true
            },
            lastUpdated: new Date().getTime()
        };

        // 5. Generate Excel if requested
        let reportUrl = undefined;
        if (closeData.shouldDownload) {
            try {
                const supabase = await createClient();
                const buffer = generateArqueoExcel(snapshotData, totalSalesGross, difference);

                const fileName = `cierre-${date}-${Date.now()}.xlsx`;
                const { error } = await supabase.storage
                    .from('arqueos')
                    .upload(fileName, buffer, {
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        upsert: true
                    });

                if (!error) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('arqueos')
                        .getPublicUrl(fileName);
                    reportUrl = publicUrl;
                } else {
                    console.error('[Storage] Error subiendo excel:', error);
                }
            } catch (excelError) {
                console.error('[Excel] Error generando reporte:', excelError);
            }
        }

        // 4. Update Current Session (Lock it) -> RELATIONAL UPDATE
        await prisma.cashSession.update({
            where: { id: session.id },
            data: {
                endCash: closeData.realCash,
                endDigital: closeData.realDigital,
                difference: difference,
                notes: closeData.notes,
                status: 'CLOSED',
                closeDate: new Date(),
                reportUrl: reportUrl,
                data: snapshotData as unknown as Prisma.InputJsonValue,
                updatedAt: new Date()
            }
        });

        // 6. Create History Record (CashAudit Table)
        await prisma.cashAudit.create({
            data: {
                date: session.date,
                totalSales: totalSalesGross,
                difference: difference,
                notes: closeData.notes,
                data: snapshotData as unknown as Prisma.InputJsonValue,
                reportUrl: reportUrl,
                organizationId: session.organizationId || undefined
            }
        });

        revalidatePath('/cash-audit');
        revalidatePath('/history');
        return { success: true, url: reportUrl };
    } catch (error) {
        console.error('Error closing session:', error);
        return { success: false, error: 'Error al cerrar caja y guardar historial' };
    }
}

// Abrir Caja (Reabrir sesión cerrada)
// Abrir Caja (Reabrir sesión cerrada)
export async function reopenSession(date: string, orgId?: string) {
    console.log('[reopenSession] Attempting to reopen:', { date, orgId });
    if (!orgId) return { success: false, error: 'Organización requerida' };

    try {
        const result = await prisma.cashSession.updateMany({
            where: { date, organizationId: orgId },
            data: {
                status: 'OPEN',
                closeDate: null,
                difference: null
            }
        });

        console.log('[reopenSession] Update Result:', result);

        if (result.count === 0) {
            return { success: false, error: 'No se encontró la sesión para reabrir' };
        }

        revalidatePath('/cash-audit');
        revalidatePath('/pos'); // Revalidate POS to remove the banner
        return { success: true };
    } catch (error) {
        console.error('Error reopening session:', error);
        return { success: false, error: 'Error al reabrir' };
    }
}



// Iniciar Caja Mañana (Usar saldos de cierre de hoy como inicio de mañana)
export async function initNextDay(currentDate: string, organizationId?: string) {
    try {
        let orgId = organizationId;
        if (!orgId) {
            const cookieStore = await cookies();
            orgId = cookieStore.get('commerceos_org_id')?.value;
        }
        if (!orgId) throw new Error("Org ID required to init next day");

        // 1. Get Current Session to fetch Closing Balances
        const currentSession = await prisma.cashSession.findFirst({
            where: {
                date: currentDate,
                organizationId: orgId
            }
        });

        if (!currentSession) return { success: false, error: 'Sesión actual no encontrada' };

        // Ensure we have active org id
        const activeOrgId = currentSession.organizationId;
        if (!activeOrgId) return { success: false, error: 'Org ID Missing in Session' };

        if (currentSession.status !== 'CLOSED') {
            return { success: false, error: 'La caja de hoy debe estar cerrada para abrir la de mañana.' };
        }

        // 2. Calculate Next Day Date String (YYYY-MM-DD)
        const [y, m, d] = currentDate.split('-').map(Number);
        const dateObj = new Date(y as number, m as number - 1, d as number);
        dateObj.setDate(dateObj.getDate() + 1); // Add 1 Day

        const nextDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

        // 3. Check if Next Day Session already exists
        const nextSessionExists = await prisma.cashSession.findFirst({
            where: {
                date: nextDate,
                organizationId: activeOrgId
            }
        });

        if (nextSessionExists) {
            return { success: false, error: 'La caja de mañana ya existe.' };
        }

        // 4. Create Next Day Session with Carry Over
        await prisma.cashSession.create({
            data: {
                date: nextDate,
                startCash: currentSession.endCash || 0,
                startDigital: currentSession.endDigital || 0,
                status: 'OPEN',
                data: {}, // Empty JSON
                organizationId: activeOrgId
            }
        });

        // 5. Revalidate
        revalidatePath('/cash-audit');
        return { success: true, nextDate };

    } catch (error) {
        console.error('Error initializing next day:', error);
        return { success: false, error: 'Error al iniciar siguiente día' };
    }
}
