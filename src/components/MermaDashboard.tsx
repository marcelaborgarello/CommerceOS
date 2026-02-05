'use client';

import { useState, useEffect } from 'react';
import { getWastage, deleteWastage } from '@/actions/mermaActions';

interface Merma {
    id: string;
    productName: string;
    quantity: number;
    unitCost: number;
    date: Date;
    reason: string;
}

export function MermaDashboard() {
    const [mermas, setMermas] = useState<Merma[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<'week' | 'month'>('week');

    // Delete Modal
    const [mermaToDelete, setMermaToDelete] = useState<Merma | null>(null);

    const loadMermas = async () => {
        setLoading(true);
        const res = await getWastage(range);
        if (res.success && res.data) {
            setMermas(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMermas();
    }, [range]);

    const handleDeleteClick = (merma: Merma) => {
        setMermaToDelete(merma);
    };

    const confirmDelete = async () => {
        if (!mermaToDelete) return;
        await deleteWastage(mermaToDelete.id);
        setMermaToDelete(null);
        loadMermas();
    };

    const totalPerdida = mermas.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0);
    const totalKilos = mermas.reduce((sum, m) => sum + m.quantity, 0);

    // Agrupar por producto para el gráfico
    const chartData = mermas.reduce((acc, m) => {
        if (!acc[m.productName]) acc[m.productName] = 0;
        acc[m.productName] += (m.quantity * m.unitCost);
        return acc;
    }, {} as Record<string, number>);

    const sortedProducts = Object.entries(chartData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    const maxVal = Math.max(...sortedProducts.map(([, v]) => v), 100);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center">
                <h2 className="section-title text-red">🗑️ Control de Mermas</h2>
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setRange('week')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${range === 'week' ? 'bg-red text-white font-bold' : 'text-secondary hover:bg-white/10'}`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setRange('month')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${range === 'month' ? 'bg-red text-white font-bold' : 'text-secondary hover:bg-white/10'}`}
                    >
                        Mes
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel border-l-4 border-red py-4 text-center">
                    <span className="text-secondary text-xs uppercase block mb-1">Pérdida Total ({range === 'week' ? 'Semana' : 'Mes'})</span>
                    <span className="text-2xl font-black text-red">
                        ${totalPerdida.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="glass-panel border-l-4 border-orange-400 py-4 text-center">
                    <span className="text-secondary text-xs uppercase block mb-1">Volumen Descartado</span>
                    <span className="text-2xl font-black text-white">
                        {totalKilos.toLocaleString('es-AR', { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-secondary">kg/u</span>
                    </span>
                </div>
            </div>

            {/* Gráfico Top Mermas */}
            {sortedProducts.length > 0 && (
                <div className="glass-panel">
                    <h3 className="text-xs uppercase text-secondary font-bold mb-4">Top Pérdidas por Producto</h3>
                    <div className="flex flex-col gap-3">
                        {sortedProducts.map(([name, value], i) => (
                            <div key={name} className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-white">{name}</span>
                                    <span className="text-red font-bold">${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red"
                                        style={{ width: `${(value / maxVal) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista Reciente */}
            <div className="glass-panel p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-secondary text-xs uppercase">
                            <th className="p-3 text-left">Fecha</th>
                            <th className="p-3 text-left">Producto</th>
                            <th className="p-3 text-right">Cant.</th>
                            <th className="p-3 text-right">$$</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {mermas.map(m => (
                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 text-secondary text-xs">
                                    {new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="p-3 font-medium">{m.productName}</td>
                                <td className="p-3 text-right">{m.quantity}</td>
                                <td className="p-3 text-right text-red font-bold">
                                    ${(m.quantity * m.unitCost).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => handleDeleteClick(m)}
                                        className="text-white/40 hover:text-red transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {mermas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-secondary">
                                    No hay mermas registradas en este período. ¡Bien ahí! 🎉
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {mermaToDelete && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setMermaToDelete(null)}>
                    <div className="glass-panel w-full max-w-sm p-6 flex flex-col gap-6 text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-4xl">⚠️</div>
                        <h3 className="text-xl font-bold text-white">¿Borrar Merma?</h3>
                        <p className="text-secondary text-sm">
                            Estás por eliminar el descarte de <br />
                            <strong className="text-white">{mermaToDelete.productName}</strong> ({mermaToDelete.quantity}u/kg).
                        </p>

                        <div className="flex gap-3 mt-4">
                            <button onClick={confirmDelete} className="btn bg-red hover:bg-red/80 w-full py-3">Sí, Eliminar</button>
                            <button onClick={() => setMermaToDelete(null)} className="btn-secondary w-full">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
