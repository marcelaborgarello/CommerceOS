'use server';

// TODO: Fix TypeScript strict errors
// - Remove unused imports
// - Add null checks for split operations
// - Type all function parameters

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { SaleType } from '@/types';
import type { Features } from '@/lib/schemas/featuresSchema';
import { getCurrentOrganization } from '@/utils/serverContext';
import { createClient } from '@/utils/supabase/server';

export async function getDocumentSequences(organizationId: string) {
    try {
        const sequences = await prisma.documentSequence.findMany({
            where: { organizationId },
            orderBy: [{ type: 'asc' }, { pointOfSale: 'asc' }]
        });
        return { success: true, data: sequences };
    } catch (error) {
        return { success: false, error: 'Error al obtener secuencias' };
    }
}

export async function updateDocumentSequence(
    organizationId: string,
    type: SaleType,
    pointOfSale: number,
    newNumber: number
) {
    try {
        await prisma.documentSequence.upsert({
            where: {
                organizationId_type_pointOfSale: {
                    organizationId,
                    type,
                    pointOfSale
                }
            },
            update: { currentNumber: newNumber },
            create: {
                organizationId,
                type,
                pointOfSale,
                currentNumber: newNumber
            }
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al actualizar secuencia' }
    }
}

// ... (existing imports)

// ... (existing imports)

export async function updateFeatures(features: Features) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    const org = await getCurrentOrganization(user);
    if (!org) {
        return { success: false, error: 'Organización no encontrada' };
    }

    const organizationId = org.id;

    try {
        // Fetch current settings again just to be safe or use what we got?
        // We can just use the DB call to be atomic or simpler
        // Actually getCurrentOrganization returns the org with settings usually if configured? 
        // Let's keep the findUnique to be sure we have the latest before merging, 
        // OR just trust the merge.

        // Let's stick to the pattern:
        const currentSettings = (org.settings as any) || {};

        await prisma.organization.update({
            where: { id: organizationId },
            data: {
                settings: {
                    ...currentSettings,
                    features: features
                }
            }
        });



        revalidatePath('/settings');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Módulos actualizados correctamente' };
    } catch (error) {
        console.error('Error updating features:', error);
        return { success: false, error: 'Error al actualizar configuración' };
    }
}

export async function updateBusinessData(formData: FormData) {
    const cookieStore = await cookies();
    const organizationId = cookieStore.get('commerceos_org_id')?.value;

    if (!organizationId) {
        return { success: false, error: 'Organización no encontrada' };
    }

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;

    try {
        await prisma.organization.update({
            where: { id: organizationId },
            data: {
                name,
                type,
                address,
                phone
            }
        });

        revalidatePath('/settings');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Datos actualizados correctamente' };
    } catch (error) {
        console.error('Error updating business data:', error);
        return { success: false, error: 'Error al actualizar datos' };
    }
}
