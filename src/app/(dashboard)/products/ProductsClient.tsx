'use client';

import { useState } from 'react';
import { ProductManager } from '@/components/ProductManager';
import { PriceListPrint } from '@/components/PriceListPrint';
import { MermaDashboard } from '@/components/MermaDashboard';
import { getProducts } from '@/actions/productActions';
import type { Product } from '@/types';

interface Props {
    organization?: {
        name: string;
        type: string;
        logoUrl?: string;
    };
    userEmail?: string;
    features?: {
        mermas: boolean;
        stock: boolean;
        supplies: boolean;
    };
    terminology?: {
        product: string;
    };
    initialProducts: Product[];

}

export function ProductsClient({ features = { mermas: true, stock: true, supplies: false }, terminology = { product: 'Producto' }, initialProducts }: Props) {
    // We keep state for "optimistic updates" (instantly showing changes), but init it with Server Data
    const [productsList, setProductsList] = useState<Product[]>(initialProducts);


    const [activeTab, setActiveTab] = useState<'products' | 'mermas' | 'supplies'>('products');

    // Helper to refresh data (now we re-fetch everything and split again to stay filtered)
    const handleRefresh = async () => {
        const res = await getProducts();
        if (res.success && res.data) {
            setProductsList(res.data);
        }
    };
    return (
        <div className="min-h-screen pb-12">
            <div className="w-full px-2 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="no-print">
                        <div className="mb-8 border-b border-white/10 pb-4">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {activeTab === 'supplies' ? "Gestión de Insumos" : "Gestión de Precios"}
                            </h1>
                            <p className="text-secondary text-sm">
                                {activeTab === 'supplies' ? "Control de Stock y Costos" : `${terminology.product}s, Costos y Márgenes`}
                            </p>
                        </div>
                    </div>

                    <div className="no-print mb-6">
                        <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'products'
                                    ? 'bg-accent-color text-brand-dark'
                                    : 'text-secondary hover:bg-white/5'
                                    }`}
                            >
                                {terminology.product}s
                            </button>



                            {features.mermas && (
                                <button
                                    onClick={() => setActiveTab('mermas')}
                                    className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'mermas'
                                        ? 'bg-red text-white'
                                        : 'text-secondary hover:bg-white/5'
                                        }`}
                                >
                                    🗑️ Mermas
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="no-print">
                        {activeTab === 'products' && (
                            <ProductManager
                                key="products"
                                products={productsList}
                                isLoading={false} // Data is already ready
                                onRefresh={handleRefresh}
                                defaultType="SELL"
                            />
                        )}



                        {activeTab === 'mermas' && (
                            <MermaDashboard />
                        )}
                    </div>

                    {activeTab === 'products' && <PriceListPrint products={productsList} />}
                </div>
            </div>
        </div>
    );
}
