'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'var(--success-color)',
        error: 'var(--error-color)',
        info: 'var(--accent-color)'
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--card-bg)',
            borderLeft: `4px solid ${bgColors[type]}`,
            color: 'var(--text-primary)',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease-in-out',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)'
        }}>
            <span style={{ fontSize: '1.2rem' }}>{icons[type]}</span>
            <span style={{ fontWeight: 500 }}>{message}</span>
            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    marginLeft: '0.5rem'
                }}
            >
                ×
            </button>
        </div>
    );
};
