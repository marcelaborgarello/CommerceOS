'use server';

import prisma from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

function getDefaultSettings(type: string) {
    const baseSettings = {
        features: {
            pos: true,
            stock: false,
            mermas: false, // Waste tracking
            reservas: false, // Crate/Deposit tracking
            supplies: false, // "Insumos" (Raw materials)
            manufacturing: false, // Production tracking
        },
        terminology: {
            product: 'Producto'
        }
    };

    switch (type) {
        case 'Verdulería':
        case 'Carnicería':
            baseSettings.features.stock = true;
            baseSettings.features.mermas = true;
            baseSettings.features.reservas = true;
            baseSettings.terminology.product = 'Producto';
            break;
        case 'Almacén':
            baseSettings.features.stock = true;
            baseSettings.terminology.product = 'Producto';
            break;
        case 'Imprenta':
        case 'Manufactura':
            baseSettings.features.stock = true; // Track stock of supplies/products
            baseSettings.features.supplies = true; // Enable input management
            baseSettings.features.manufacturing = true; // Enable production flow?
            baseSettings.terminology.product = 'Insumo/Producto';
            break;
        case 'Servicios':
            baseSettings.features.stock = false;
            baseSettings.features.pos = false; // Maybe simple billing instead?
            baseSettings.terminology.product = 'Servicio';
            break;
        default:
            // "Otro" fallback
            baseSettings.features.stock = true;
            break;
    }
    return baseSettings;
}

export async function updateOrganization(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autorizado' };
    }

    const organizationId = formData.get('organizationId') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const logoUrl = formData.get('logoUrl') as string;

    if (!organizationId || !name || !type) {
        return { success: false, error: 'Faltan datos requeridos (nombre o rubro)' };
    }

    // Verify Ownership
    const userOrg = await prisma.userOrganization.findFirst({
        where: { userId: user.id, organizationId },
        include: { organization: true }
    });

    if (!userOrg) {
        return { success: false, error: 'No tienes permiso para editar esta organización' };
    }

    const currentOrg = userOrg.organization;
    const typeChanged = currentOrg.type !== type;

    // If type changed, reset settings to defaults for that type. 
    // Otherwise keep existing settings (undefined in update = no change).
    const newSettings = typeChanged ? getDefaultSettings(type) : undefined;

    try {
        await prisma.organization.update({
            where: { id: organizationId },
            data: {
                name,
                type,
                address: formData.get('address') as string || null,
                phone: formData.get('phone') as string || null,
                logoUrl: logoUrl || null,
                ...(newSettings ? { settings: newSettings } : {})
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating org:', error);
        return { success: false, error: 'Error al actualizar organización' };
    }
}

export async function deleteOrganization(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autorizado' };
    }

    const organizationId = formData.get('organizationId') as string;

    if (!organizationId) {
        return { success: false, error: 'ID de organización requerido' };
    }

    // Verify Ownership (Must be OWNER)
    const userOrg = await prisma.userOrganization.findFirst({
        where: { userId: user.id, organizationId, role: 'OWNER' },
    });

    if (!userOrg) {
        return { success: false, error: 'Solo el dueño puede eliminar el negocio' };
    }

    try {
        // Cascade delete handles everything because of our schema update
        await prisma.organization.delete({
            where: { id: organizationId },
        });

        // If successful, we might need to clear the cookie if it was the selected one, 
        // but the client will handle redirect usually.
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting org:', error);
        return { success: false, error: 'Error al eliminar la organización. Intenta nuevamente.' };
    }
}

export async function uploadLogo(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autorizado' };
    }

    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No se recibió ningún archivo' };
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { data, error } = await supabase.storage
            .from('logos')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error('[Storage] Error al subir logo:', error);
            return { success: false, error: error.message || 'Error al subir imagen. Revisa permisos.' };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName);

        if (!publicUrl) {
            return { success: false, error: 'No se pudo generar la URL pública' };
        }

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('[Storage] Error:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido al subir';
        return { success: false, error: message };
    }
}
