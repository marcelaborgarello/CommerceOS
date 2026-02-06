import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { SettingsClient } from './SettingsClient';
import type { Features } from '@/lib/schemas/featuresSchema';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const org = await getCurrentOrganization(user);
    if (!org) redirect('/setup');

    // Get current features from settings
    const settings = (org.settings as any) || {};
    const currentFeatures: Features = settings.features || {
        stock: true,
        supplies: false,
        wastage: false,
        reserves: true,
        commitments: true,
        providers: true,
        reports: true,
        history: true,
    };

    // Organization data for business tab
    const organizationData = {
        name: org.name,
        type: org.type,
        logoUrl: org.logoUrl,
        address: org.address,
        phone: org.phone,
        themePrimary: org.themePrimary || '#557A2A',
        themeSecondary: org.themeSecondary || '#F0EDD8',
        themeAccent: org.themeAccent || '#FFDEB8',
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="w-full px-2 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 border-b border-white/10 pb-4">
                        <h1 className="text-3xl font-bold text-white mb-1">Configuración</h1>
                        <p className="text-secondary text-sm">
                            Personaliza tu cuenta, negocio y preferencias
                        </p>
                    </div>

                    <SettingsClient
                        initialFeatures={currentFeatures}
                        organizationData={organizationData}
                        userEmail={user.email || ''}
                        organizationId={org.id}
                    />
                </div>
            </div>
        </div>
    );
}
