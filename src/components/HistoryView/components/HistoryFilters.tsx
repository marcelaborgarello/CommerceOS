import type { HistoryFilters } from '@/types';

interface Props {
    filters: HistoryFilters;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    onWeekdayChange: (weekday: number | null) => void;
    onSearchChange: (term: string) => void;
    onViewChange: (view: 'list' | 'charts') => void;
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];
const FULL_WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function HistoryFilters({ filters, onMonthChange, onYearChange, onWeekdayChange, onSearchChange, onViewChange }: Props) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="flex flex-col gap-4">
            {/* View Toggle */}
            <div className="flex flex-row items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10 self-start">
                <button
                    onClick={() => onViewChange('list')}
                    className={`text-xs px-4 py-2 rounded-full transition-all ${filters.view === 'list'
                        ? 'bg-accent text-[#0f172a] font-bold shadow-lg'
                        : 'text-secondary hover:text-white'
                        }`}
                >
                    📜 LISTA
                </button>
                <button
                    onClick={() => onViewChange('charts')}
                    className={`text-xs px-4 py-2 rounded-full transition-all ${filters.view === 'charts'
                        ? 'bg-accent text-[#0f172a] font-bold shadow-lg'
                        : 'text-secondary hover:text-white'
                        }`}
                >
                    📊 GRÁFICOS
                </button>
            </div>

            {/* Month, Year, Search */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex flex-row gap-2 flex-1">
                    <select
                        className="input-field flex-1"
                        value={filters.selectedMonth}
                        onChange={e => onMonthChange(Number(e.target.value))}
                    >
                        {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <select
                        className="input-field flex-1"
                        value={filters.selectedYear}
                        onChange={e => onYearChange(Number(e.target.value))}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="🔍 Buscar en notas o fechas..."
                    className="input-field flex-1"
                    value={filters.searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>

            {/* Weekday Filter */}
            <div className="flex flex-row items-center gap-3">
                <span className="text-xs text-secondary uppercase font-bold whitespace-nowrap">Filtrar por día:</span>
                <div className="flex flex-row gap-2 overflow-x-auto pb-2 flex-1">
                    <button
                        onClick={() => onWeekdayChange(null)}
                        className={`flex-1 min-w-[80px] text-center py-2 rounded-lg text-xs font-bold border transition-all ${filters.selectedWeekday === null
                            ? 'bg-accent border-accent text-[#0f172a]'
                            : 'bg-white/5 border-white/10 text-secondary'
                            }`}
                    >
                        TODOS
                    </button>
                    {[1, 2, 3, 4, 5, 6, 0].map(d => (
                        <button
                            key={d}
                            onClick={() => onWeekdayChange(d)}
                            title={FULL_WEEKDAYS[d]}
                            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold border transition-all ${filters.selectedWeekday === d
                                ? 'bg-accent border-accent text-[#0f172a]'
                                : 'bg-white/5 border-white/10 text-secondary hover:border-accent'
                                }`}
                        >
                            {WEEKDAYS[d]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
