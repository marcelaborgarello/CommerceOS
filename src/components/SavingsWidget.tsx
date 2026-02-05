'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReservaBalance } from '@/actions/savingsActions';

export const SavingsWidget = () => {
    const [totalEfectivo, setTotalEfectivo] = useState(0);
    const [totalBanco, setTotalBanco] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [efectivo, banco] = await Promise.all([
                getReservaBalance('CASH'),
                getReservaBalance('BANK')
            ]);

            if (efectivo.success) setTotalEfectivo(efectivo.balance || 0);
            if (banco.success) setTotalBanco(banco.balance || 0);
        } catch (error) {
            console.error('Error loading reserves widget:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalGeneral = totalEfectivo + totalBanco;

    if (loading) return <div className="glass-panel w-full animate-pulse h-24"></div>;

    return (
        <Link href="/savings" className="block group no-underline">
            <div className="glass-panel w-full flex-row items-center justify-between transition-all hover:bg-white/5 border-l-4 border-l-green-500 cursor-pointer py-4">
                <div className="flex-col gap-1">
                    <h3 className="section-title text-base mb-0 flex items-center gap-2 uppercase tracking-wider">
                        <span>💰</span> Fondo de Reserva
                    </h3>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-black text-green group-hover:scale-105 transition-transform">
                        ${totalGeneral.toLocaleString('es-AR')}
                    </div>
                </div>
            </div>
        </Link>
    );
};
