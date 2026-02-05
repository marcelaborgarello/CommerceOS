import { useState } from 'react';
import { saveSupply, deleteSupply, type SupplyData } from '@/actions/supplyActions';
import { Toast } from './Toast';
import { useRouter } from 'next/navigation';
import type { Supply, Provider } from '@/types';

interface SupplyManagerProps {
    supplies: Supply[];
    providers: Provider[];
    isLoading: boolean;
    onRefresh: () => void;
}

export const SupplyManager = ({ supplies, providers, isLoading, onRefresh }: SupplyManagerProps) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [supplyToDelete, setSupplyToDelete] = useState<Supply | null>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        unit: 'u',
        unitCost: '',
        stock: '',
        minStock: '5',
        providerId: ''
    });

    const handleOpenModal = (supply?: Supply) => {
        if (supply) {
            setEditingId(supply.id);
            setFormData({
                name: supply.name,
                unit: supply.unit,
                unitCost: supply.unitCost,
                stock: supply.stock,
                minStock: supply.minStock,
                providerId: supply.providerId || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                unit: 'u',
                unitCost: '',
                stock: '',
                minStock: '5',
                providerId: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setToast({ message: 'El nombre es obligatorio', type: 'error' });
            return;
        }
        const res = await saveSupply({
            ...formData,
            unitCost: parseFloat(formData.unitCost) || 0,
            stock: parseFloat(formData.stock) || 0,
            minStock: parseFloat(formData.minStock) || 0,
            id: editingId || undefined
        });
        if (res.success) {
            setToast({ message: 'Insumo guardado', type: 'success' });
            setIsModalOpen(false);
            onRefresh();
        } else {
            setToast({ message: 'Error al guardar', type: 'error' });
        }
    };

    const handleDeleteClick = (supply: Supply) => {
        setSupplyToDelete(supply);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!supplyToDelete) return;
        const res = await deleteSupply(supplyToDelete.id);
        if (res.success) {
            setToast({ message: 'Insumo eliminado', type: 'success' });
            setIsDeleteModalOpen(false);
            setSupplyToDelete(null);
            onRefresh();
        } else {
            setToast({ message: 'Error al eliminar', type: 'error' });
        }
    };

    const filteredSupplies = supplies
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    return (
        <div className="flex-col gap-6 w-full">
            {/* Header Actions */}
            <div className="flex-col md:flex-row justify-between items-center gap-4">
                <div className="glass-panel p-2 flex-1 w-full max-w-md">
                    <input
                        className="input-field"
                        placeholder="🔍 Buscar insumo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Escape' && setSearchTerm('')}
                        autoFocus
                    />
                </div>
                <div className="flex-row gap-2">
                    <button onClick={() => window.print()} className="btn-secondary px-4 py-3 text-lg font-bold border-green text-green hover:bg-green/10">
                        🖨️ Imprimir
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn px-6 py-3 text-lg font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-500">
                        + Nuevo Insumo
                    </button>
                </div>
            </div>

            {/* Supply Table Container */}
            <div className="glass-panel p-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="overflow-x-auto" style={{ outline: 'none' }}>
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase text-secondary">
                                <th className="p-4 font-semibold">Insumo</th>
                                <th className="p-4 font-semibold text-right">Costo Unit.</th>
                                <th className="p-4 font-semibold text-right text-blue-400">Stock Actual</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-secondary">Cargando...</td>
                                </tr>
                            ) : filteredSupplies.map(s => (
                                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-white/90">{s.name}</div>
                                        <div className="text-secondary text-xs">{s.unit}</div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-white/70">
                                        ${s.unitCost.toLocaleString('es-AR')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-lg font-bold ${s.stock > s.minStock ? 'text-blue-400' : 'text-red'}`}>
                                                {s.stock} {s.unit}
                                            </span>
                                            {s.stock <= s.minStock && (
                                                <span className="text-[10px] bg-red/20 text-red px-1 rounded uppercase font-bold">Bajo Stock</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(s)} className="btn-secondary text-xs px-2 py-1" title="Editar">✏️</button>
                                            <button onClick={() => handleDeleteClick(s)} className="btn-secondary text-xs px-2 py-1 text-red" title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredSupplies.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-secondary">
                                        No se encontraron insumos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Borrado */}
            {isDeleteModalOpen && supplyToDelete && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    <div className="glass-panel w-full max-w-sm p-6 flex flex-col gap-6 text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-4xl">⚠️</div>
                        <h3 className="text-xl font-bold text-white">¿Eliminar Insumo?</h3>
                        <p className="text-secondary text-sm">
                            Esta acción eliminará <strong>"{supplyToDelete.name}"</strong> permanentemente. <br />
                            No podrás deshacer esta acción.
                        </p>

                        <div className="flex gap-3 mt-4">
                            <button onClick={confirmDelete} className="btn bg-red hover:bg-red/80 w-full py-3">Sí, Eliminar</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary w-full">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición/Creación */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 9999,
                        backgroundColor: '#0f172a',
                        overflowY: 'auto',
                        padding: '1rem'
                    }}
                >
                    <div
                        className="w-full max-w-xl bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-8 mx-auto my-8"
                        onClick={e => e.stopPropagation()}
                        style={{ minHeight: 'fit-content' }}
                    >

                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                                {editingId ? '✏️ Editar ' : '📦 Nuevo '} Insumo
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex-col gap-3">
                                <label className="text-xs uppercase text-secondary font-semibold ml-1">Nombre del Insumo</label>
                                <input
                                    className="input-field text-lg font-bold bg-white/5 border-white/10 focus:bg-white/10"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Papel Ilustración 150g"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                />
                            </div>

                        </div>

                        {/* Provider Selection */}
                        <div className="flex-col gap-3">
                            <label className="text-xs uppercase text-secondary font-semibold ml-1">Proveedor</label>
                            <select
                                className="input-field bg-white/5 border-white/10"
                                value={formData.providerId}
                                onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                            >
                                <option value="">-- Sin Proveedor --</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} {p.category ? `(${p.category})` : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex-col gap-3">
                                <label className="text-xs uppercase text-secondary font-semibold ml-1">Unidad</label>
                                <select
                                    className="input-field bg-white/5 border-white/10"
                                    value={['kg', 'unidad', 'lt', 'mt', 'resma', 'caja'].includes(formData.unit) ? formData.unit : 'unidad'}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="unidad">Unidad (un)</option>
                                    <option value="kg">Kilos (kg)</option>
                                    <option value="lt">Litros (l)</option>
                                    <option value="mt">Metros (m)</option>
                                    <option value="resma">Resma</option>
                                    <option value="caja">Caja</option>
                                </select>
                            </div>
                            <div className="flex-col gap-3">
                                <label className="text-xs uppercase text-secondary font-semibold ml-1">Costo Unitario</label>
                                <div className="input-group">
                                    <span className="input-prefix text-secondary">$</span>
                                    <input
                                        type="number"
                                        className="input-field font-bold"
                                        value={formData.unitCost}
                                        onChange={e => setFormData({ ...formData, unitCost: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Inventory Section (Stock) */}
                        <div className="bg-blue-500/5 p-6 rounded-xl border border-blue-500/20 flex flex-col gap-6">
                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                📦 Control de Stock
                            </h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex-col gap-3">
                                    <label className="text-xs text-secondary font-semibold ml-1">Stock Actual</label>
                                    <input
                                        type="number"
                                        className="input-field font-bold"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex-col gap-3">
                                    <label className="text-xs text-secondary font-semibold ml-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.minStock}
                                        onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button onClick={handleSave} className="btn bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg flex-1 py-4 uppercase tracking-wider shadow-xl shadow-blue-500/10">
                                Guardar Insumo
                            </button>
                            <button onClick={() => setIsModalOpen(false)} className="btn-secondary px-8 py-4">
                                Cancelar
                            </button>
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
