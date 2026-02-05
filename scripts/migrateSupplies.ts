
import prisma from '../src/lib/db';


async function main() {
    console.log('Starting migration: Products -> Supplies');

    // 1. Fetch all products marked as SUPPLY or BOTH
    // 1. Fetch all products marked as SUPPLY or BOTH
    const supplyProducts = await prisma.product.findMany({
        where: {
            productType: {
                in: ['SUPPLY', 'BOTH'],
            },
        },
        include: {
            organization: true,
        }
    });

    console.log(`Found ${supplyProducts.length} items to migrate.`);

    let migratedCount = 0;
    let errors = 0;

    for (const product of supplyProducts) {
        try {
            // 2. Transact: Create Supply + Delete Product
            // We use a transaction to ensure atomicity per item
            await prisma.$transaction(async (tx) => {
                // Create Supply
                await tx.supply.create({
                    data: {
                        // ID: we could keep the same ID if UUID, but safer to generate new one to avoid PK collisions if tables were same
                        // Actually, separate tables -> collisions unlikely unless sharing ID space.
                        // Let's generate new ID (default)
                        name: product.name,
                        stock: product.stock,
                        minStock: product.minStock,
                        unit: product.unit,
                        unitCost: product.unitCost,
                        lastCost: product.lastCost,
                        organizationId: product.organizationId,

                        // Map timestamps
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });

                // Delete original Product
                await tx.product.delete({
                    where: { id: product.id },
                });
            });
            migratedCount++;
        } catch (error) {
            console.error(`Failed to migrate ${product.name} (${product.id}):`, error);
            errors++;
        }
    }

    console.log(`Migration finished.`);
    console.log(`Success: ${migratedCount}`);
    console.log(`Errors: ${errors}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
