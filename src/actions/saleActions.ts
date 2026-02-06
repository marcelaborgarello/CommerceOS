'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getArgentinaDateKey } from '@/utils/dateUtils';
import type { PaymentMethod, SaleType } from '@/types';

interface CreateSaleItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    name: string; // snapshot name
}

interface CreateSaleData {
    items: CreateSaleItem[];
    paymentMethod: PaymentMethod;
    discount?: number;
    surcharge?: number;
    total: number;
    customerName?: string;
    customerAddress?: string;
    customerPhone?: string;

    // New Fields
    type?: SaleType; // Default TICKET
    pointOfSale?: number; // Default 1
}

export async function createSale(data: CreateSaleData, organizationId?: string) {
    if (!organizationId) {
        return { success: false, error: 'Organización no identificada' };
    }

    const today = getArgentinaDateKey();
    const SALE_TYPE = data.type || 'TICKET';
    const POINT_OF_SALE = data.pointOfSale || 1;

    try {
        // Transaction: Ensure sequence integrity + Create Sale
        const result = await prisma.$transaction(async (tx) => {

            // 1. Get or Create Session (CashSession)
            // We do this inside the transaction or before? 
            // Ideally before to keep tx short, but we need consistency.
            // Let's do it inside.
            // 1. Get or Create Session (CashSession)
            // We do this inside the transaction or before? 
            // Ideally before to keep tx short, but we need consistency.
            // Let's do it inside.
            let session = await tx.cashSession.findFirst({
                where: { date: today, organizationId }
            });

            if (!session) {
                // Try to find ANY session to link to? No, better to force initialization.
                // But user might just want to quote.
                // Let's strict: Arqueo must exist.
                throw new Error('No hay una sesión de caja iniciada para el día de hoy.');
            }

            // STRICT SESSION LOGIC FOR "SALES" (Money moving)
            if (SALE_TYPE !== 'PRESUPUESTO') {
                if (session.status === 'CLOSED' || session.closeDate) {
                    throw new Error('La caja del día está Cerrada. No se pueden realizar ventas.');
                }
            }

            // 2. Get Next Number (DocumentSequence)
            // We use upsert to create if not exists
            const sequence = await tx.documentSequence.upsert({
                where: {
                    organizationId_type_pointOfSale: {
                        organizationId,
                        type: SALE_TYPE,
                        pointOfSale: POINT_OF_SALE
                    }
                },
                update: {
                    currentNumber: { increment: 1 }
                },
                create: {
                    organizationId,
                    type: SALE_TYPE,
                    pointOfSale: POINT_OF_SALE,
                    currentNumber: 1
                }
            });

            const nextNumber = sequence.currentNumber;

            // 3. Create Sale
            const newSale = await tx.sale.create({
                data: {
                    type: SALE_TYPE,
                    pointOfSale: POINT_OF_SALE,
                    number: nextNumber,

                    amount: data.total,
                    paymentMethod: data.paymentMethod,
                    description: `${SALE_TYPE} POS - ${data.items.length} items${data.customerName ? ` - ${data.customerName}` : ''}`,

                    // Link to session (Required by Schema)
                    cashSessionId: session.id,
                    organizationId,


                    isCredit: false,

                    customerName: data.customerName,
                    customerPhone: data.customerPhone,

                    // Sales Items
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            productName: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            subtotal: item.subtotal
                        }))
                    },


                    // Future ARCA placeholders (null for now)
                    cae: null,
                    caeVto: null,
                    afipQrData: null,

                    status: 'COMPLETED'
                }
            });

            // 4. Update Product Stock (ONLY IF NOT PRESUPUESTO)
            if (SALE_TYPE !== 'PRESUPUESTO') {
                for (const item of data.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }

            return newSale;
        });

        // Revalidate Paths
        revalidatePath('/pos');
        revalidatePath('/cash-audit');
        revalidatePath('/sales');

        return { success: true, sale: result, number: result.number, fullNumber: `${POINT_OF_SALE.toString().padStart(4, '0')}-${result.number.toString().padStart(8, '0')}` };

    } catch (error: any) {
        console.error('Error creating sale:', error);
        return { success: false, error: error.message || 'Error al procesar la venta' };
    }
}

export async function cancelSale(saleId: string, organizationId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get Sale
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true }
            });

            if (!sale) throw new Error('Venta no encontrada');
            if (sale.organizationId !== organizationId) throw new Error('No autorizado');
            if (sale.status === 'CANCELED') throw new Error('La venta ya está anulada');
            if (sale.type === 'PRESUPUESTO') throw new Error('Los presupuestos no necesitan anulación (no afectan stock/caja).');

            // 2. Update Status
            await tx.sale.update({
                where: { id: saleId },
                data: { status: 'CANCELED' }
            });

            // 3. Restore Stock
            for (const item of sale.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }

            // 4. Adjust Cash Session (Optional / Future Phase)
            // For now, CashAudit handles sums by filtering !CANCELED
            // If the session is OPEN, maybe we should register a negative movement? 
            // Complexity: The sale might belong to a CLOSED session.
            // Decision: Simple "Anulada" status is enough for auditing. 
            // The Cash Audit calculation MUST filter out CANCELED sales.
        });

        revalidatePath('/sales');
        revalidatePath('/pos'); // Stock updates
        revalidatePath('/products'); // Stock updates

        return { success: true };
    } catch (error: any) {
        console.error('Error canceling sale:', error);
        return { success: false, error: error.message || 'Error al anular la venta' };
    }
}

export async function getSales(
    organizationId: string,
    params: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        type?: SaleType | 'ALL';
        search?: string;
    }
) {
    try {
        const {
            page = 1,
            limit = 20,
            startDate,
            endDate,
            type = 'ALL',
            search
        } = params;


        const skip = (page - 1) * limit;

        const where: any = {
            organizationId
        };


        // Filter by Date Range
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) {
                // Adjust end date to include the full day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
            }
        }

        // Filter by Type
        if (type !== 'ALL') {
            where.type = type;
        }

        // Search Filter (ID, Client Name, Phone)
        if (search) {
            const isNumber = !isNaN(Number(search));

            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search, mode: 'insensitive' } }
            ];

            // If it's a number, try searching by sequence number
            if (isNumber) {
                where.OR.push({ number: parseInt(search) });
            }
        }

        // Execute Query
        const [sales, total] = await Promise.all([
            prisma.sale.findMany({
                where,
                orderBy: { date: 'desc' },
                skip,
                take: limit,
                include: {
                    items: true
                }
            }),
            prisma.sale.count({ where })
        ]);

        return {
            success: true,
            data: sales,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        console.error('Error fetching sales:', error);
        return { success: false, error: 'Error al cargar el historial de ventas' };
    }
}
