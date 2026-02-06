import { getSession, getLatestSession, createSession } from '@/actions/cashActions';
import { getProviders } from '@/actions/providerActions';
import { getLastArqueo } from '@/actions/arqueoActions';
import { getArgentinaDateKey } from '@/utils/dateUtils';
import CashAuditClient from './CashAuditClient';
import { SalesForm } from './components/SalesForm';
import { SalesList } from './components/SalesList';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { IncomeForm } from './components/IncomeForm';
import { IncomeList } from './components/IncomeList';
import { InitialBalance } from './components/InitialBalance';
import { ReopenSessionButton } from './components/ReopenSessionButton';

import type { CashRegisterRecord, Provider } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { redirect } from 'next/navigation';

// ... imports

// SERVER COMPONENT
export const dynamic = 'force-dynamic';
export default async function ArqueoPage() {
    const today = getArgentinaDateKey();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const org = await getCurrentOrganization(user);

    if (!org) {
        redirect('/setup');
    }

    // Moved helper up to avoid ReferenceError
    const formatDate = (dateString: string) => {
        const [y, m, d] = dateString.split('-');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    let initialData: CashRegisterRecord | null = null;
    let providers: Provider[] = [];

    try {
        // Parallel data fetching for better performance
        const [sessionRes, providersRes] = await Promise.all([
            getSession(today, org.id),
            getProviders()
        ]);

        if (providersRes.success) {
            providers = providersRes.data || [];
        }

        if (sessionRes.success && sessionRes.data) {
            initialData = sessionRes.data;
            // Fix for empty initial balance if needed
            if (initialData.income.startCash === 0 && initialData.income.startDigital === 0) {
                const lastArqueoRes = await getLastArqueo(org.id);
                if (lastArqueoRes.success && lastArqueoRes.data) {
                    if (lastArqueoRes.data.effective > 0 || lastArqueoRes.data.mp > 0) {
                        initialData = {
                            ...initialData,
                            income: {
                                ...initialData.income,
                                startCash: lastArqueoRes.data.effective,
                                startDigital: lastArqueoRes.data.mp
                            }
                        };
                    }
                }
            }
        } else {
            // 2. Try to recover open session from previous day
            const latestRes = await getLatestSession(org.id);
            if (latestRes.success && latestRes.data && !latestRes.data.audit?.closed) {
                initialData = latestRes.data;
            } else {
                // 3. NO Session -> Require Manual Start
                // We do NOT create a session automatically here anymore.
                // We pass null, and the UI will show the "Abrir Caja" button.
                initialData = null;
            }
        }
    } catch (e) {
        console.error("SSR Error:", e);
    }

    if (!initialData) {
        return (
            <div className="min-h-screen pb-12">
                <div className="pt-8 px-6 text-center">
                    <h1 className="text-3xl font-bold text-white mb-1">ARQUEO DIARIO {formatDate(today)}</h1>
                </div>
                <div className="w-full px-6 flex flex-col gap-6 items-center justify-center pt-20">
                    <div className="glass-panel w-full max-w-md text-center p-8 flex flex-col gap-6 items-center border border-white/10 shadow-2xl">
                        <span className="text-6xl">🌅</span>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold text-white">¡Buen día!</h2>
                            <p className="text-secondary text-base">
                                La caja aún no ha sido iniciada para el día de hoy.
                            </p>
                            <p className="text-sm text-secondary/70 italic">
                                Al iniciar, se importará automáticamente el saldo de la última sesión cerrada.
                            </p>
                        </div>

                        <form action={async () => {
                            'use server';
                            await createSession(today, org.id);
                        }} className="w-full">
                            <button
                                type="submit"
                                className="btn w-full py-4 text-lg font-bold shadow-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transform hover:scale-[1.02] transition-all"
                            >
                                🚀 Iniciar Caja de Hoy
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Server-side calculation of Totals
    // We calculate this HERE on the server to render the "Resumen Global" directly as HTML
    const totals = {
        totalIngresos: (initialData.income.startCash + initialData.income.startDigital) + initialData.income.others.reduce((acc, i) => acc + i.amount, 0),
        totalVentas: initialData.sales.reduce((acc, v) => acc + v.amount, 0),
        // Use stored commissions or 0. In future this should be sum(v.commission)
        totalComisionesVentas: initialData.sales.reduce((acc, v) => acc + (v.commission || 0), 0),
        totalOtrosEgresos: initialData.expenses.others.reduce((acc, g) => acc + g.amount, 0)
    };

    // Derived
    const totalVentaNeta = totals.totalVentas - totals.totalComisionesVentas;
    const totalTeorico = (totals.totalIngresos + totalVentaNeta) - totals.totalOtrosEgresos;

    // Check Closure State
    const isClosed = initialData.audit?.closed || false;

    return (
        <div className="min-h-screen pb-12">

            <div className="w-full px-6 flex flex-col gap-6">
                <div className="max-w-7xl mx-auto w-full">

                    {isClosed && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 text-red-200">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔒</span>
                                <div>
                                    <h3 className="font-bold">CAJA CERRADA</h3>
                                    <p className="text-sm opacity-80">La sesión está cerrada. Para volver a operar, podés reabrirla si fue un error.</p>
                                </div>
                            </div>

                            {/* REOPEN BUTTON */}
                            <ReopenSessionButton date={initialData.date} organizationId={org.id} />
                        </div>
                    )}

                    {/* Responsive Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

                        {/* Column 1: Sales */}
                        <div className="flex-col gap-4">
                            {!isClosed && <SalesForm sessionDate={initialData.date} organizationId={org.id} />}
                            <SalesList ventas={initialData.sales} totalVentas={totals.totalVentas} readOnly={isClosed} />
                        </div>

                        {/* Column 2: Incomes & Expenses (Full Server Control) */}
                        <div className="flex-col gap-4">
                            {/* 1. Initial Balance & Incomes */}
                            <div className="glass-panel">
                                <h2 className="section-title text-green">📈 Ingresos</h2>
                                <InitialBalance
                                    sessionDate={initialData.date}
                                    startCash={initialData.income.startCash}
                                    startDigital={initialData.income.startDigital}
                                    readOnly={isClosed}
                                    organizationId={org.id}
                                />
                                <div className="my-3 border-t border-gray-700/50"></div>
                                {!isClosed && <IncomeForm sessionDate={initialData.date} organizationId={org.id} />}
                                <IncomeList income={initialData.income.others} readOnly={isClosed} />
                            </div>

                            {/* 2. Expenses */}
                            <div className="flex flex-col gap-2">
                                {!isClosed && <ExpenseForm sessionDate={initialData.date} providers={providers} organizationId={org.id} />}
                                <ExpenseList
                                    expenses={initialData.expenses.others}
                                    totalExpenses={totals.totalOtrosEgresos}
                                    providers={providers}
                                    readOnly={isClosed}
                                />
                            </div>
                        </div>

                        {/* Column 3: Summary (Server Rendered) & Closing (Client) */}
                        <div className="flex flex-col gap-6">

                            {/* Server-Side Rendered Summary Card - NO CLIENT JS REQUIRED */}
                            <div className="glass-panel w-full">
                                <h2 className="section-title">📊 Resumen Global</h2>
                                <div className="flex flex-col gap-4 text-sm mt-4">
                                    <div className="flex flex-row justify-between items-center">
                                        <span className="text-secondary">Ingresos (Inicio + Otros)</span>
                                        <span className="text-xl font-bold text-emerald-400">${totals.totalIngresos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="flex flex-col gap-2 py-3" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                        <div className="flex flex-row justify-between items-center">
                                            <span className="text-secondary">Ventas Totales</span>
                                            <span className="font-bold text-emerald-400">${totals.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex flex-row justify-between items-center text-xs">
                                            <span className="text-secondary">(-) Comisión Bancaria</span>
                                            <span className="text-red-400">-${totals.totalComisionesVentas.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex flex-row justify-between items-center mt-1">
                                            <span className="font-bold">VENTA NETA</span>
                                            <span className="text-xl font-bold text-emerald-400">${totalVentaNeta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-secondary">Gastos Operativos</span>
                                            <span className="text-xs text-secondary italic">(Negocio, Fletes, Personal)</span>
                                        </div>
                                        <span className="text-xl font-bold text-red-400">-${totals.totalOtrosEgresos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="flex flex-row justify-between items-center font-bold pt-4" style={{ borderTop: '2px dashed var(--border-color)' }}>
                                        <div className="flex flex-col">
                                            <span className="text-secondary text-xs uppercase tracking-wider">Teórico Final en Caja</span>
                                            <span className="text-2xl text-sky-400">${totalTeorico.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Component ONLY for the interactive Closing Form */}
                            <CashAuditClient initialData={initialData} theoreticalTotal={totalTeorico} organizationId={org.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
