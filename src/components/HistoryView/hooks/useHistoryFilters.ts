import { useState } from 'react';
import type { HistoryFilters } from '@/types';
import { now } from '@/utils/dateUtils';

export function useHistoryFilters(initialYear: number) {
    const [filters, setFilters] = useState<HistoryFilters>({
        selectedMonth: now().getMonth(),
        selectedYear: initialYear,
        selectedWeekday: null,
        searchTerm: '',
        view: 'list'
    });

    const setMonth = (month: number) => {
        setFilters(prev => ({ ...prev, selectedMonth: month }));
    };

    const setYear = (year: number) => {
        setFilters(prev => ({ ...prev, selectedYear: year }));
    };

    const setWeekday = (weekday: number | null) => {
        setFilters(prev => ({ ...prev, selectedWeekday: weekday }));
    };

    const setSearchTerm = (term: string) => {
        setFilters(prev => ({ ...prev, searchTerm: term }));
    };

    const setView = (view: 'list' | 'charts') => {
        setFilters(prev => ({ ...prev, view }));
    };

    return {
        filters,
        setMonth,
        setYear,
        setWeekday,
        setSearchTerm,
        setView
    };
}
