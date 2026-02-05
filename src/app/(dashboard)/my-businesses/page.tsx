import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DeleteBusinessModal } from './components/DeleteBusinessModal';
import { BusinessCard } from './components/BusinessCard'; // Extracting to component for interactivity if needed, usually inline is fine but client component needed for Modal


export default async function MisNegociosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const userOrgs = await prisma.userOrganization.findMany({
        where: { userId: user.id },
        include: { organization: true },
        orderBy: { organization: { createdAt: 'desc' } }
    });



    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col items-center gap-8">
            <header className="flex flex-col items-center text-center gap-2">
                <Link href="/" className="text-4xl hover:scale-110 transition-transform mb-4 block">
                    🏠
                </Link>
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-peach to-white uppercase tracking-tight">
                    Mis Negocios
                </h1>
                <p className="text-secondary">Seleccioná el negocio que querés gestionar</p>
            </header>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Create New Card */}
                <Link href="/setup?new=true" className="glass-panel min-h-[200px] flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all group no-underline">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform text-green-400">
                        +
                    </div>
                    <span className="font-bold text-green-400 uppercase tracking-widest text-sm">Crear Nuevo</span>
                </Link>

                {/* List Businesses */}
                {userOrgs.map((rel) => (
                    <BusinessCard
                        key={rel.organization.id}
                        organization={rel.organization}
                        role={rel.role}
                    />
                ))}
            </div>
        </div>
    );
}
