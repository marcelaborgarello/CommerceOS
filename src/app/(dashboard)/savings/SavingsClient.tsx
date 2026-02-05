'use client';

import { useState, useEffect } from 'react';
import { getReservaBalance, addReservaTransaction } from '@/actions/savingsActions';
import { getProviders } from '@/actions/cashActions';
import { Toast } from '@/components/Toast';
import type { Organization, Provider } from '@/types';

interface SavingsClientProps {
    organization: Pick<Organization, 'name' | 'type' | 'logoUrl'> & { userEmail?: string };
    initialCashBalance?: number;
    initialBankBalance?: number;
    initialProviders?: Provider[];
}

export function SavingsClient({
    organization,
    initialCashBalance = 0,
    initialBankBalance = 0,
    initialProviders = []
}: SavingsClientProps) {
    // "activeTab" can be null for Dashboard View
    const [activeTab, setActiveTab] = useState<'CASH' | 'BANK' | null>(null);
    const [moneyMode, setMoneyMode] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

    // Balanced States - initialized with server data
    const [cashBalance, setCashBalance] = useState(initialCashBalance);
    const [bankBalance, setBankBalance] = useState(initialBankBalance);

    // Data & Lists
    const [providers, setProviders] = useState<Provider[]>(initialProviders);

    // Forms
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        // Reset forms when switching/closing
        setMoneyMode('DEPOSIT');
        setAmount('');
        setDescription('');
    }, [activeTab]);

    const loadBalances = async () => {
        const [resCash, resBank] = await Promise.all([
            getReservaBalance('CASH'),
            getReservaBalance('BANK')
        ]);

        if (resCash.success) setCashBalance(resCash.balance || 0);
        if (resBank.success) setBankBalance(resBank.balance || 0);
    };

    const handleTabClick = (tab: 'CASH' | 'BANK') => {
        if (activeTab === tab) {
            setActiveTab(null); // Deselect if clicking same
        } else {
            setActiveTab(tab);
        }
    };

    // --- MONEY LOGIC ---
    const handleMoneySubmit = async () => {
        setIsSubmitting(true);
        const valAmount = parseFloat(amount);
        if (!valAmount || valAmount <= 0) {
            setToast({ message: 'Monto inválido', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        const type = moneyMode === 'DEPOSIT' ? 'INCOME' : 'WITHDRAWAL';
        const desc = moneyMode === 'DEPOSIT' ? (description || 'Aporte Manual') : 'Retiro de Fondos';
        const reserveType = activeTab === 'CASH' ? 'CASH' : 'BANK';

        const res = await addReservaTransaction({
            amount: valAmount,
            description: desc,
            type,
            reserveType
        });

        if (res.success) {
            setToast({ message: '¡Guardado!', type: 'success' });
            setAmount('');
            setDescription('');
            loadBalances();
        } else {
            setToast({ message: res.message || 'Error', type: 'error' });
        }
        setIsSubmitting(false);
    };

    const handleWithdrawAllMoney = () => {
        if (activeTab === 'CASH') setAmount(cashBalance.toString());
        if (activeTab === 'BANK') setAmount(bankBalance.toString());
    };

    const getTotalPatrimony = () => cashBalance + bankBalance;

    return (
        <div className="min-h-screen pb-20 text-white" onClick={() => {/* Optional */ }}>
            <div className="w-full px-2 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 border-b border-white/10 pb-4 mt-8">
                        <h1 className="text-3xl font-bold text-white mb-1">Centro Financiero</h1>
                        <p className="text-gray-400 text-sm">Reservas y Ahorros</p>
                    </div>
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                    <main className="flex flex-col gap-6">

                        {/* TOTAL CONSOLIDADO BIG BANNER */}
                        <div className="glass-panel mb-8 flex flex-col items-center justify-center py-12 border-b-4 border-green-500 relative overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(to bottom, #0f172a, #020617)' }}>
                            <div className="absolute inset-0 bg-green-500/20 blur-3xl"></div>
                            <span className="text-white/70 uppercase tracking-[0.3em] text-sm mb-4 z-10 font-bold">Patrimonio Total en Reservas</span>
                            <span className="text-6xl md:text-8xl font-black text-white z-10 drop-shadow-[0_0_50px_rgba(74,222,128,0.6)]">
                                ${getTotalPatrimony().toLocaleString('es-AR')}
                            </span>
                        </div>

                        {/* 1. CARDS NAVEGACIÓN (RESPONSIVE GRID) */}
                        <div className={`grid gap-4 transition-all duration-300 ${activeTab ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>

                            {/* CARD EFECTIVO */}
                            <button
                                onClick={() => handleTabClick('CASH')}
                                className={`relative p-6 text-left rounded-xl border-4 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden 
                            ${activeTab === 'CASH' ? 'border-green-500 bg-gray-900 shadow-[0_0_30px_rgba(74,222,128,0.2)]' : (activeTab ? 'opacity-40 scale-95 border-transparent bg-white/5' : 'border-transparent bg-white/5 hover:bg-white/10 opacity-100')}
                        `}
                            >
                                <div className="text-3xl mb-1">💵</div>
                                <div className="text-xs font-bold uppercase text-gray-400">Caja Fuerte</div>
                                <div className={`font-black tracking-tighter ${activeTab === 'CASH' ? 'text-5xl text-green-400' : 'text-3xl text-gray-300'}`}>
                                    ${cashBalance.toLocaleString('es-AR')}
                                </div>
                            </button>

                            {/* CARD BANCO */}
                            <button
                                onClick={() => handleTabClick('BANK')}
                                className={`relative p-6 text-left rounded-xl border-4 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden 
                            ${activeTab === 'BANK' ? 'border-blue-500 bg-gray-900 shadow-[0_0_30px_rgba(96,165,250,0.2)]' : (activeTab ? 'opacity-40 scale-95 border-transparent bg-white/5' : 'border-transparent bg-white/5 hover:bg-white/10 opacity-100')}
                        `}
                            >
                                <div className="text-3xl mb-1">🏦</div>
                                <div className="text-xs font-bold uppercase text-gray-400">Banco / Digital</div>
                                <div className={`font-black tracking-tighter ${activeTab === 'BANK' ? 'text-5xl text-blue-400' : 'text-3xl text-gray-300'}`}>
                                    ${bankBalance.toLocaleString('es-AR')}
                                </div>
                            </button>
                        </div>

                        {/* 2. AREA DE TRABAJO (ONLY VISIBLE IF TAB SELECTED) */}
                        {activeTab && (
                            <div className="glass-panel p-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 relative">

                                {/* CLOSE BUTTON FOR DESKTOP CONVENIENCE */}
                                <button
                                    onClick={() => setActiveTab(null)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                >
                                    ✕ Cerrar
                                </button>

                                {/* -- EFECTIVO / BANCO -- */}
                                {(activeTab === 'CASH' || activeTab === 'BANK') && (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex p-1 bg-black/40 rounded-xl">
                                            <button
                                                onClick={() => setMoneyMode('DEPOSIT')}
                                                className={`flex-1 py-4 text-base font-black uppercase tracking-wider rounded-lg transition-all ${moneyMode === 'DEPOSIT' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                📥 Guardar
                                            </button>
                                            <button
                                                onClick={() => setMoneyMode('WITHDRAW')}
                                                className={`flex-1 py-4 text-base font-black uppercase tracking-wider rounded-lg transition-all ${moneyMode === 'WITHDRAW' ? 'bg-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                📤 Retirar
                                            </button>
                                        </div>

                                        {moneyMode === 'DEPOSIT' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                                                <div className="space-y-1">
                                                    <label className="text-xs uppercase font-bold text-gray-400 ml-1">Descripción</label>
                                                    <input
                                                        className="input-field h-12"
                                                        placeholder="Ahorro..."
                                                        value={description}
                                                        onChange={e => setDescription(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs uppercase font-bold text-gray-400 ml-1">Monto a Guardar</label>
                                                    <div className="flex">
                                                        <span className="bg-white/5 border border-white/10 px-6 flex items-center justify-center rounded-l-xl font-black text-green-500 text-xl w-16">$</span>
                                                        <input
                                                            type="number"
                                                            className="input-field rounded-l-none text-3xl font-black text-white h-16"
                                                            placeholder="0"
                                                            value={amount}
                                                            autoFocus
                                                            onChange={e => setAmount(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleMoneySubmit}
                                                    disabled={isSubmitting || !amount}
                                                    className="btn bg-green-500 hover:bg-green-400 text-black w-full h-16 text-xl font-black uppercase tracking-wider shadow-[0_0_20px_rgba(74,222,128,0.2)] mt-2 rounded-xl"
                                                >
                                                    CONFIRMAR GUARDADO
                                                </button>
                                            </div>
                                        )}

                                        {moneyMode === 'WITHDRAW' && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 py-4">
                                                <div className="space-y-2 text-center">
                                                    <label className="text-sm uppercase font-bold text-gray-400">¿Cuánto querés retirar?</label>
                                                    <div className="flex justify-center">
                                                        <div className="relative w-full max-w-xs">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red font-black text-2xl">$</span>
                                                            <input
                                                                type="number"
                                                                className="input-field text-center text-5xl font-black text-white pl-8 h-20 rounded-2xl border-white/20 focus:border-red"
                                                                placeholder="0"
                                                                value={amount}
                                                                autoFocus
                                                                onChange={e => setAmount(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleWithdrawAllMoney}
                                                        className="inline-block text-xs text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-wider border-b border-yellow-500/30 pb-0.5 mt-2"
                                                    >
                                                        RETIRO TOTAL (${(activeTab === 'CASH' ? cashBalance : bankBalance).toLocaleString()})
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleMoneySubmit}
                                                    disabled={isSubmitting || !amount}
                                                    className="btn bg-red text-white hover:bg-red/90 w-full h-16 text-xl font-black uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] rounded-xl"
                                                >
                                                    CONFIRMAR RETIRO
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
