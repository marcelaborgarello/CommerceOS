'use client';

import './ticket.css';
import { useState } from 'react';
import { Header } from '@/components/Header';
import type { Product } from '@/types';
import { useTicket } from './hooks/useTicket';

// Components
import { TicketCustomerForm } from './components/TicketCustomerForm';
import { TicketProductSearch } from './components/TicketProductSearch';
import { TicketReceipt } from './components/TicketReceipt';

interface TicketClientProps {
    organization: {
        name: string;
        type: string;
        logoUrl?: string;
        address?: string;
        phone?: string;
    };
    userEmail?: string;
    initialProducts?: Product[];
}

export function TicketClient({ organization, userEmail, initialProducts = [] }: TicketClientProps) {
    const [products] = useState<Product[]>(initialProducts);

    // Custom Hook for Logic
    const {
        items,
        clientName, setClientName,
        address, setAddress,
        phone, setPhone,
        total,
        addItem,
        removeItem,
        clearTicket
    } = useTicket();

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-12">

            {/* Main App Header (Hidden on Print) */}
            <div className="print-hidden">
                <Header
                    title="Ticket / Punto de Venta"
                    subtitle="Comprobantes no fiscales"
                    organizationName={organization?.name}
                    organizationType={organization?.type}
                    logoUrl={organization?.logoUrl}
                    userEmail={userEmail}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto px-4">

                {/* LEFT PANEL: Controls (No Imprimible) */}
                <div className="flex-1 flex flex-col gap-6 print-hidden">

                    <TicketCustomerForm
                        clientName={clientName}
                        setClientName={setClientName}
                        address={address}
                        setAddress={setAddress}
                        phone={phone}
                        setPhone={setPhone}
                    />

                    <TicketProductSearch
                        products={products}
                        onAddItem={addItem}
                    />

                    <div className="flex gap-4">
                        <button
                            onClick={clearTicket}
                            className="btn h-14 bg-red/10 text-red border border-red/20 hover:bg-red/20 flex-1 text-xs md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>🗑️</span> Limpiar
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="btn h-14 bg-white text-black font-black border-2 border-white hover:bg-gray-200 hover:border-gray-300 flex-1 text-sm md:text-base uppercase tracking-widest shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>🖨️</span> IMPRIMIR
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: Ticket Preview (Imprimible) */}
                <div className="flex-1 flex justify-center items-start">
                    <TicketReceipt
                        items={items}
                        customerInfo={{ name: clientName, address, phone }}
                        organization={organization}
                        total={total}
                        onRemoveItem={removeItem}
                    />
                </div>
            </div>

        </div>
    );
}
