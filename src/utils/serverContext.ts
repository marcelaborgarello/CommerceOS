import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { createClient } from './supabase/server';
import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function getCurrentOrganization(user: User) {
    const cookieStore = await cookies();
    const selectedOrgId = cookieStore.get('commerceos_org_id')?.value;

    // Optimize: Try both queries in parallel if we have a selected org
    const [selectedOrg, firstOrg] = await Promise.all([
        selectedOrgId ? prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId: selectedOrgId
                }
            },
            include: { organization: true }
        }) : Promise.resolve(null),
        // Always fetch first org as fallback, but in parallel
        prisma.userOrganization.findFirst({
            where: { userId: user.id },
            include: { organization: true }
        })
    ]);

    // Return selected org if valid, otherwise fallback to first
    const org = selectedOrg?.organization || firstOrg?.organization || null;



    return org;
}


export async function getRequiredAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const org = await getCurrentOrganization(user);
    if (!org) redirect('/setup');

    return { user, org };
}