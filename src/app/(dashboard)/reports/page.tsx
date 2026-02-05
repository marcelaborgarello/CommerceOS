
import { ExpensesReport } from '@/components/ExpensesReport';
import { ReportFilters } from '@/components/ReportFilters';
import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';

interface Props {
    searchParams: {
        month?: string;
        year?: string;
    }
}

export default async function ReportsPage({ searchParams }: Props) {
    const params = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Determine default date if params are missing (Server Side defaults)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const month = params.month ? parseInt(params.month) : currentMonth;
    const year = params.year ? parseInt(params.year) : currentYear;

    let orgProps = {};
    let org = null;
    if (user) {
        org = await getCurrentOrganization(user);
        if (org) {
            orgProps = {
                organizationName: org.name,
                organizationType: org.type,
                logoUrl: org.logoUrl,
                userEmail: user.email
            };
        }
    }

    return (
        <div className="min-h-screen pb-12">
            <div className="w-full px-2 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 border-b border-white/10 pb-4">
                        <h1 className="text-3xl font-bold text-white mb-1">Centro de Reportes</h1>
                        <p className="text-secondary text-sm">Análisis de Costos y Rentabilidad</p>
                    </div>
                    <ReportFilters />
                    {/* Suspense could be added here for streaming */}
                    <ExpensesReport month={month} year={year} organizationId={org?.id} />
                </div>
            </div>
        </div>
    );
}
