'use server';

// TODO: Fix TypeScript strict errors
// - Remove unused imports
// - Add null checks for split operations
// - Type all function parameters

import prisma from '@/lib/db';

export interface ProductData {
    id?: string;
    name: string;
    unit: string;
    wholesaleCost: number;
    wholesaleQuantity: number;
    margin: number;
    finalPrice: number;
    isOnSale?: boolean;
    // New fields
    stock?: number;
    minStock?: number;
    productType?: string;
}

import { createClient } from '@/utils/supabase/server';

import type { Product } from '@/types';

// Optimized Type for POS
export type POSProduct = Pick<Product, 'id' | 'name' | 'unit' | 'finalPrice' | 'stock'>;

export async function getProducts() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autorizado' };
        }

        const { getCurrentOrganization } = await import('@/utils/serverContext');
        const org = await getCurrentOrganization(user);

        if (!org) {
            return { success: false, error: 'Sin organización' };
        }

        const products = await prisma.product.findMany({
            where: { organizationId: org.id },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: products };
    } catch (error) {
        console.error('[DB] Error getting products:', error);
        return { success: false, error: 'Ocurrió un error al cargar los productos.' };
    }
}

export async function getPOSProducts(): Promise<{ success: boolean; data?: POSProduct[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autorizado' };
        }

        const { getCurrentOrganization } = await import('@/utils/serverContext');
        const org = await getCurrentOrganization(user);

        if (!org) {
            return { success: false, error: 'Sin organización' };
        }

        const products = await prisma.product.findMany({
            where: { organizationId: org.id },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                unit: true,
                finalPrice: true,
                stock: true
            }
        });
        return { success: true, data: products };
    } catch (error) {
        console.error('[DB] Error getting POS products:', error);
        return { success: false, error: 'Error al cargar productos para POS.' };
    }
}

export async function saveProduct(data: ProductData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No autorizado' };
        }

        const { getCurrentOrganization } = await import('@/utils/serverContext');
        const org = await getCurrentOrganization(user);

        if (!org) {
            return { success: false, error: 'Sin organización' };
        }

        const orgId = org.id;

        // Calcular valores derivados en el backend para consistencia
        const unitCost = data.wholesaleQuantity > 0 ? data.wholesaleCost / data.wholesaleQuantity : 0;
        const suggestedPrice = unitCost * (1 + data.margin / 100);

        if (data.id) {
            // Update
            // 1. Fetch current state to check for changes
            const currentProduct = await prisma.product.findUnique({
                where: { id: data.id }
            });

            let historyUpdate = {};

            if (currentProduct) {
                // Check if Price changed significantly
                if (Math.abs(currentProduct.finalPrice - data.finalPrice) > 0.01) {
                    historyUpdate = { ...historyUpdate, lastPrice: currentProduct.finalPrice };
                }
                // Check if Cost changed significantly
                if (Math.abs(currentProduct.wholesaleCost - data.wholesaleCost) > 0.01) {
                    historyUpdate = { ...historyUpdate, lastCost: currentProduct.wholesaleCost };
                }
            }


            await prisma.product.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    unit: data.unit,
                    wholesaleCost: data.wholesaleCost,
                    wholesaleQuantity: data.wholesaleQuantity,
                    margin: data.margin,
                    finalPrice: data.finalPrice,
                    isOnSale: data.isOnSale || false,
                    stock: data.stock !== undefined ? data.stock : undefined, // Update if present
                    minStock: data.minStock !== undefined ? data.minStock : undefined,
                    productType: data.productType,

                    unitCost,
                    suggestedPrice,
                    ...historyUpdate
                }
            });

            // Create History Record if changed
            if (Object.keys(historyUpdate).length > 0) {
                await prisma.historicalPrice.create({
                    data: {
                        productId: data.id,
                        cost: data.wholesaleCost,
                        price: data.finalPrice,
                        date: new Date()
                    }
                });
            }
        } else {
            // Create
            const newProduct = await prisma.product.create({
                data: {
                    organizationId: orgId, // CRITICAL: Associate with current Org
                    name: data.name,
                    unit: data.unit,
                    wholesaleCost: data.wholesaleCost,
                    wholesaleQuantity: data.wholesaleQuantity,
                    margin: data.margin,
                    finalPrice: data.finalPrice,
                    isOnSale: data.isOnSale || false,
                    stock: data.stock || 0,
                    minStock: data.minStock || 5,
                    productType: data.productType || 'SELL',
                    unitCost,
                    suggestedPrice
                }
            });

            // Initial History Record
            await prisma.historicalPrice.create({
                data: {
                    productId: newProduct.id,
                    cost: data.wholesaleCost,
                    price: data.finalPrice,
                    date: new Date()
                }
            });
        }
        return { success: true };
    } catch (error) {
        console.error('[DB] Error saving product:', error);
        return { success: false, error: 'No se pudo guardar el producto.' };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error('[DB] Error deleting product:', error);
        return { success: false, error: 'No se pudo eliminar el producto.' };
    }
}

export async function getProductHistory(id: string) {
    try {
        const history = await prisma.historicalPrice.findMany({
            where: { productId: id },
            orderBy: { date: 'desc' },
            take: 20 // Limit to last 20 records
        });
        return { success: true, data: history };
    } catch (error) {
        console.error('[DB] Error getting product history:', error);
        return { success: false, error: 'Error al cargar historial.' };
    }
}
