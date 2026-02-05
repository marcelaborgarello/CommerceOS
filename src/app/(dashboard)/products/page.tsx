import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { ProductsClient } from './ProductsClient';
import { redirect } from 'next/navigation';
import type { Product, OrganizationSettings } from '@/types';

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const org = await getCurrentOrganization(user);
    const dbSettings = (org?.settings as OrganizationSettings | null) || {};

    // Helper to get defaults if missing
    const getTypeDefaults = (type: string) => {
        const defaults = {
            features: {
                pos: true,
                stock: true,
                mermas: false,
                reservas: false,
                supplies: false,
                manufacturing: false,
            },
            terminology: {
                product: 'Productos'
            }
        };

        if (type === 'Imprenta' || type === 'Manufactura') {
            defaults.features.supplies = true;
            defaults.features.manufacturing = true;
            defaults.terminology.product = 'Productos'; // Fixed: Was 'Insumo/Producto'
        } else if (type === 'Verdulería' || type === 'Carnicería') {
            defaults.features.mermas = true;
            defaults.features.reservas = true;
        } else if (type === 'Servicios') {
            defaults.features.stock = false;
            defaults.features.pos = false;
            defaults.terminology.product = 'Servicio';
        }
        return defaults;
    };

    const typeDefaults = getTypeDefaults(org?.type || 'Otros');

    // Merge DB settings with defaults (DB wins if exists, but we override specific bad values if needed)
    const settings = {
        features: { ...typeDefaults.features, ...dbSettings.features },
        terminology: { ...typeDefaults.terminology, ...dbSettings.terminology }
    };

    // Normalize terminology: "Insumo/Producto" is split into separate concepts in UI
    if (settings.terminology.product === 'Insumo/Producto') {
        settings.terminology.product = 'Productos';
    }

    // --- Server Side Data Fetching & Filtering ---
    let initialProducts: Product[] = [];
    let initialSupplies: Product[] = [];

    try {
        const { getProducts } = await import('@/actions/productActions');
        const res = await getProducts();
        if (res.success && res.data) {
            const allItems = res.data;
            // Filter logic moved from Client to Server
            initialProducts = allItems.filter(p => !p.productType || p.productType === 'SELL' || p.productType === 'BOTH');
            initialSupplies = allItems.filter(p => p.productType === 'SUPPLY');
        }
    } catch (e) {
        console.error("Error fetching products server side:", e);
    }
    // ---------------------------------------------

    return (
        <ProductsClient
            organization={org ? {
                name: org.name,
                type: org.type,
                logoUrl: org.logoUrl || undefined
            } : undefined}
            userEmail={user.email}
            features={settings.features}
            terminology={settings.terminology}
            initialProducts={initialProducts}
        />
    );
}
