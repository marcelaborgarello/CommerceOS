'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Props {
    initialFilters: {
        search: string;
        type: string;
        startDate?: string;
        endDate?: string;
    };
}

export function SalesFilters({ initialFilters }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState(initialFilters);

    function handleSearch(term: string) {
        setFilters(prev => ({ ...prev, search: term }));
        // Debounce could be added here
        updateParams({ search: term, page: '1' });
    }

    function handleTypeChange(type: string) {
        setFilters(prev => ({ ...prev, type }));
        updateParams({ type, page: '1' });
    }

    function handleDateChange(field: 'startDate' | 'endDate', value: string) {
        setFilters(prev => ({ ...prev, [field]: value }));
        updateParams({ [field]: value, page: '1' });
    }

    function updateParams(updates: Record<string, string>) {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        startTransition(() => {
            isPending ? null : router.replace(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
                <label className="text-xs text-secondary mb-1 block">Buscar</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Cliente, Teléfono, Nº Comprobante..."
                        className="input-field w-full"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(filters.search)}
                    />
                    <button
                        onClick={() => handleSearch(filters.search)}
                        className="btn bg-white/10 hover:bg-white/20 text-white px-3"
                    >
                        🔍
                    </button>
                </div>
            </div>

            {/* Type Filter */}
            <div className="w-full md:w-48">
                <label className="text-xs text-secondary mb-1 block">Tipo</label>
                <select
                    className="input-field w-full"
                    value={filters.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                >
                    <option value="ALL">Todos</option>
                    <option value="TICKET">Ticket (Venta)</option>
                    <option value="PRESUPUESTO">Presupuesto</option>
                </select>
            </div>

            {/* Date Range - Simplified */}
            <div className="flex gap-2 w-full md:w-auto">
                <div className="w-full">
                    <label className="text-xs text-secondary mb-1 block">Desde</label>
                    <input
                        type="date"
                        className="input-field w-full"
                        value={filters.startDate || ''}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                    />
                </div>
                <div className="w-full">
                    <label className="text-xs text-secondary mb-1 block">Hasta</label>
                    <input
                        type="date"
                        className="input-field w-full"
                        value={filters.endDate || ''}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
