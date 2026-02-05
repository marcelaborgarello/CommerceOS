import { CommitmentsClient } from './CommitmentsClient';
import { getRequiredAuth } from '@/utils/serverContext';
import { getCompromisos } from '@/actions/compromisosActions';
import { getProviders } from '@/actions/providerActions';

export const dynamic = 'force-dynamic';

export default async function CompromisosPage() {
    const { user, org } = await getRequiredAuth();

    // Load initial data on server
    const [compromisosRes, providersRes] = await Promise.all([
        getCompromisos('pending'),
        getProviders()
    ]);

    return (
        <CommitmentsClient
            organization={{
                name: org.name,
                type: org.type,
                logoUrl: org.logoUrl,
                userEmail: user.email
            }}
            initialCompromisos={compromisosRes.success ? compromisosRes.data || [] : []}
            initialProviders={providersRes.success ? providersRes.data || [] : []}
        />
    );
}
