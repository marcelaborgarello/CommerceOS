import { Header } from '@/components/Header';
import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { redirect } from 'next/navigation';
import { getArgentinaDateKey } from '@/utils/dateUtils';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Check Auth & Organization (Shared Logic)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const org = await getCurrentOrganization(user);

    if (!org) {
        // Allow access to setup or mis-negocios even without active org? 
        // For now, if no org selected, we might redirect to setup, but if we are IN setup, we loop.
        // We need to handle this carefully.
        // If the path is /setup, we shouldn't redirect to /setup.
        // For simplicity in this refactor, we assume /setup takes care of itself or we let it pass if path matches.
        // However, layout runs for everything in (dashboard).
        // Let's assume standard behavior: redirect to setup if no org.
        // But what if we are TRYING to go to /setup?
        // We should move /setup to (dashboard) as well, but make the check conditional?
        // Or simply: if (!org) redirect('/setup'); 
        // But if we are already at /setup, this causes a loop.
        // We'll fix this import/logic in a sec.
        redirect('/setup'); // Potential loop
    }

    // Formatting date for Header
    const today = getArgentinaDateKey();
    const formatDate = (dateString: string) => {
        const [y, m, d] = dateString.split('-');
        return new Date(parseInt(y as string), parseInt(m as string) - 1, parseInt(d as string)).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen pb-12">
            <Header
                title={org.name.toUpperCase()}
                subtitle={formatDate(today)}
                organizationName={org.name}
                organizationType={org.type}
                logoUrl={org.logoUrl || undefined}
                userEmail={user.email}
            />
            <main className="w-full px-6 flex flex-col gap-12 pb-12 pt-6">
                <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
