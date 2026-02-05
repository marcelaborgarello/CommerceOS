'use client';

import { useEffect, useState } from "react";
import { storeConfig } from '@/config/storeConfig';
import type { Product } from '@/types';

interface PriceListPrintProps {
    products: Product[];
}

export const PriceListPrint = ({ products }: PriceListPrintProps) => {
    const [date, setDate] = useState("");

    useEffect(() => {
        setDate(new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }));
    }, []);

    // Only render if there are products, otherwise empty page issue might persist or just blank div
    // But page layout expects this to be hidden in screen always.
    if (products.length === 0) return null;
    return (
        <div className="print-only bg-white text-black p-8 hidden">
            {/* Header */}
            <div className="flex flex-row justify-between items-start mb-4 border-b-2 border-black pb-1" style={{ marginBottom: '10px', paddingBottom: '5px' }}>
                <div className="flex flex-col">
                    <span className="text-lg tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-brand)', marginBottom: '-10px', display: 'block' }}>
                        {storeConfig.type}
                    </span>
                    <h1 className="text-4xl font-black uppercase" style={{ fontFamily: 'var(--font-brand)', marginBottom: '-6px', lineHeight: '1' }}>
                        {storeConfig.name}
                    </h1>
                </div>
                <div className="text-right flex flex-col justify-end h-full">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest leading-none" style={{ marginBottom: '2px', display: 'block' }}>Precios vigentes el día</span>
                    <p className="font-bold text-lg leading-none" style={{ marginTop: '0' }}>{date}</p>
                </div>
            </div>

            {/* Title */}
            <div className="mb-4 text-center">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] inline-block border-y border-black py-1" style={{ borderTop: '1px solid black', borderBottom: '1px solid black' }}>
                    Lista de Precios
                </h2>
            </div>

            {/* List */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-black md:hidden">
                        <th className="w-[50%]">Producto</th>
                        <th className="w-[25%] text-center">Unidad</th>
                        <th className="w-[25%] text-right">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {products
                        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
                        .map((p, idx) => (
                            <tr key={p.id} className={`${p.isOnSale ? 'bg-yellow-100 border-yellow-200' : idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'} break-inside-avoid border-b border-gray-100`} style={p.finalPrice <= 0 ? { opacity: 0.5, filter: 'grayscale(100%)' } : {}}>
                                {/* Product Name */}
                                <td className="py-2 px-4 text-lg font-bold uppercase w-[50%] align-middle leading-tight relative">
                                    {p.isOnSale && <span className="absolute left-1 top-1/2 -translate-y-1/2 text-lg">🔥</span>}
                                    <span className={p.isOnSale ? 'ml-4' : ''}>{p.name}</span>
                                </td>

                                {/* Unit - Centered and clean */}
                                <td className="py-2 px-4 text-center w-[25%] align-middle">
                                    <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded border ${p.isOnSale ? 'bg-yellow-200 border-yellow-300 text-black' : 'bg-white border-gray-200 text-gray-600'}`}>
                                        x {p.unit}
                                    </span>
                                </td>

                                {/* Price - Right Aligned & Cleaner */}
                                <td className="py-2 px-4 text-right w-[25%] align-middle">
                                    {p.finalPrice > 0 ? (
                                        <span className={`font-black block ${p.isOnSale ? 'text-xl' : 'text-lg'}`} style={{ fontSize: p.isOnSale ? '1.2rem' : '1rem' }}>
                                            ${p.finalPrice.toLocaleString('es-AR')}
                                        </span>
                                    ) : (
                                        <span className="font-bold text-xs uppercase tracking-widest text-gray-400 block border-gray-300 border-2 rounded px-2 py-1 text-center">
                                            Sin Stock
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            <style jsx global>{`
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; }
                    .print-only { display: block !important; }
                }
            `}</style>
        </div>
    );
};
