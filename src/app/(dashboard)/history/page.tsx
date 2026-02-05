import { getArqueos } from '@/actions/arqueoActions';
import { HistoryView } from '@/components/HistoryView/HistoryView';

import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { redirect } from 'next/navigation';

interface Props {
    searchParams: {
        year?: string;
    }
}

export const dynamic = 'force-dynamic';
export default async function HistorialPage({ searchParams }: Props) {
    const params = await searchParams;
    const defaultYear = new Date().getFullYear();
    const year = params.year ? parseInt(params.year) : defaultYear;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const org = await getCurrentOrganization(user);
    if (!org) redirect('/setup');

    const res = await getArqueos(undefined, year, org.id);

    if (!res.success || !res.data) {
        return (
            <main className="w-full px-2 md:px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-panel text-center max-w-md mx-auto mt-10">
                        <span className="text-red" style={{ fontSize: '3rem' }}>⚠️</span>
                        <p className="text-red mt-2">{res.error || 'Error al cargar el historial'}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full px-2 md:px-6 pb-12">
            <div className="max-w-7xl mx-auto">
                <HistoryView
                    audits={res.data}
                    initialYear={year}
                />
            </div>
        </main>
    );
}
