
import { getSales } from '@/actions/saleActions';
import { getCurrentOrganization } from '@/utils/serverContext';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SalesFilters } from './components/SalesFilters';
import { SalesTable } from './components/SalesTable';
import type { SaleType } from '@/types';


interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function SalesPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const org = await getCurrentOrganization(user);
    if (!org) {
        redirect('/setup');
    }

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = 20;
    const search = params.search || '';
    const type = (params.type as SaleType | 'ALL') || 'ALL';
    const startDate = params.startDate;
    const endDate = params.endDate;

    const { data, pagination, error } = await getSales(org.id, {
        page,
        limit,
        search,
        type,
        startDate,
        endDate
    });

    const sales = data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Historial de Ventas</h1>
                <div className="text-sm text-secondary">
                    {pagination?.total || 0} Comprobantes encontrados
                </div>
            </div>

            {/* Filters Area */}
            <div className="glass-panel p-4">
                <SalesFilters
                    initialFilters={{
                        search,
                        type,
                        startDate,
                        endDate
                    }}
                />
            </div>

            {/* Sales Table */}
            <div className="glass-panel overflow-hidden">
                {error ? (
                    <div className="p-8 text-center text-red-400">
                        {error}
                    </div>
                ) : (
                    <SalesTable
                        sales={sales}
                        currentPage={page}
                        totalPages={pagination?.totalPages || 1}
                        organizationId={org.id}
                    />
                )}
            </div>
        </div>
    );
}
