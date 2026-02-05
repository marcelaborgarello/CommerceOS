import { SalesForm } from './cash-audit/components/SalesForm';
import { getArgentinaDateKey } from '@/utils/dateUtils';
import { getSessionStatus } from '@/actions/cashActions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentOrganization } from '@/utils/serverContext';
import { cookies } from 'next/headers';
import type { OrganizationSettings } from '@/types';

export default async function Home() {
    // 1. Check Auth & Setup
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const today = getArgentinaDateKey();

    // 2. Parallel Fetch: Organization & Optimistic Session Status (via Cookie)
    // We fetch session status expecting the cookie to match the resolved org (99% hit rate)
    const [org, optimisticSession] = await Promise.all([
        getCurrentOrganization(user),
        getSessionStatus(today)
    ]);

    if (!org) redirect('/setup');

    // 3. Verify Session Context
    // If the resolved org is DIFFERENT from the cookie (e.g. fallback to firstOrg), 
    // we must re-fetch with the correct org.id to avoid showing data for the wrong org.
    const cookieStore = await cookies();
    const cookieOrgId = cookieStore.get('commerceos_org_id')?.value;

    let sessionStatus = optimisticSession;
    if (org.id !== cookieOrgId) {
        sessionStatus = await getSessionStatus(today, org.id);
    }

    const isClosed = sessionStatus?.cerrado || false;

    // 4. Feature Flags - Using new schema
    const settings = (org.settings as OrganizationSettings | null) || {};
    const features = settings.features || {
        stock: true,
        supplies: false,
        wastage: false,
        reserves: true,
        commitments: true,
        providers: true,
        reports: true,
        history: true,
    };


    return (
        <div className="min-h-screen pb-12">
            <main className="w-full flex flex-col gap-12 pb-12">
                <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
                    {/* Section 1: Quick Sales Entry - ALWAYS VISIBLE (Core functionality) */}
                    <section className="glass-panel p-6 mt-4 border-t-2 border-accent">
                        <div className="flex flex-row justify-between items-center mb-8">
                            <h2 className="section-title m-0">🛒 Registrar Venta</h2>
                            <span className="text-secondary text-xs italic bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Modo Rápido</span>
                        </div>
                        <SalesForm sessionDate={today} readOnly={isClosed} organizationId={org.id} />
                        {isClosed && (
                            <p className="text-center text-red-400 text-sm mt-2 font-bold animate-pulse">
                                🔒 CAJA CERRADA
                            </p>
                        )}
                    </section>

                    {/* Section 2: Navigation Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                        <Link href="/cash-audit" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-accent group no-underline">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏦</span>
                            <h3 className="text-xl font-bold mt-2 text-accent">Arqueo de Caja</h3>
                            <p className="text-secondary text-sm mt-2">Cierre del día, comprobantes y balances.</p>
                        </Link>

                        {features.reserves && (
                            <Link href="/savings" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-violet-400 group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔐</span>
                                <h3 className="text-xl font-bold mt-2 text-violet-400">Fondo de Reserva</h3>
                                <p className="text-secondary text-sm mt-2">Ahorros y movimientos de caja fuerte.</p>
                            </Link>
                        )}

                        {features.history && (
                            <Link href="/history" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-warning group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📅</span>
                                <h3 className="text-xl font-bold mt-2 text-warning">Historial</h3>
                                <p className="text-secondary text-sm mt-2">Consulta ventas y cierres anteriores.</p>
                            </Link>
                        )}

                        {features.reports && (
                            <Link href="/reports" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-brand-peach group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</span>
                                <h3 className="text-xl font-bold mt-2 text-brand-peach">Reportes</h3>
                                <p className="text-secondary text-sm mt-2">Rentabilidad, gastos y métricas.</p>
                            </Link>
                        )}

                        {features.commitments && (
                            <Link href="/commitments" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-blue-400 group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗓️</span>
                                <h3 className="text-xl font-bold mt-2 text-blue-400">Compromisos</h3>
                                <p className="text-secondary text-sm mt-2">Agenda de pagos y vencimientos.</p>
                            </Link>
                        )}

                        {features.stock && (
                            <Link href="/products" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-red-400 group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📦</span>
                                <h3 className="text-xl font-bold mt-2 text-red-400">Productos</h3>
                                <p className="text-secondary text-sm mt-2">Costos, márgenes y lista de precios.</p>
                            </Link>
                        )}

                        {features.supplies && (
                            <Link href="/supplies" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-blue-500 group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🧰</span>
                                <h3 className="text-xl font-bold mt-2 text-blue-500">Insumos</h3>
                                <p className="text-secondary text-sm mt-2">Control de Stock y Costos.</p>
                            </Link>
                        )}

                        {features.providers && (
                            <Link href="/providers" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-success group no-underline">
                                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚚</span>
                                <h3 className="text-xl font-bold mt-2 text-success">Proveedores</h3>
                                <p className="text-secondary text-sm mt-2">Gestión de proveedores y gastos.</p>
                            </Link>
                        )}

                        {/* Ticket/POS - Always visible (Core functionality) */}
                        <Link href="/pos" className="glass-panel flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 hover:border-yellow-300 group no-underline">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🧾</span>
                            <h3 className="text-xl font-bold mt-2 text-yellow-300">Ticket / POS</h3>
                            <p className="text-secondary text-sm mt-2">Punto de venta y comprobantes.</p>
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    );
}
