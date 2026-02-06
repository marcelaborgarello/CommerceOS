
import prisma from '../src/lib/db';

async function main() {
    console.log('🗑️  Deleting all SaleItems...');
    await prisma.saleItem.deleteMany({});

    console.log('🗑️  Deleting all Sales...');
    await prisma.sale.deleteMany({});

    console.log('🔄 Resetting Document Sequences for Sales...');
    await prisma.documentSequence.deleteMany({
        where: {
            type: {
                in: ['TICKET', 'PRESUPUESTO', 'FACTURA_A', 'FACTURA_B', 'FACTURA_C']
            }
        }
    });

    console.log('✅ Sales data wiped successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // await prisma.$disconnect(); 
    });
