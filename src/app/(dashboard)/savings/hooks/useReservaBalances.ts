import { useState } from 'react';

interface BalanceState {
    cash: number;
    bank: number;
    crates: { quantity: number; amount: number };
}

export function useReservaBalances(
    initialCash: number,
    initialBank: number,
    initialCrates: { quantity: number; amount: number }
) {
    const [balances, setBalances] = useState<BalanceState>({
        cash: initialCash,
        bank: initialBank,
        crates: initialCrates
    });

    const updateCash = (value: number) => {
        setBalances(prev => ({ ...prev, cash: value }));
    };

    const updateBank = (value: number) => {
        setBalances(prev => ({ ...prev, bank: value }));
    };

    const updateCrates = (value: { quantity: number; amount: number }) => {
        setBalances(prev => ({ ...prev, crates: value }));
    };

    const updateAll = (cash: number, bank: number, crates: { quantity: number; amount: number }) => {
        setBalances({ cash, bank, crates });
    };

    return {
        balances,
        updateCash,
        updateBank,
        updateCrates,
        updateAll
    };
}
