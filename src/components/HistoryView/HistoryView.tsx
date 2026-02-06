'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CashAudit } from '@/generated/prisma/client';


// Components
import { HistoryFilters } from './components/HistoryFilters';
import { HistoryStatsCards } from './components/HistoryStatsCards';
import { HistoryList } from './components/HistoryList';
import { HistoryCharts } from './components/HistoryCharts';
import { ArqueoDetail } from './components/ArqueoDetail';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EditArqueoModal } from './components/EditArqueoModal';

// Hooks
import { useHistoryFilters } from './hooks/useHistoryFilters';
import { useHistoryStats } from './hooks/useHistoryStats';
import { useArqueoActions } from './hooks/useArqueoActions';

interface Props {
    audits: CashAudit[];
    initialYear: number;
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function HistoryView({ audits, initialYear }: Props) {
    const router = useRouter();
    const [selectedAudit, setSelectedAudit] = useState<CashAudit | null>(null);

    // Custom hooks
    const { filters, setMonth, setYear, setWeekday, setSearchTerm, setView } = useHistoryFilters(initialYear);
    const { deleteConfirmId, setDeleteConfirmId, editingArqueo, setEditingArqueo, handleDelete, handleUpdate } = useArqueoActions();

    // Sync year with URL
    useEffect(() => {
        setYear(initialYear);
    }, [initialYear]);

    const handleYearChange = (year: number) => {
        setYear(year);
        router.push(`/history?year=${year}`);
    };

    // Filter audits
    const filteredAudits = audits.filter(a => {
        const date = new Date(a.createdAt);
        const matchesDate = date.getMonth() === filters.selectedMonth && date.getFullYear() === filters.selectedYear;
        const matchesWeekday = filters.selectedWeekday === null || date.getDay() === filters.selectedWeekday;
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch = a.date.toLowerCase().includes(term) || (a.notes?.toLowerCase().includes(term) || false);

        return matchesDate && matchesSearch && matchesWeekday;
    });

    // Calculate stats
    const stats = useHistoryStats(filteredAudits);

    // Show detail view if audit is selected
    if (selectedAudit) {
        return <ArqueoDetail audit={selectedAudit} onBack={() => setSelectedAudit(null)} />;
    }

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-row justify-between items-center">
                <h2 className="section-title mb-0">📅 Historial de Cierres</h2>
            </div>

            {/* Stats Cards */}
            <HistoryStatsCards stats={stats} monthName={MONTHS[filters.selectedMonth] || ''} />

            {/* Filters */}
            <HistoryFilters
                filters={filters}
                onMonthChange={setMonth}
                onYearChange={handleYearChange}
                onWeekdayChange={setWeekday}
                onSearchChange={setSearchTerm}
                onViewChange={setView}
            />

            {/* Content - List or Charts */}
            {filters.view === 'charts' ? (
                <HistoryCharts
                    audits={filteredAudits}
                    selectedMonth={filters.selectedMonth}
                    selectedYear={filters.selectedYear}
                    monthName={MONTHS[filters.selectedMonth] || ''}
                />
            ) : (
                <HistoryList
                    audits={filteredAudits}
                    onSelect={setSelectedAudit}
                    onEdit={audit => setEditingArqueo({ id: audit.id, date: audit.date, notes: audit.notes || '' })}
                    onDelete={setDeleteConfirmId}
                />
            )}

            {/* Modals */}
            <DeleteConfirmModal
                isOpen={!!deleteConfirmId}
                onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                onCancel={() => setDeleteConfirmId(null)}
            />

            <EditArqueoModal
                state={editingArqueo}
                onUpdate={handleUpdate}
                onCancel={() => setEditingArqueo(null)}
                onChange={setEditingArqueo}
            />
        </div>
    );
}
