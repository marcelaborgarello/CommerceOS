export const TIMEZONE = 'America/Argentina/Cordoba';
export const LOCALE = 'es-AR';

/**
 * Returns the current date object.
 * Useful for mocking in tests or enforcing timezone consistency later.
 */
export const now = (): Date => new Date();

/**
 * Returns the current date formatted as YYYY-MM-DD (ISO 8601 partial).
 * Uses the Argentina/Cordoba timezone.
 */
export const getArgentinaDateKey = (): string => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(now());
};

/**
 * Formats a date for display (e.g., "DD/MM/YYYY").
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(LOCALE, options);
};

/**
 * Formats a time for display (e.g., "HH:mm").
 */
export const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(LOCALE, options || { hour: '2-digit', minute: '2-digit' });
};

/**
 * Returns the formatted currency string.
 */
export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Returns the start of the current month.
 */
export const getStartOfMonth = (): Date => {
    const d = now();
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Returns the end of the current month.
 */
export const getEndOfMonth = (): Date => {
    const d = now();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
};

/**
 * Calcula la diferencia en días entre una fecha y hoy.
 * Retorna negativo si ya pasó, 0 si es hoy, positivo si falta.
 * ACEPTA string O Date.
 */
export const getDaysFromNow = (dateInput: string | Date): number => {
    // Si es string lo convertimos, si es Date lo usamos directo
    const target = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
    target.setHours(0, 0, 0, 0);

    const today = now();
    today.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}