'use server';

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getDefaultFeaturesByType } from '@/lib/schemas/featuresSchema';
import type { Settings } from '@/lib/schemas/featuresSchema';

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}


function getDefaultSettings(type: string): Settings {
    return {
        features: getDefaultFeaturesByType(type),
        terminology: {
            product: 'Producto'
        }
    };
}

export async function createOrganization(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!name || !type) {
        return { error: 'Nombre y tipo son requeridos' };
    }

    const slug = slugify(name) + '-' + Math.floor(Math.random() * 1000);

    try {
        // Transaction to ensure everything is created or nothing is
        const org = await prisma.$transaction(async (tx) => {

            // 1. Create Organization
            const newOrg = await tx.organization.create({
                data: {
                    name,
                    slug,
                    type,
                    address: formData.get('address') as string || null,
                    phone: formData.get('phone') as string || null,
                    // Default theme (Green/Nature for now, can be customized later)
                    themePrimary: '#557A2A',
                    themeSecondary: '#F0EDD8',
                    themeAccent: '#FFDEB8',
                    settings: getDefaultSettings(type)
                }
            });

            // 2. Add User as Owner
            await tx.userOrganization.create({
                data: {
                    userId: user.id,
                    organizationId: newOrg.id,
                    role: 'OWNER'
                }
            });

            // 3. Create Initial "Closed" Session to serve as baseline
            await tx.cashSession.create({
                data: {
                    // Create session for YESTERDAY so today is free to open
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    status: 'CLOSED',
                    startCash: 0,
                    startDigital: 0,
                    endCash: 0,
                    endDigital: 0,
                    difference: 0,
                    organizationId: newOrg.id,
                    data: {} // Empty JSON
                }
            });

            return newOrg;
        });

        // 4. Success -> Redirect


    } catch (error) {
        console.error("Error creating organization:", error);
        return { error: 'Error al crear la organización. Intenta nuevamente.' };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}
