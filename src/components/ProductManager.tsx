import { useState } from 'react';
import { saveProduct, deleteProduct, getProductHistory, type ProductData } from '@/actions/productActions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { createMerma } from '@/actions/mermaActions';
import { Toast } from './Toast';
import { useRouter } from 'next/navigation';
import type { Product, HistoricalPrice } from '@/types';

interface ProductManagerProps {
    products: Product[];
    isLoading: boolean;
    onRefresh: () => void;
    defaultType?: 'SELL' | 'SUPPLY' | 'BOTH';
}

interface ProductFormData {
    name: string;
    unit: string;
    wholesaleCost: string;
    wholesaleQuantity: string;
    margin: string;
    finalPrice: string;
    isOnSale: boolean;
    stock: string;
    minStock: string;
    productType?: string;
    lastCost?: number | null;
    lastPrice?: number | null;
}

export const ProductManager = ({ products, isLoading, onRefresh, defaultType = 'SELL' }: ProductManagerProps) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        unit: 'u',
        wholesaleCost: '',
        wholesaleQuantity: '',
        margin: '60',
        finalPrice: '',
        isOnSale: false,
        stock: '',
        minStock: '5',
        productType: defaultType
    });

    // Merma State
    const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
    const [selectedProductForMerma, setSelectedProductForMerma] = useState<Product | null>(null);
    const [mermaQuantity, setMermaQuantity] = useState('');

    // History State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState<HistoricalPrice[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

    const handleOpenHistory = async (product: Product) => {
        setSelectedProductForHistory(product);
        setIsHistoryModalOpen(true);
        setIsLoadingHistory(true);
        const res = await getProductHistory(product.id);
        if (res.success && res.data) {
            setHistoryData([...res.data].reverse());
        } else {
            setToast({ message: 'Error al cargar historial', type: 'error' });
        }
        setIsLoadingHistory(false);
    };

    const handleOpenMerma = (product: Product) => {
        setSelectedProductForMerma(product);
        setMermaQuantity('');
        setIsMermaModalOpen(true);
    };

    const handleSaveMerma = async () => {
        if (!selectedProductForMerma || !mermaQuantity) return;
        const cost = selectedProductForMerma.unitCost || (selectedProductForMerma.wholesaleCost / selectedProductForMerma.wholesaleQuantity);
        const res = await createMerma({
            productId: selectedProductForMerma.id,
            productName: selectedProductForMerma.name,
            quantity: parseFloat(mermaQuantity),
            costPerUnit: cost,
            reason: 'Descarte Manual'
        });
        if (res.success) {
            setToast({ message: 'Merma registrada (Pérdida calculada)', type: 'success' });
            setIsMermaModalOpen(false);
        } else {
            setToast({ message: 'Error al registrar merma', type: 'error' });
        }
    };

    // Calculated fields
    const valWholesaleCost = parseFloat(formData.wholesaleCost) || 0;
    const valWholesaleQuantity = parseFloat(formData.wholesaleQuantity) || 1;
    const valMargin = parseFloat(formData.margin) || 0;
    const unitCost = valWholesaleCost / (valWholesaleQuantity || 1);
    const suggestedPrice = unitCost * (1 + valMargin / 100);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name,
                unit: product.unit,
                wholesaleCost: product.wholesaleCost.toString(),
                wholesaleQuantity: product.wholesaleQuantity.toString(),
                margin: product.margin.toString(),
                finalPrice: product.finalPrice.toString(),
                isOnSale: product.isOnSale || false,
                lastCost: product.lastCost,
                lastPrice: product.lastPrice,
                stock: (product.stock || 0).toString(),
                minStock: (product.minStock || 0).toString(),
                productType: product.productType
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                unit: 'u',
                wholesaleCost: '',
                wholesaleQuantity: '',
                margin: '60',
                finalPrice: '',
                isOnSale: false,
                lastCost: null,
                lastPrice: null,
                stock: '',
                minStock: '5',
                productType: defaultType
            });
        }
        setIsModalOpen(true);
    };

    const renderVariation = (current: number, previous: number | null | undefined, type: 'cost' | 'price') => {
        if (!previous || previous === 0) return null;
        if (current === previous) return null;
        const diff = current - previous;
        const percent = ((diff / previous) * 100);
        const isPositive = diff > 0;
        const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
        const arrow = isPositive ? '📈' : '📉';
        return (
            <div className={`text-xs font-mono font-bold ${colorClass} flex items-center gap-1 mt-1 bg-black/30 px-2 py-1 rounded`}>
                {arrow} {isPositive ? '+' : ''}{percent.toFixed(1)}% <span className="opacity-60 text-[10px] ml-1">(${previous.toLocaleString('es-AR')})</span>
            </div>
        );
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setToast({ message: 'El nombre es obligatorio', type: 'error' });
            return;
        }
        const res = await saveProduct({
            ...formData,
            wholesaleCost: parseFloat(formData.wholesaleCost) || 0,
            wholesaleQuantity: parseFloat(formData.wholesaleQuantity) || 1,
            margin: parseFloat(formData.margin) || 0,
            finalPrice: parseFloat(formData.finalPrice) || 0,
            isOnSale: formData.isOnSale,
            stock: parseFloat(formData.stock) || 0,
            minStock: parseFloat(formData.minStock) || 0,
            productType: defaultType,
            id: editingId || undefined
        });
        if (res.success) {
            setToast({ message: 'Producto guardado', type: 'success' });
            setIsModalOpen(false);
            onRefresh();
        } else {
            setToast({ message: 'Error al guardar', type: 'error' });
        }
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        const res = await deleteProduct(productToDelete.id);
        if (res.success) {
            setToast({ message: 'Producto eliminado', type: 'success' });
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            onRefresh();
        } else {
            setToast({ message: 'Error al eliminar', type: 'error' });
        }
    };

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    return (
        <div className="flex-col gap-6 w-full">
            {/* Header Actions */}
            <div className="flex-col md:flex-row justify-between items-center gap-4">
                <div className="glass-panel p-2 flex-1 w-full max-w-md">
                    <input
                        className="input-field"
                        placeholder="🔍 Buscar producto..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Escape' && setSearchTerm('')}
                        autoFocus
                    />
                </div>
                <div className="flex-row gap-2">
                    <button onClick={() => window.print()} className="btn-secondary px-4 py-3 text-lg font-bold border-green text-green hover:bg-green/10">
                        🖨️ Imprimir / PDF
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn px-6 py-3 text-lg font-bold shadow-lg shadow-green/20 hover:scale-105 transition-transform">
                        + Nuevo {defaultType === 'SUPPLY' ? 'Insumo' : 'Producto'}
                    </button>
                </div>
            </div>

            {/* Product Table Container */}
            <div className="glass-panel p-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="overflow-x-auto" style={{ outline: 'none' }}>
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase text-secondary">
                                <th className="p-4 font-semibold">Producto</th>
                                <th className="p-4 font-semibold text-right text-green">{defaultType === 'SUPPLY' ? 'Stock Actual' : 'Precio Final'}</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-secondary">Cargando...</td>
                                </tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group" style={(defaultType !== 'SUPPLY' && p.finalPrice <= 0) ? { opacity: 0.5, filter: 'grayscale(100%)' } : {}}>
                                    <td className="p-4">
                                        <div className="font-bold text-white/90 flex items-center gap-2">
                                            {p.name}
                                            {p.isOnSale && <span className="text-sm" title="En Oferta">🔥</span>}
                                        </div>
                                        <div className="text-secondary text-xs">{p.unit}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {defaultType === 'SUPPLY' ? (
                                            <div className="flex flex-col items-end">
                                                <span className={`text-lg font-bold ${(p.stock || 0) > (p.minStock || 0) ? 'text-blue-400' : 'text-red'}`}>
                                                    {p.stock || 0} {p.unit}
                                                </span>
                                                {(p.stock || 0) <= (p.minStock || 0) && (
                                                    <span className="text-[10px] bg-red/20 text-red px-1 rounded uppercase font-bold">Bajo Stock</span>
                                                )}
                                            </div>
                                        ) : (
                                            p.finalPrice > 0 ? (
                                                <span className="text-lg font-bold text-green">
                                                    ${p.finalPrice.toLocaleString('es-AR')}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-white/5 py-1 px-2 rounded">
                                                    Sin Precio
                                                </span>
                                            )
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenHistory(p)} className="btn-secondary text-xs px-2 py-1 text-blue-400 border-blue-400/20 hover:bg-blue-400/10" title="Ver Historial de Precios">📊</button>
                                            <button onClick={() => handleOpenMerma(p)} className="btn-secondary text-xs px-2 py-1 text-red border-red/20 hover:bg-red/10" title="Registrar Merma">🚮</button>
                                            <button onClick={() => handleOpenModal(p)} className="btn-secondary text-xs px-2 py-1" title="Editar">✏️</button>
                                            <button onClick={() => handleDeleteClick(p)} className="btn-secondary text-xs px-2 py-1 text-red" title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-secondary">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Borrado */}
            {isDeleteModalOpen && productToDelete && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    <div className="glass-panel w-full max-w-sm p-6 flex flex-col gap-6 text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-4xl">⚠️</div>
                        <h3 className="text-xl font-bold text-white">¿Eliminar Producto?</h3>
                        <p className="text-secondary text-sm">
                            Esta acción eliminará <strong>"{productToDelete.name}"</strong> permanentemente. <br />
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
                        className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-8 mx-auto my-8"
                        onClick={e => e.stopPropagation()}
                        style={{ minHeight: 'fit-content' }}
                    >

                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                                {editingId ? '✏️ Editar ' : 'Nuevo '}{defaultType === 'SUPPLY' ? 'Insumo' : 'Producto'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex-col gap-3">
                                <label className="text-xs uppercase text-secondary font-semibold ml-1">Nombre</label>
                                <input
                                    className="input-field text-lg font-bold bg-white/5 border-white/10 focus:bg-white/10"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Tomate Perita"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                            <div className="flex-col gap-3">
                                <label className="text-xs uppercase text-secondary font-semibold ml-1">Unidad {defaultType === 'SUPPLY' ? '' : 'de Venta'}</label>
                                <div className="flex gap-2 w-full">
                                    <input
                                        list="unit-suggestions"
                                        className="input-field bg-white/5 border-white/10 w-full"
                                        placeholder="Ej: un, kg, hora, litro..."
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                                    />
                                    <datalist id="unit-suggestions">
                                        <option value="un">Unidad (un)</option>
                                        <option value="kg">Kilogramo (kg)</option>
                                        <option value="mts">Metros</option>
                                        <option value="lts">Litros</option>
                                        <option value="hr">Hora</option>
                                        <option value="pack">Pack</option>
                                        <option value="caja">Caja</option>
                                    </datalist>
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
                                    <label className="text-xs text-secondary font-semibold ml-1">Stock Mínimo (Alerta)</label>
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

                        {/* Cost Calculator Section */}
                        <div className="bg-black/20 p-6 rounded-xl border border-white/5 flex flex-col gap-6">
                            <h4 className="text-sm font-bold text-accent-color uppercase tracking-wider flex items-center gap-2">
                                📐 Calculadora de Costos
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex-col gap-3">
                                    <label className="text-xs text-secondary font-semibold ml-1">
                                        {defaultType === 'SUPPLY' ? 'Costo de Compra' : 'Costo Referencia (Bulto/Mayorista/Unitario)'}
                                    </label>
                                    <div className="input-group">
                                        <span className="input-prefix text-secondary">$</span>
                                        <input
                                            type="number"
                                            className="input-field text-lg"
                                            value={formData.wholesaleCost}
                                            onChange={e => {
                                                const val = e.target.value;
                                                // Zero-out logic
                                                if (val === '0') {
                                                    setFormData({
                                                        ...formData,
                                                        wholesaleCost: '0',
                                                        finalPrice: '0',
                                                        margin: '0'
                                                    });
                                                } else {
                                                    setFormData({ ...formData, wholesaleCost: val });
                                                }
                                            }}
                                            placeholder="0"
                                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                                        />
                                    </div>
                                </div>
                                {renderVariation(parseFloat(formData.wholesaleCost) || 0, editingId ? products.find(p => p.id === editingId)?.lastCost || products.find(p => p.id === editingId)?.wholesaleCost : null, 'cost')}
                            </div>
                            <div className="flex-col gap-3">
                                <label className="text-xs text-secondary font-semibold ml-1">Cantidad por Referencia</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.wholesaleQuantity}
                                        onChange={e => setFormData({ ...formData, wholesaleQuantity: e.target.value })}
                                        placeholder="1"
                                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                                        title="Si el costo es unitario, poné 1. Si es por caja de 12, poné 12."
                                    />
                                    <span className="input-prefix text-secondary text-xs">{formData.unit}s</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-xs text-secondary">Costo Unitario Resultante:</span>
                            <span className="font-mono font-bold text-white text-lg">${unitCost.toFixed(2)} / {formData.unit}</span>
                        </div>

                        {/* Pricing Section - ONLY IF NOT SUPPLY */}
                        {defaultType !== 'SUPPLY' && (
                            <div className="bg-green-500/5 p-6 rounded-xl border border-green-500/20 flex flex-col gap-6">
                                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                                    💰 Precio de Venta
                                </h4>

                                {/* Offer Toggle */}
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isOnSale || false}
                                            onChange={e => setFormData({ ...formData, isOnSale: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                        <span className="ml-3 text-sm font-bold text-white uppercase tracking-wider">
                                            {formData.isOnSale ? '🔥 ES OFERTA 🔥' : 'Precio Normal'}
                                        </span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="flex-col gap-3">
                                        <label className="text-xs text-secondary font-semibold ml-1">Margen Deseado (%)</label>
                                        <input
                                            type="number"
                                            className="input-field text-center font-bold text-accent-color"
                                            value={formData.margin}
                                            onChange={e => setFormData({ ...formData, margin: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs text-green-400 font-bold uppercase">Precio Final (Al Público)</label>
                                        <div className="input-group border-green-500/50">
                                            <span className="input-prefix text-green-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                className="input-field text-2xl font-black text-white bg-green-500/10"
                                                value={formData.finalPrice}
                                                onChange={e => setFormData({ ...formData, finalPrice: e.target.value })}
                                                placeholder={suggestedPrice.toFixed(0)}
                                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                            />
                                        </div>
                                        {/* Variation for Price */}
                                        {renderVariation(parseFloat(formData.finalPrice) || 0, editingId ? products.find(p => p.id === editingId)?.lastPrice || products.find(p => p.id === editingId)?.finalPrice : null, 'price')}
                                    </div>
                                </div>


                                {/* Suggestion Helper */}
                                {suggestedPrice > 0 && Math.abs(parseFloat(formData.finalPrice || '0') - suggestedPrice) > 1 && (
                                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                                        <span className="text-xs text-secondary">Sugerido por margen: <strong>${suggestedPrice.toFixed(0)}</strong></span>
                                        <button
                                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors"
                                            onClick={() => setFormData({ ...formData, finalPrice: (Math.round(suggestedPrice / 10) * 10).toString() })}
                                        >
                                            Aplicar Sugerido
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button onClick={handleSave} className="btn bg-green-500 hover:bg-green-400 text-black font-bold text-lg flex-1 py-4 uppercase tracking-wider shadow-xl shadow-green-500/10">
                                Guardar {defaultType === 'SUPPLY' ? 'Insumo' : 'Producto'}
                            </button>
                            <button onClick={() => setIsModalOpen(false)} className="btn-secondary px-8 py-4">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Merma */}
            {isMermaModalOpen && selectedProductForMerma && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={() => setIsMermaModalOpen(false)}>
                    <div className="glass-panel w-full max-w-md p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                        <h3 className="section-title text-xl text-red mb-2">🗑️ Registrar Merma</h3>

                        <div className="bg-white/5 p-4 rounded-lg">
                            <span className="text-secondary text-xs uppercase block">Producto</span>
                            <span className="text-xl font-bold text-white">{selectedProductForMerma.name}</span>
                            <div className="flex justify-between mt-2 text-sm text-secondary">
                                <span>Costo Unitario: ${selectedProductForMerma.unitCost?.toFixed(2) || ((selectedProductForMerma.wholesaleCost / selectedProductForMerma.wholesaleQuantity).toFixed(2))}</span>
                                <span>Unidad: {selectedProductForMerma.unit}</span>
                            </div>
                        </div>

                        <div className="flex-col gap-3">
                            <label className="text-sm font-bold text-white">Cantidad Descartada</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="input-field text-xl font-bold"
                                    autoFocus
                                    placeholder="0.00"
                                    value={mermaQuantity}
                                    onChange={e => setMermaQuantity(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveMerma()}
                                />
                                <span className="p-3 bg-white/5 rounded-lg text-secondary font-bold flex items-center">
                                    {selectedProductForMerma.unit}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-red/10 rounded-lg border border-red/20">
                            <div className="flex justify-between items-center">
                                <span className="text-red text-sm font-bold uppercase">Pérdida Estimada</span>
                                <span className="text-2xl font-black text-white">
                                    ${(parseFloat(mermaQuantity || '0') * (selectedProductForMerma.unitCost || (selectedProductForMerma.wholesaleCost / selectedProductForMerma.wholesaleQuantity))).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button onClick={handleSaveMerma} className="btn bg-red hover:bg-red/80 w-full py-3">Confirmar Descarte</button>
                            <button onClick={() => setIsMermaModalOpen(false)} className="btn-secondary w-full">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Historial */}
            {isHistoryModalOpen && selectedProductForHistory && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsHistoryModalOpen(false)}>
                    <div className="glass-panel w-full max-w-3xl p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="section-title text-xl text-blue-400 mb-1">📊 Historial de Precios</h3>
                                <p className="text-white font-bold text-2xl">{selectedProductForHistory.name}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-secondary hover:text-white">✕</button>
                        </div>

                        <div className="h-[300px] w-full bg-white/5 rounded-xl p-4 border border-white/10">
                            {isLoadingHistory ? (
                                <div className="h-full flex items-center justify-center text-secondary">Cargando datos...</div>
                            ) : historyData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-secondary">No hay historial registrado aún.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => new Date(str).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                                            stroke="#ffffff50"
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis
                                            stroke="#ffffff50"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(val) => `$${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                            itemStyle={{ fontSize: '12px' }}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        />
                                        <Line type="monotone" dataKey="price" stroke="#4ade80" strokeWidth={3} dot={{ r: 4 }} name="Precio Venta" />
                                        <Line type="monotone" dataKey="cost" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Costo Bulto" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="max-h-[200px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-secondary uppercase bg-white/5 sticky top-0">
                                    <tr>
                                        <th className="p-2">Fecha</th>
                                        <th className="p-2 text-right">Costo</th>
                                        <th className="p-2 text-right">Precio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {!isLoadingHistory && [...historyData].reverse().map((h: HistoricalPrice) => (
                                        <tr key={h.id} className="hover:bg-white/5">
                                            <td className="p-2 text-secondary">
                                                {new Date(h.date).toLocaleDateString('es-AR')} <span className="text-[10px] opacity-50">{new Date(h.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="p-2 text-right font-mono text-red-300">${h.cost.toLocaleString('es-AR')}</td>
                                            <td className="p-2 text-right font-mono text-green-300 font-bold">${h.price.toLocaleString('es-AR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
