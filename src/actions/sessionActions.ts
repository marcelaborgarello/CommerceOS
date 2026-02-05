'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { createClient } from '@/utils/supabase/server';

export async function switchOrganization(organizationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No autorizado' };
    }

    // Verify user belongs to this org
    const membership = await prisma.userOrganization.findUnique({
        where: {
            userId_organizationId: {
                userId: user.id,
                organizationId: organizationId
            }
        }
    });

    if (!membership) {
        return { error: 'No tienes acceso a esta organización' };
    }

    // Set cookie
    (await
        // Set cookie
        cookies()).set('commerceos_org_id', organizationId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 365 // 1 year
        });

    revalidatePath('/', 'layout');
    return { success: true };
}
