'use client';

import { useState, useEffect } from 'react';
import { now, formatTime } from '@/utils/dateUtils';

export const Clock = () => {
    const [currentTime, setCurrentTime] = useState(now());

    useEffect(() => {
        // Hydration fix: only set time after mount to avoid mismatch
        setCurrentTime(now());
        const timer = setInterval(() => setCurrentTime(now()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-right" style={{ minWidth: '120px' }}>
            <div className="text-2xl font-mono" style={{ color: 'var(--brand-peach)', fontWeight: 600 }} suppressHydrationWarning>
                {formatTime(currentTime, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-secondary uppercase tracking-tighter">Hora actual</div>
        </div>
    );
};
