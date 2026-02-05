import { ProvidersManager } from '@/components/ProvidersManager';
import { getProviders } from '@/actions/providerActions';
import { getRequiredAuth } from '@/utils/serverContext';
import { redirect } from 'next/navigation';

export default async function ProvidersPage() {
    const { org } = await getRequiredAuth();

    const { data: providers } = await getProviders();

    return (
        <main className="w-full px-2 md:px-6 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold text-white mb-1">Proveedores</h1>
                    <p className="text-secondary text-sm">Gestión de agenda y gastos</p>
                </div>
                <ProvidersManager initialProviders={providers || []} />
            </div>
        </main>
    );
}
