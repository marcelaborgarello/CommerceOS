
import prisma from '../src/lib/db';

async function main() {
    console.log('🔍 Checking Sales table...');
    const sales = await prisma.sale.findMany({
        include: { items: true }
    });

    console.log(`📊 Total Sales found: ${sales.length}`);

    if (sales.length === 0) {
        console.log('⚠️ No sales found in the database.');
    } else {
        sales.forEach(s => {
            console.log(`- Sale #${s.pointOfSale}-${s.number} | Type: ${s.type} | Status: ${s.status} | Amount: ${s.amount}`);
        });
    }

    console.log('\n🔍 Checking DocumentSequences...');
    const seqs = await prisma.documentSequence.findMany({});
    seqs.forEach(s => {
        console.log(`- Sequence ${s.type} (POS ${s.pointOfSale}): Current ${s.currentNumber}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        // await prisma.$disconnect();
    });
