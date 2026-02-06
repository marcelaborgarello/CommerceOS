/**
 * Migration Script: Update Organization Features to New Schema
 * 
 * This script updates existing organizations from the old features schema
 * to the new one with proper defaults.
 * 
 * Run with: bun run src/scripts/migrateFeatures.ts
 */

import prisma from '@/lib/db';
import { getDefaultFeaturesByType } from '@/lib/schemas/featuresSchema';

async function migrateOrganizationFeatures() {
    console.log('🔄 Starting features migration...\n');

    try {
        // Get all organizations
        const organizations = await prisma.organization.findMany();

        console.log(`Found ${organizations.length} organization(s) to migrate\n`);

        for (const org of organizations) {
            const settings = org.settings as any || {};
            const oldFeatures = settings.features || {};

            console.log(`📦 Migrating: ${org.name} (${org.type})`);
            console.log(`   Old features:`, oldFeatures);

            // Get defaults for this organization type
            const defaultFeatures = getDefaultFeaturesByType(org.type);

            // Merge old features with new schema
            // Map old feature names to new ones
            const newFeatures = {
                stock: oldFeatures.stock ?? defaultFeatures.stock,
                supplies: oldFeatures.supplies ?? defaultFeatures.supplies,
                wastage: oldFeatures.mermas ?? oldFeatures.wastage ?? defaultFeatures.wastage,
                reserves: oldFeatures.reservas ?? oldFeatures.reserves ?? defaultFeatures.reserves,
                commitments: defaultFeatures.commitments, // New feature
                providers: defaultFeatures.providers,     // New feature
                reports: defaultFeatures.reports,         // New feature
                history: defaultFeatures.history,         // New feature
            };

            console.log(`   New features:`, newFeatures);

            // Update organization
            await prisma.organization.update({
                where: { id: org.id },
                data: {
                    settings: {
                        ...settings,
                        features: newFeatures,
                    },
                },
            });

            console.log(`   ✅ Migrated successfully\n`);
        }

        console.log('✨ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateOrganizationFeatures()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
