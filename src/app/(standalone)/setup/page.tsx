import { SetupForm } from './components/SetupForm';
import { logout } from '@/actions/authActions';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/db';
import Link from 'next/link';

import { cookies } from 'next/headers';

export default async function SetupPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const params = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isNewMode = params?.new === 'true';
    const targetOrgId = params?.orgId as string | undefined;

    let initialData = null;

    if (user && !isNewMode) {
        // A. Specific Org Requested for Editing
        if (targetOrgId) {
            const userOrg = await prisma.userOrganization.findUnique({
                where: { userId_organizationId: { userId: user.id, organizationId: targetOrgId } }
            });
            if (userOrg) {
                initialData = await prisma.organization.findUnique({ where: { id: targetOrgId } });
            }
        }

        // B. Fallback: Contextual Edit (Cookie or First Found)
        if (!initialData) {
            const cookieStore = await cookies();
            const selectedOrgId = cookieStore.get('commerceos_org_id')?.value;

            if (selectedOrgId) {
                const userOrg = await prisma.userOrganization.findUnique({
                    where: { userId_organizationId: { userId: user.id, organizationId: selectedOrgId } }
                });
                if (userOrg) {
                    initialData = await prisma.organization.findUnique({ where: { id: selectedOrgId } });
                }
            }
        }

        // C. Last Resort: First org found
        if (!initialData) {
            const userOrg = await prisma.userOrganization.findFirst({
                where: { userId: user.id },
                include: { organization: true }
            });
            if (userOrg) {
                initialData = userOrg.organization;
            }
        }
    }

    const isEditing = !!initialData;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">

            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 border border-white/10 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Back Link */}
                {user && (
                    <Link href="/" className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors no-underline text-xs flex items-center gap-1">
                        &larr; Volver
                    </Link>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-900/40">
                        <span className="text-3xl">{isEditing ? '⚙️' : '🚀'}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isEditing ? 'Configuración' : '¡Bienvenido!'}
                    </h1>
                    <p className="text-secondary/70 text-sm">
                        {isEditing ? 'Personaliza los detalles de tu negocio.' : 'Configuremos tu espacio de trabajo en segundos.'}
                    </p>
                </div>

                {/* Form */}
                <SetupForm key={initialData?.id ?? 'new'} initialData={initialData as any} />

                {/* Footer */}
                <div className="mt-8 flex flex-col gap-4 text-center">
                    <div className="text-xs text-secondary/40">
                        &copy; 2026 CommerceOS
                    </div>

                    {!isEditing && (
                        <form action={async () => {
                            'use server';
                            await logout();
                        }} className="w-full border-t border-white/5 pt-4">
                            <button type="submit" className="text-xs text-red-400/70 hover:text-red-400 hover:underline transition-colors flex items-center justify-center gap-2 mx-auto">
                                <span>¿Te equivocaste de cuenta?</span>
                                <span className="font-semibold">Cerrar Sesión</span>
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
