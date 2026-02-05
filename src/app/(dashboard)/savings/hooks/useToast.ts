import { useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    };

    const showSuccess = (message: string) => {
        setToast({ message, type: 'success' });
    };

    const showError = (message: string) => {
        setToast({ message, type: 'error' });
    };

    const hideToast = () => {
        setToast(null);
    };

    return {
        toast,
        showToast,
        showSuccess,
        showError,
        hideToast
    };
}
