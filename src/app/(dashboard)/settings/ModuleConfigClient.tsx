'use client';

import { useState, useTransition } from 'react';
import { updateFeatures } from '@/actions/settingsActions';
import type { Features } from '@/lib/schemas/featuresSchema';
import { Toast } from '@/components/Toast';

interface ModuleConfig {
    key: keyof Features;
    label: string;
    description: string;
    icon: string;
    category: 'inventory' | 'financial' | 'management';
}

const moduleConfigs: ModuleConfig[] = [
    // Inventory Management
    {
        key: 'stock',
        label: 'Productos',
        description: 'Gestión de productos, precios y stock',
        icon: '📦',
        category: 'inventory',
    },
    {
        key: 'supplies',
        label: 'Insumos',
        description: 'Control de materiales y suministros',
        icon: '🧰',
        category: 'inventory',
    },
    {
        key: 'wastage',
        label: 'Mermas',
        description: 'Registro y control de desperdicios',
        icon: '🗑️',
        category: 'inventory',
    },

    // Financial Management
    {
        key: 'reserves',
        label: 'Reservas',
        description: 'Gestión de ahorros y reservas financieras',
        icon: '💰',
        category: 'financial',
    },
    {
        key: 'commitments',
        label: 'Compromisos',
        description: 'Control de pagos y compromisos pendientes',
        icon: '📅',
        category: 'financial',
    },

    // Business Management
    {
        key: 'providers',
        label: 'Proveedores',
        description: 'Gestión de proveedores y gastos',
        icon: '🚚',
        category: 'management',
    },
    {
        key: 'reports',
        label: 'Reportes',
        description: 'Análisis de costos y rentabilidad',
        icon: '📊',
        category: 'management',
    },
    {
        key: 'history',
        label: 'Historial de Cierres',
        description: 'Auditoría de arqueos y balances',
        icon: '📜',
        category: 'management',
    },
    {
        key: 'sales',
        label: 'Historial de Ventas',
        description: 'Buscador y registro de comprobantes',
        icon: '🔎',
        category: 'management',
    },
];

const categoryLabels = {
    inventory: 'Gestión de Inventario',
    financial: 'Gestión Financiera',
    management: 'Gestión del Negocio',
};

interface Props {
    initialFeatures: Features;
}

export function ModuleConfigClient({ initialFeatures }: Props) {
    const [features, setFeatures] = useState<Features>(initialFeatures);
    const [isPending, startTransition] = useTransition();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const handleToggle = (key: keyof Features) => {
        const newFeatures = {
            ...features,
            [key]: !features[key],
        };

        setFeatures(newFeatures);

        // Save to server
        startTransition(async () => {
            const result = await updateFeatures(newFeatures);

            if (result.success) {
                setToast({
                    message: result.message || 'Configuración actualizada',
                    type: 'success',
                });
            } else {
                setToast({
                    message: result.error || 'Error al actualizar',
                    type: 'error',
                });
                // Revert on error
                setFeatures(features);
            }
        });
    };

    // Group modules by category
    const groupedModules = moduleConfigs.reduce((acc, module) => {
        if (!acc[module.category]) {
            acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
    }, {} as Record<string, ModuleConfig[]>);

    return (
        <div className="space-y-8">
            {/* Info Alert */}
            <div className="glass-panel border-l-4 border-blue-500 p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                        <h3 className="font-bold text-white mb-1">Información importante</h3>
                        <p className="text-secondary text-sm">
                            Al desactivar un módulo, solo se oculta de tu dashboard. <strong>Tus datos no se borran</strong> y puedes reactivarlo cuando quieras.
                        </p>
                        <p className="text-secondary text-sm mt-2">
                            El módulo de <strong>Caja</strong> siempre está activo ya que es el núcleo del sistema.
                        </p>
                    </div>
                </div>
            </div>

            {/* Module Categories */}
            {Object.entries(groupedModules).map(([category, modules]) => (
                <div key={category} className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modules.map((module) => (
                            <div
                                key={module.key}
                                className={`glass-panel p-4 transition-all ${features[module.key]
                                    ? 'border-l-4 border-accent-color'
                                    : 'opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="text-3xl">{module.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white mb-1">{module.label}</h3>
                                            <p className="text-secondary text-sm">{module.description}</p>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => handleToggle(module.key)}
                                        disabled={isPending}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-brand-dark ${features[module.key]
                                            ? 'bg-accent-color'
                                            : 'bg-white/20'
                                            } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${features[module.key] ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
