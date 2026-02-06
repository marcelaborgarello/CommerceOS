
import prisma from '../src/lib/db';

async function main() {
    const sales = await prisma.sale.findMany({
        include: { items: true }
    });

    if (sales.length === 0) {
        console.log('NO_SALES_FOUND');
    } else {
        console.log('--- FOUND SALES ---');
        sales.forEach(s => {
            console.log(`SALE|${s.id}|${s.type}|${s.pointOfSale}-${s.number}|${s.status}|${s.amount}`);
        });
        console.log('--- END SALES ---');
    }
}

main()
    .catch(e => console.error(e));
