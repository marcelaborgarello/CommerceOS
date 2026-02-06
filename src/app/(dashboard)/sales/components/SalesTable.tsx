'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SaleDetail } from './SaleDetail';

// Extend Sale type loosely for now to include items and new fields until global types are synced
export interface ExtendedSale {
    id: string;
    date: Date;
    type: string;
    description: string;
    amount: number;
    paymentMethod: string;
    pointOfSale: number;
    number: number;
    customerName?: string | null;
    customerPhone?: string | null;
    items?: any[];
    status?: string; // New field
}

interface Props {
    sales: ExtendedSale[];
    currentPage: number;
    totalPages: number;
    organizationId: string;
}

export function SalesTable({ sales, currentPage, totalPages, organizationId }: Props) {
    const router = useRouter();
    const [selectedSale, setSelectedSale] = useState<ExtendedSale | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    function handlePageChange(newPage: number) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    }

    function handleOpenDetail(sale: ExtendedSale) {
        setSelectedSale(sale);
        setIsDetailOpen(true);
    }

    function handleCloseDetail() {
        setIsDetailOpen(false);
        setSelectedSale(null);
    }

    /* Helper for full number display */
    const getFullNumber = (sale: ExtendedSale) => {
        return `${sale.pointOfSale.toString().padStart(4, '0')}-${sale.number.toString().padStart(8, '0')}`;
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-secondary text-sm border-b border-white/10">
                            <th className="p-4 font-medium">Fecha</th>
                            <th className="p-4 font-medium">Comprobante</th>
                            <th className="p-4 font-medium">Cliente / Teléfono</th>
                            <th className="p-4 font-medium">Items</th>
                            <th className="p-4 font-medium text-right">Total</th>
                            <th className="p-4 font-medium text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-secondary">
                                    No se encontraron comprobantes.
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale) => {
                                const isCanceled = sale.status === 'CANCELED';
                                return (
                                    <tr key={sale.id} className={`hover:bg-white/5 transition-colors group ${isCanceled ? 'opacity-60 bg-red-500/5' : ''}`}>
                                        <td className="p-4 text-sm">
                                            <div className="text-white relative">
                                                {new Date(sale.date).toLocaleDateString('es-AR')}
                                                {isCanceled && <span className="absolute -top-3 -right-6 text-[10px] bg-red-500 text-white px-1 rounded">ANULADO</span>}
                                            </div>
                                            <div className="text-xs text-secondary">{new Date(sale.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>

                                        <td className="p-4">
                                            {sale.type !== 'RAPIDA' && (
                                                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${isCanceled
                                                    ? 'bg-gray-500/20 border-gray-500 text-gray-400 line-through'
                                                    : sale.type === 'PRESUPUESTO'
                                                        ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                                                        : 'bg-green-500/10 border-green-500/50 text-green-500'
                                                    }`}>
                                                    {sale.type}
                                                </div>
                                            )}
                                            <div className="text-xs text-secondary mt-1 font-mono">
                                                {getFullNumber(sale)}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {sale.customerName ? (
                                                <div className={`text-white font-medium ${isCanceled ? 'line-through decoration-red-500' : ''}`}>{sale.customerName}</div>
                                            ) : (
                                                <span className="text-secondary italic">Consumidor Final</span>
                                            )}
                                            {sale.customerPhone && (
                                                <div className="text-xs text-blue-300 flex items-center gap-1 mt-0.5">
                                                    📱 {sale.customerPhone}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4 text-sm text-secondary">
                                            {sale.items?.length || 0} item(s)
                                            <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[200px]">
                                                {sale.description}
                                            </div>
                                        </td>

                                        <td className="p-4 text-right font-bold text-white">
                                            <span className={isCanceled ? 'line-through text-red-500' : ''}>
                                                ${sale.amount.toLocaleString('es-AR')}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleOpenDetail(sale)}
                                                className="btn-icon hover:text-white transition-colors"
                                                title="Ver Detalle"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 flex justify-center gap-2 border-t border-white/10">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="btn bg-white/5 hover:bg-white/10 disabled:opacity-30 px-3 py-1 text-sm"
                    >
                        Anterior
                    </button>
                    <span className="px-3 py-1 text-sm text-secondary self-center">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="btn bg-white/5 hover:bg-white/10 disabled:opacity-30 px-3 py-1 text-sm"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            <SaleDetail
                sale={selectedSale}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                organizationId={organizationId}
            />
        </div>
    );
}
