import { z } from 'zod';

/**
 * Features Schema - Defines which modules are enabled for an organization
 * 
 * Note: 'cashRegister' (Caja) is always enabled and not included here
 * as it's the core functionality of the system
 */
export const featuresSchema = z.object({
    // Inventory Management
    stock: z.boolean().default(true),           // Products module
    supplies: z.boolean().default(false),       // Supplies/Materials module (Insumos)
    wastage: z.boolean().default(false),        // Wastage tracking (Mermas)

    // Financial Management
    reserves: z.boolean().default(true),        // Financial reserves/savings
    commitments: z.boolean().default(true),     // Payment commitments

    // Business Management
    providers: z.boolean().default(true),       // Providers/Suppliers
    reports: z.boolean().default(true),         // Reports and analytics
    history: z.boolean().default(true),         // Audit history
    sales: z.boolean().default(true),           // Sales history
});

/**
 * Settings Schema - Complete organization settings
 */
export const settingsSchema = z.object({
    features: featuresSchema,
    terminology: z.object({
        product: z.string().default('Producto'),
    }).default({ product: 'Producto' }),
});

// TypeScript types derived from Zod schemas
export type Features = z.infer<typeof featuresSchema>;
export type Settings = z.infer<typeof settingsSchema>;

/**
 * Default features by business type
 */
export const getDefaultFeaturesByType = (businessType: string): Features => {
    const baseFeatures: Features = {
        stock: true,
        supplies: false,
        wastage: false,
        reserves: true,
        commitments: true,
        providers: true,
        reports: true,
        history: true,
        sales: true,
    };

    switch (businessType) {
        case 'Verdulería':
        case 'Carnicería':
            return {
                ...baseFeatures,
                stock: true,
                wastage: true,      // Enable wastage tracking
                supplies: false,
            };

        case 'Almacén':
        case 'Kiosco':
            return {
                ...baseFeatures,
                stock: true,
                wastage: false,
                supplies: false,
            };

        case 'Imprenta':
        case 'Manufactura':
            return {
                ...baseFeatures,
                stock: true,
                supplies: true,     // Enable supplies for raw materials
                wastage: false,
            };

        case 'Servicios':
            return {
                ...baseFeatures,
                stock: false,       // Services don't need stock
                supplies: false,
                wastage: false,
            };

        default:
            // 'Otro' or unknown type - enable basic features
            return baseFeatures;
    }
};

/**
 * Validates and parses features object
 * Returns validated features or throws ZodError
 */
export const validateFeatures = (data: unknown): Features => {
    return featuresSchema.parse(data);
};

/**
 * Safely validates features with fallback to defaults
 */
export const safeValidateFeatures = (data: unknown): Features => {
    const result = featuresSchema.safeParse(data);
    if (result.success) {
        return result.data;
    }
    // Return defaults if validation fails
    return featuresSchema.parse({});
};
