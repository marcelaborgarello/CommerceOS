import { getSupplies } from '@/actions/supplyActions';
import type { Supply, Provider } from '@/types';
import { SupplyManagerWrapper } from './SupplyManagerWrapper';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InsumosPage() {

    // Fetch Supplies
    let supplies: Supply[] = [];
    try {
        const res = await getSupplies();
        if (res.success && res.data) {
            supplies = res.data;
        }
    } catch (error) {
        console.error("Error fetching supplies:", error);
    }

    // Fetch Providers
    let providers: Provider[] = [];
    try {
        const { getProviders } = await import('@/actions/providerActions');
        const res = await getProviders();
        if (res.success && res.data) {
            providers = res.data;
        }
    } catch (error) {
        console.error("Error fetching providers:", error);
    }

    // We pass a refresh action? 
    // Creating a server action wrapper or relying on router.refresh() in client?
    // SupplyManager calls onRefresh -> which usually does router.refresh().
    // But SupplyManager just takes supplies as prop.

    return (
        <div className="min-h-screen bg-slate-900 pb-12">
            {/* Header / Nav would go here, or Layout handles it */}
            <div className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="text-secondary hover:text-white transition-colors">← Volver</Link>
                    <h1 className="text-3xl font-bold text-white">Gestión de Insumos</h1>
                </div>

                <SupplyManagerWrapper
                    initialSupplies={supplies}
                    initialProviders={providers}
                />
            </div>
        </div>
    );
}
