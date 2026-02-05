import { useState } from 'react';

interface CratesFormState {
    quantity: string;
    price: string;
    selectedProvider: string;
    customProvider: string;
}

export function useCratesForm() {
    const [form, setForm] = useState<CratesFormState>({
        quantity: '',
        price: '',
        selectedProvider: '',
        customProvider: ''
    });

    const setQuantity = (value: string) => {
        setForm(prev => ({ ...prev, quantity: value }));
    };

    const setPrice = (value: string) => {
        setForm(prev => ({ ...prev, price: value }));
    };

    const setSelectedProvider = (value: string) => {
        setForm(prev => ({ ...prev, selectedProvider: value }));
    };

    const setCustomProvider = (value: string) => {
        setForm(prev => ({ ...prev, customProvider: value }));
    };

    const reset = () => {
        setForm({
            quantity: '',
            price: '',
            selectedProvider: '',
            customProvider: ''
        });
    };

    return {
        form,
        setQuantity,
        setPrice,
        setSelectedProvider,
        setCustomProvider,
        reset
    };
}
