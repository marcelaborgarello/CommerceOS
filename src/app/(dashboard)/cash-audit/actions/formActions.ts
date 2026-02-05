'use server';

import { createVenta, createGasto, createIngreso, deleteVenta, deleteGasto, deleteIngreso, updateSession } from '@/actions/cashActions';
import { revalidatePath } from 'next/cache';

// --- SALES ---
// --- SALES ---
export async function submitVenta(formData: FormData) {
    const sessionDate = formData.get('sessionDate') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const paymentMethod = formData.get('paymentMethod') as any;
    const commission = parseFloat(formData.get('commission') as string) || 0;
    const organizationId = formData.get('organizationId') as string | undefined;

    if (!sessionDate || !amount || !paymentMethod) return;

    await createVenta(sessionDate, {
        description: '',
        amount: amount,
        paymentMethod: paymentMethod,
        commission: commission
    }, organizationId);
    revalidatePath('/cash-audit');
}

export async function deleteVentaAction(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;
    await deleteVenta(id);
    revalidatePath('/cash-audit');
}

// --- EXPENSES ---
// --- EXPENSES ---
export async function submitGasto(formData: FormData) {
    const sessionDate = formData.get('sessionDate') as string;
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as any;
    const providerId = formData.get('providerId') as string;
    const organizationId = formData.get('organizationId') as string | undefined;

    if (!sessionDate || !amount || !description) return;

    await createGasto(sessionDate, {
        description: description,
        amount: amount,
        category: category,
        type: 'EFECTIVO',
        providerId: providerId || undefined
    }, organizationId);
    revalidatePath('/cash-audit');
}

export async function deleteGastoAction(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;
    await deleteGasto(id);
    revalidatePath('/cash-audit');
}

// --- INCOMES ---
// --- INCOMES ---
export async function submitIngreso(formData: FormData) {
    const sessionDate = formData.get('sessionDate') as string;
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const organizationId = formData.get('organizationId') as string | undefined;

    if (!sessionDate || !amount || !description) return;

    await createIngreso(sessionDate, {
        description: description,
        amount: amount,
        type: 'EFECTIVO'
    }, organizationId);
    revalidatePath('/cash-audit');
}

export async function deleteIngresoAction(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;
    await deleteIngreso(id);
    revalidatePath('/cash-audit');
}

// --- CLOSING ---
export async function closeSessionAction(
    sessionDate: string,
    realEfectivo: number,
    realMP: number,
    observaciones: string
) {
    try {
        // Construct the "Arqueo" object to update inside the session
        // Note: updateSession expects the FULL RegistroCaja object, 
        // but we might only want to patch the 'arqueo' part.
        // Looking at cajaActions.ts, updateSession does a full replace of `data`.
        // This is dangerous if we don't have the latest data.
        // However, we are moving to Server Logic. 
        // Let's rely on fetch -> patch -> save pattern inside the action for safety.

        // Actually, let's look at cajaActions.ts again. 
        // updateSession calls prisma.cajaSesion.upsert.

        // Better approach: Create a specific logic here to fetch, update, save.
        // But I can't import `prisma` here if this file is not "use server" marked at top? 
        // It IS "use server". So I can import prisma if I want, or reuse cajaActions helpers.
        // I will attempt to use `updateSession` but I need to be careful.

        // FOR NOW: I will import `prisma` directly here or use `getSession` + `updateSession`.

        // Wait, I can't easily import `getSession` from `cajaActions` if it's a server action?
        // `cajaActions.ts` has "use server" at top. Yes.
        // So I can call `getSession`.

        // Actually, `cajaActions.ts` has `updateSession` which overwrites `data`.
        // I should probably write a dedicated `finalizeSession` in `cajaActions`? 
        // No time. I will do it here.

        // I cannot import `prisma` because `formActions.ts` is `use server`, 
        // but `prisma` is a server-side lib. That's fine in Next.js.

        // BUT to be safe and fast, I will call a new helper in `cajaActions` if I could, 
        // but I will try to implement it here via `getSession` and `updateSession`.
        // Wait, `getSession` in `cajaActions` returns a clean object, not the full DB entity. 

        // I'll assume `updateSession` is enough. 
        // We'll read the session, update the arqueo fields, and save.
        return { success: false, error: "Not implemented yet" };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}
