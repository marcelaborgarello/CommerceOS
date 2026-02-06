'use client';

import { useState } from 'react';
import type { Features } from '@/lib/schemas/featuresSchema';
import { ModuleConfigClient } from './ModuleConfigClient';
import { AccountSettings } from './AccountSettings';
import { BusinessDataForm } from './BusinessDataForm';

interface Tab {
    id: string;
    label: string;
    icon: string;
}

const tabs: Tab[] = [
    { id: 'account', label: 'Cuenta', icon: '👤' },
    { id: 'widgets', label: 'Widgets/Módulos', icon: '🧩' },
    { id: 'business', label: 'Datos del Negocio', icon: '📋' },
    { id: 'appearance', label: 'Apariencia', icon: '🎨' },
    { id: 'tickets', label: 'Tickets', icon: '🧾' },
];

import { DocumentSettings } from './components/DocumentSettings';

interface Props {
    initialFeatures: Features;
    organizationData: {
        name: string;
        type: string;
        logoUrl?: string | null;
        address?: string | null;
        phone?: string | null;
        themePrimary: string;
        themeSecondary: string;
        themeAccent: string;
    };
    userEmail: string;
    organizationId: string;
}

export function SettingsClient({ initialFeatures, organizationData, userEmail, organizationId }: Props) {
    const [activeTab, setActiveTab] = useState('account');

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="border-b border-white/10">
                <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'text-accent-color border-b-2 border-accent-color'
                                : 'text-secondary hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {activeTab === 'account' && (
                    <AccountSettings userEmail={userEmail} />
                )}

                {activeTab === 'widgets' && (
                    <ModuleConfigClient initialFeatures={initialFeatures} />
                )}

                {activeTab === 'business' && (
                    <BusinessDataForm organizationData={organizationData} />
                )}

                {activeTab === 'appearance' && (
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Apariencia</h2>
                        <p className="text-secondary mb-6">Colores del tema de tu negocio</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Color Primario</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg border-2 border-white/20"
                                            style={{ backgroundColor: organizationData.themePrimary }}
                                        />
                                        <code className="text-sm text-white">{organizationData.themePrimary}</code>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Color Secundario</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg border-2 border-white/20"
                                            style={{ backgroundColor: organizationData.themeSecondary }}
                                        />
                                        <code className="text-sm text-white">{organizationData.themeSecondary}</code>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Color Acento</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg border-2 border-white/20"
                                            style={{ backgroundColor: organizationData.themeAccent }}
                                        />
                                        <code className="text-sm text-white">{organizationData.themeAccent}</code>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                                <p className="text-sm text-blue-200">
                                    💡 <strong>Próximamente:</strong> Podrás personalizar estos colores con un selector visual
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="space-y-6">
                        <DocumentSettings organizationId={organizationId} />

                        <div className="glass-panel p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Configuración de Impresión</h2>
                            <p className="text-secondary text-sm">Próximamente opciones de impresora térmica.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
