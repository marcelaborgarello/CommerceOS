import { useState } from 'react';

interface MoneyFormState {
    amount: string;
    description: string;
}

export function useMoneyForm() {
    const [form, setForm] = useState<MoneyFormState>({
        amount: '',
        description: ''
    });

    const setAmount = (value: string) => {
        setForm(prev => ({ ...prev, amount: value }));
    };

    const setDescription = (value: string) => {
        setForm(prev => ({ ...prev, description: value }));
    };

    const reset = () => {
        setForm({ amount: '', description: '' });
    };

    return {
        form,
        setAmount,
        setDescription,
        reset
    };
}
