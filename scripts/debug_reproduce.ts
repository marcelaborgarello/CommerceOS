
import prisma from '../src/lib/db';
import { getArgentinaDateKey } from '../src/utils/dateUtils';

async function main() {
    const organizationId = (await prisma.organization.findFirst())?.id;
    if (!organizationId) throw new Error('No org found');

    const today = getArgentinaDateKey();

    // 1. Ensure Session
    let session = await prisma.cashSession.findFirst({
        where: { date: today, organizationId }
    });

    if (!session) {
        console.log('Creating dummy session...');
        session = await prisma.cashSession.create({
            data: {
                date: today,
                organizationId,
                startCash: 100,
                status: 'OPEN',
                data: {}
            }
        });
    }

    // 2. Create Sale
    console.log('Creating Sale...');
    const sale = await prisma.sale.create({
        data: {
            date: new Date(),
            type: 'TICKET',
            status: 'COMPLETED',
            pointOfSale: 1,
            number: 9999, // dummy
            description: 'Test Sale',
            amount: 100,
            paymentMethod: 'CASH',
            cashSessionId: session.id,
            organizationId,
            items: {
                create: [
                    { productName: 'Test Item', quantity: 1, unitPrice: 100, subtotal: 100 }
                ]
            }
        }
    });
    console.log(`Created Sale: ${sale.id} | Status: ${sale.status}`);

    // 3. Cancel Sale (Simulating cancelSale logic)
    console.log('Canceling Sale...');

    const updatedSale = await prisma.sale.update({
        where: { id: sale.id },
        data: { status: 'CANCELED' }
    });

    console.log(`Updated Sale: ${updatedSale.id} | Status: ${updatedSale.status}`);

    // 4. Verify Existence
    const check = await prisma.sale.findUnique({ where: { id: sale.id } });
    if (check) {
        console.log('✅ Sale still exists in DB.');
    } else {
        console.log('❌ Sale was DELETED!');
    }
}

main().catch(console.error);
