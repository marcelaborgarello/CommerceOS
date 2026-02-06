'use client';

import { useState, useMemo } from 'react';

const DENOMINACIONES = [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (total: number) => void;
}

export const BillCounter: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
    const [counts, setCounts] = useState<{ [key: number]: number }>(
        DENOMINACIONES.reduce((acc, den) => ({ ...acc, [den]: 0 }), {})
    );

    const totalContado = useMemo(() => {
        return Object.entries(counts).reduce((sum, [den, count]) => sum + (Number(den) * count), 0);
    }, [counts]);

    const handleCountChange = (den: number, count: string) => {
        const n = parseInt(count) || 0;
        setCounts(prev => ({ ...prev, [den]: n }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-panel modal-content max-w-md" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex-row justify-between items-center mb-6 border-b border-white border-opacity-10 pb-4">
                    <h3 className="section-title" style={{ marginBottom: 0 }}>🔢 Contador de Billetes</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Grid de Billetes */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                    {DENOMINACIONES.map(den => (
                        <div key={den} className="flex-row items-center justify-between bg-white bg-opacity-5 p-2 rounded-lg border border-white border-opacity-0 hover:border-opacity-10 transition-all">
                            <div className="flex-col">
                                <span className="font-bold text-sm text-secondary">${den.toLocaleString()}</span>
                                {(counts[den] || 0) > 0 && (
                                    <span className="text-[10px] text-green font-mono">
                                        = ${(counts[den] || 0 * den).toLocaleString('es-AR')}
                                    </span>
                                )}
                            </div>
                            <div className="flex-row items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="input-field text-center font-bold"
                                    style={{
                                        padding: '0.25rem',
                                        width: '50px',
                                        height: '32px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: counts[den]! > 0 ? '1px solid var(--accent-color)' : '1px solid transparent'
                                    }}
                                    value={counts[den] || ''}
                                    onChange={e => handleCountChange(den, e.target.value)}
                                    onClick={e => (e.target as HTMLInputElement).select()}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total y Acciones */}
                <div className="glass-panel bg-black bg-opacity-30 mb-6 p-4 flex-row justify-between items-center border border-white border-opacity-5">
                    <span className="text-sm text-secondary uppercase tracking-widest">Total Calculado</span>
                    <span className="text-2xl font-bold text-green font-mono">
                        ${totalContado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="flex-row gap-3">
                    <button
                        onClick={() => {
                            setCounts(DENOMINACIONES.reduce((acc, den) => ({ ...acc, [den]: 0 }), {}));
                        }}
                        className="btn-secondary flex-1 text-xs"
                    >
                        🗑️ LIMPIAR TODO
                    </button>
                    <button
                        onClick={() => onConfirm(totalContado)}
                        className="btn flex-1"
                        style={{ background: 'var(--success-color)' }}
                    >
                        ✅ CONFIRMAR TOTAL
                    </button>
                </div>
            </div>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1rem;
                }
                .modal-content {
                    width: 100%;
                    animation: modalIn 0.3s ease-out;
                }
                @keyframes modalIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
