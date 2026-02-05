import { createClient } from './supabase/server';
import { getCurrentOrganization } from './serverContext';

export async function withAuth(action: (orgId: string, user: any) => Promise<any>) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autorizado' };
        }

        const org = await getCurrentOrganization(user);

        if (!org) {
            return { success: false, error: 'Sin organización' };
        }

        // Si todo está bien, ejecuta la función que le pasemos
        return await action(org.id, user);

    } catch (error) {
        console.error('[AUTH WRAPPER] Error:', error);
        return { success: false, error: 'Error de autenticación o servidor.' };
    }
}