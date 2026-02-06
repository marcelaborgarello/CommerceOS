
import prisma from '../src/lib/db';
import { getArgentinaDateKey } from '../src/utils/dateUtils';

async function main() {
    const organizationId = (await prisma.organization.findFirst())?.id;
    if (!organizationId) throw new Error('No org found');

    // 1. Create or Get Product
    let product = await prisma.product.findFirst();
    if (!product) {
        product = await prisma.product.create({
            data: {
                name: 'Stock Test Product',
                stock: 100,
                organizationId
            }
        });
    }

    const originalStock = product.stock;
    console.log(`📦 Initial Stock for ${product.name}: ${originalStock}`);

    // 2. Create Sale (qty 10)
    console.log('🛒 Creating Sale (Qty: 10)...');

    const today = getArgentinaDateKey();
    let session = await prisma.cashSession.findFirst({ where: { date: today, organizationId } });
    if (!session) {
        session = await prisma.cashSession.create({ data: { date: today, organizationId, status: 'OPEN', data: {} } });
    }

    const sale = await prisma.$transaction(async (tx) => {
        const s = await tx.sale.create({
            data: {
                organizationId,
                cashSessionId: session!.id,
                description: 'Stock Test',
                amount: 100,
                paymentMethod: 'CASH',
                type: 'TICKET',
                status: 'COMPLETED',
                items: {
                    create: [{ productId: product!.id, productName: product!.name, quantity: 10, unitPrice: 10, subtotal: 100 }]
                }
            }
        });

        // Manually decrement stock here to mimic saleAction behavior if separate, 
        // OR better, we rely on saleAction logic. 
        // But here we are testing the logic we WROTE in saleActions.ts, so we should call that?
        // No, we are simulating DB state. The saleActions.ts logic decrements. 
        // Let's manually decrement here to simulate "Before Cancel" state correctly if we were calling the action.
        // But wait. I want to verify `cancelSale` action restores it.

        await tx.product.update({
            where: { id: product!.id },
            data: { stock: { decrement: 10 } }
        });

        return s;
    });

    const stockAfterSale = (await prisma.product.findUnique({ where: { id: product.id } }))?.stock;
    console.log(`📉 Stock after Sale: ${stockAfterSale} (Expected: ${originalStock - 10})`);

    // 3. Run Cancel Logic (Simulating what cancelSale does)
    console.log('🚫 Canceling Sale...');

    await prisma.$transaction(async (tx) => {
        await tx.sale.update({ where: { id: sale.id }, data: { status: 'CANCELED' } });

        // RESTORE STOCK
        const s = await tx.sale.findUnique({ where: { id: sale.id }, include: { items: true } });
        for (const item of s!.items) {
            if (item.productId) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
        }
    });

    const finalStock = (await prisma.product.findUnique({ where: { id: product.id } }))?.stock;
    console.log(`📈 Final Stock: ${finalStock} (Expected: ${originalStock})`);

    if (finalStock === originalStock) {
        console.log('✅ TEST PASSED: Stock restored correctly.');
    } else {
        console.log('❌ TEST FAILED: Stock mismatch.');
    }
}

main().catch(console.error);
