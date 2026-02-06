'use client';

import { useState, useEffect } from 'react';
import type { ProviderData } from '@/actions/providerActions';
import { saveProvider, deleteProvider, getProviderExpenses } from '@/actions/providerActions';
import { useRouter } from 'next/navigation';
import { Toast } from './Toast';
import type { ProviderExpense } from '@/types';

interface Props {
    initialProviders: ProviderData[];
}

export const ProvidersManager = ({ initialProviders }: Props) => {
    const router = useRouter();
    const [providers, setProviders] = useState(initialProviders);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Sync state with server updates
    useEffect(() => {
        setProviders(initialProviders);
    }, [initialProviders]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ProviderData | null>(null);

    // History Modal State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyProvider, setHistoryProvider] = useState<ProviderData | null>(null);
    const [historyExpenses, setHistoryExpenses] = useState<ProviderExpense[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Form State
    const [formData, setFormData] = useState<ProviderData>({ name: '', category: '', phone: '' });

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (provider?: ProviderData) => {
        if (provider) {
            setEditingProvider(provider);
            setFormData(provider);
        } else {
            setEditingProvider(null);
            setFormData({ name: '', category: '', phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setToast({ message: 'El nombre es obligatorio', type: 'error' });
            return;
        }

        const res = await saveProvider({
            ...formData,
            id: editingProvider?.id
        });

        if (res.success) {
            setIsModalOpen(false);
            setToast({ message: 'Proveedor guardado con éxito', type: 'success' });
            router.refresh();
        } else {
            setToast({ message: 'Error al guardar el proveedor', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás segura de eliminar este proveedor?')) {
            const res = await deleteProvider(id);
            if (res.success) {
                setToast({ message: 'Proveedor eliminado', type: 'success' });
                router.refresh();
            } else {
                setToast({ message: 'Error al eliminar', type: 'error' });
            }
        }
    };

    const handleViewHistory = async (provider: ProviderData) => {
        if (!provider.id) return;
        setHistoryProvider(provider);
        setIsHistoryOpen(true);
        setIsLoadingHistory(true);
        setHistoryExpenses([]);

        const res = await getProviderExpenses(provider.id);
        if (res.success) {
            setHistoryExpenses(res.data || []);
        } else {
            setToast({ message: 'Error cargando historial', type: 'error' });
        }
        setIsLoadingHistory(false);
    };

    return (
        <div className="flex-col gap-4 w-full">
            <div className="flex-row justify-end items-center mb-4">
                <button onClick={() => handleOpenModal()} className="btn text-sm">
                    + Nuevo Proveedor
                </button>
            </div>

            {/* Buscador */}
            <div className="glass-panel p-2 mb-4">
                <input
                    className="input-field"
                    placeholder="🔍 Buscar por nombre o rubro..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista */}
            <div className="flex-col gap-2">
                {filteredProviders.length === 0 ? (
                    <div className="text-secondary text-center italic py-8">No hay proveedores registrados.</div>
                ) : (
                    filteredProviders.map(p => (
                        <div key={p.id} className="glass-panel flex-row justify-between items-center p-3">
                            <div className="flex-col gap-1">
                                <span className="font-bold text-lg">{p.name}</span>
                                <div className="flex-row gap-3 text-sm text-secondary">
                                    {p.category && <span className="bg-white/10 px-2 py-0.5 rounded text-xs">🏷️ {p.category}</span>}
                                    {p.phone && <span>📞 {p.phone}</span>}
                                </div>
                            </div>
                            <div className="flex-row gap-2">
                                <button onClick={() => handleViewHistory(p)} className="btn-secondary text-sm" title="Ver Historial de Pagos">📜</button>
                                <button onClick={() => handleOpenModal(p)} className="btn-secondary text-sm">✏️</button>
                                <button onClick={() => handleDelete(p.id!)} className="btn-secondary text-sm text-red">🗑️</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Historial */}
            {isHistoryOpen && historyProvider && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setIsHistoryOpen(false)}>
                    <div className="glass-panel w-full max-w-2xl p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-row justify-between items-center mb-4">
                            <h3 className="section-title text-lg" style={{ margin: 0 }}>
                                📜 Historial: {historyProvider.name}
                            </h3>
                            <button onClick={() => setIsHistoryOpen(false)} className="text-secondary hover:text-white">✕</button>
                        </div>

                        <div className="flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {isLoadingHistory ? (
                                <div className="text-center py-8 text-secondary">Cargando movimientos...</div>
                            ) : historyExpenses.length === 0 ? (
                                <div className="text-center py-8 text-secondary italic">No se encontraron pagos registrados para este proveedor.</div>
                            ) : (
                                historyExpenses.map((expense, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 rounded-lg bg-white/5 border border-white/5 text-xs items-center">
                                        <div className="col-span-2 flex flex-col">
                                            <span className="text-secondary">{expense.date}</span>
                                            {expense.status === 'Open' && <span className="text-[10px] text-accent-color animate-pulse">● En Curso</span>}
                                        </div>
                                        <div className="col-span-5 font-bold text-white">{expense.description}</div>
                                        <div className="col-span-3 text-center">
                                            <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white/70 uppercase">
                                                {expense.category}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right font-mono text-red font-bold">
                                            -${expense.amount.toLocaleString('es-AR')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex-row justify-between items-center">
                            <span className="text-sm text-secondary">
                                Total Registrado:
                            </span>
                            <span className="text-xl font-bold text-red">
                                -${historyExpenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                    <div className="glass-panel w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="section-title text-lg mb-4">
                            {editingProvider ? '✏️ Editar Proveedor' : '🆕 Nuevo Proveedor'}
                        </h3>

                        <div className="flex-col gap-4">
                            <div className="flex-col gap-1">
                                <label className="text-xs uppercase text-secondary">Nombre *</label>
                                <input
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Distribuidora Norte"
                                    autoFocus
                                />
                            </div>

                            <div className="flex-col gap-1">
                                <label className="text-xs uppercase text-secondary">Rubro</label>
                                <input
                                    className="input-field"
                                    value={formData.category || ''}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Ej: Verdulería, Limpieza..."
                                />
                            </div>

                            <div className="flex-col gap-1">
                                <label className="text-xs uppercase text-secondary">Teléfono</label>
                                <input
                                    className="input-field"
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Ej: 351..."
                                />
                            </div>

                            <div className="flex-row gap-2 mt-4">
                                <button onClick={handleSave} className="btn flex-1">Guardar</button>
                                <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
