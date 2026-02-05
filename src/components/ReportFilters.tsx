'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { now } from '@/utils/dateUtils';

export const ReportFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to current month/year or URL params
    const currentMonth = now().getMonth();
    const currentYear = now().getFullYear();

    const paramMonth = searchParams.get('month');
    const paramYear = searchParams.get('year');

    const [month, setMonth] = useState(paramMonth ? parseInt(paramMonth) : currentMonth);
    const [year, setYear] = useState(paramYear ? parseInt(paramYear) : currentYear);

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const years = Array.from({ length: 5 }, (_, i) => now().getFullYear() - i);

    // Update state when URL changes (back navigation support)
    useEffect(() => {
        if (paramMonth) setMonth(parseInt(paramMonth));
        if (paramYear) setYear(parseInt(paramYear));
    }, [paramMonth, paramYear]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVal = parseInt(e.target.value);
        setMonth(newVal);
        updateUrl(newVal, year);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVal = parseInt(e.target.value);
        setYear(newVal);
        updateUrl(month, newVal);
    };

    const updateUrl = (m: number, y: number) => {
        router.push(`/reports?month=${m}&year=${y}`);
    };

    return (
        <div className="flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="section-title" style={{ marginBottom: 0 }}>📊 Reporte de Rentabilidad</h2>
            <div className="flex-row gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                <select
                    className="bg-transparent text-sm font-bold text-white outline-none p-2 cursor-pointer"
                    value={month}
                    onChange={handleMonthChange}
                >
                    {months.map((m, i) => <option key={m} value={i} className="text-black">{m}</option>)}
                </select>
                <select
                    className="bg-transparent text-sm font-bold text-white outline-none p-2 cursor-pointer"
                    value={year}
                    onChange={handleYearChange}
                >
                    {years.map(y => <option key={y} value={y} className="text-black">{y}</option>)}
                </select>
            </div>
        </div>
    );
};
