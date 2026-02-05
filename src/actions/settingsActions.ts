'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { validateFeatures, type Features } from '@/lib/schemas/featuresSchema';
import { redirect } from 'next/navigation';

/**
 * Update organization features
 * Validates input with Zod before saving
 */
export async function updateFeatures(features: unknown) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autenticado' };
        }

        const org = await getCurrentOrganization(user);
        if (!org) {
            return { success: false, error: 'Organización no encontrada' };
        }

        // Validate features with Zod
        const validatedFeatures = validateFeatures(features);

        // Get current settings
        const currentSettings = org.settings as any || {};

        // Update only features, preserve other settings
        const updatedSettings = {
            ...currentSettings,
            features: validatedFeatures,
        };

        // Save to database
        await prisma.organization.update({
            where: { id: org.id },
            data: {
                settings: updatedSettings,
            },
        });

        // Revalidate all pages to reflect changes
        revalidatePath('/', 'layout');

        return {
            success: true,
            message: 'Configuración actualizada correctamente'
        };

    } catch (error) {
        console.error('Error updating features:', error);

        if (error instanceof Error) {
            return {
                success: false,
                error: `Error de validación: ${error.message}`
            };
        }

        return {
            success: false,
            error: 'Error al actualizar la configuración'
        };
    }
}

/**
 * Get current organization features
 */
export async function getFeatures(): Promise<Features | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/login');
        }

        const org = await getCurrentOrganization(user);
        if (!org) {
            redirect('/setup');
        }

        const settings = org.settings as any || {};
        return settings.features || null;

    } catch (error) {
        console.error('Error getting features:', error);
        return null;
    }
}

/**
 * Update user password
 */
export async function updatePassword(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autenticado' };
        }

        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validation
        if (!newPassword || !confirmPassword) {
            return { success: false, error: 'Por favor completá todos los campos' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, error: 'Las contraseñas no coinciden' };
        }

        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            console.error('Password update error:', error);
            return { success: false, error: 'Error al actualizar la contraseña' };
        }

        return {
            success: true,
            message: '¡Contraseña actualizada correctamente!'
        };

    } catch (error) {
        console.error('Error updating password:', error);
        return {
            success: false,
            error: 'Error inesperado al actualizar la contraseña'
        };
    }
}

/**
 * Update business data (name, type, address, phone, logo)
 */
export async function updateBusinessData(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autenticado' };
        }

        const org = await getCurrentOrganization(user);
        if (!org) {
            return { success: false, error: 'Organización no encontrada' };
        }

        const name = formData.get('name') as string;
        const type = formData.get('type') as string;
        const address = formData.get('address') as string;
        const phone = formData.get('phone') as string;
        const logoFile = formData.get('logo') as File | null;

        // Validation
        if (!name || !type) {
            return { success: false, error: 'Nombre y rubro son obligatorios' };
        }

        let logoUrl = org.logoUrl;

        // Handle logo upload if provided
        if (logoFile && logoFile.size > 0) {
            // Generate unique filename
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, logoFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                console.error('Logo upload error:', uploadError);
                return { success: false, error: 'Error al subir el logo' };
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            logoUrl = publicUrl;
        }

        // Update organization in database
        await prisma.organization.update({
            where: { id: org.id },
            data: {
                name,
                type,
                address: address || null,
                phone: phone || null,
                logoUrl,
            },
        });

        // Revalidate to reflect changes
        revalidatePath('/', 'layout');

        return {
            success: true,
            message: '¡Datos del negocio actualizados correctamente!'
        };

    } catch (error) {
        console.error('Error updating business data:', error);
        return {
            success: false,
            error: 'Error inesperado al actualizar los datos'
        };
    }
}
