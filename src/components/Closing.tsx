import { useState } from 'react';
import Link from 'next/link';
import type { CashRegisterRecord } from '@/types';
import { BillCounter } from './BillCounter';

interface Props {
    data: CashRegisterRecord;
    updateArqueo: (field: 'realCash' | 'realDigital', value: number | "") => void;
    cerrarCaja: (shouldDownload: boolean, notes?: string) => Promise<{ success: boolean; url?: string; error?: string }>;
    isClosing: boolean;
    totals: {
        totalTeorico: number;
        totalReal: number;
        diferencia: number;
    };
}

export const Closing: React.FC<Props> = ({ data, updateArqueo, cerrarCaja, isClosing, totals }) => {
    const { totalTeorico, totalReal, diferencia } = totals;

    // Estados para los modales
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [shouldDownloadExcel, setShouldDownloadExcel] = useState(true);
    const [notas, setNotas] = useState('');
    const [successUrl, setSuccessUrl] = useState<string | undefined>();

    // Estados para el contador de billetes
    const [showCounter, setShowCounter] = useState(false);

    const getStatusColor = () => {
        if (diferencia === 0) return 'var(--success-color)';
        if (diferencia < 0) return 'var(--error-color)';
        return 'var(--accent-color)';
    };

    const getStatusLabel = () => {
        if (diferencia === 0) return 'PERFECTO (Sin diferencias)';
        if (diferencia < 0) return `FALTANTE ($${Math.abs(diferencia).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
        return `SOBRANTE ($${diferencia.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    };

    // Estados locales para los inputs (para que permitan escribir libremente)
    const [inputEfectivo, setInputEfectivo] = useState(data.audit.realCash !== '' ? data.audit.realCash.toString() : '');
    const [inputDigital, setInputDigital] = useState(data.audit.realDigital !== '' ? data.audit.realDigital.toString() : '');

    const handleConfirmClose = async () => {
        const res = await cerrarCaja(shouldDownloadExcel, notas);
        if (res.success) {
            setSuccessUrl(res.url);
            setShowConfirmModal(false);
            setShowSuccessModal(true);
        } else {
            alert('Error al cerrar caja: ' + res.error);
        }
    };

    const handleEfectivoChange = (val: string) => {
        setInputEfectivo(val);
        updateArqueo('realCash', val === '' ? '' : parseFloat(val));
    };

    const handleDigitalChange = (val: string) => {
        setInputDigital(val);
        updateArqueo('realDigital', val === '' ? '' : parseFloat(val));
    };

    const handleCounterConfirm = (total: number) => {
        const totalStr = total.toFixed(2);
        setInputEfectivo(totalStr);
        updateArqueo('realCash', total);
        setShowCounter(false);
    };

    const formatOnBlur = (field: 'efectivo' | 'digital') => {
        if (field === 'efectivo') {
            const num = parseFloat(inputEfectivo);
            if (!isNaN(num)) setInputEfectivo(num.toFixed(2));
        } else {
            const num = parseFloat(inputDigital);
            if (!isNaN(num)) setInputDigital(num.toFixed(2));
        }
    };

    return (
        <div className="glass-panel w-full flex-col gap-4">
            <h2 className="section-title">🔒 Arqueo de Caja</h2>

            <div className="flex-row justify-between glass-panel bg-opacity-10 py-3">
                <div className="flex-col">
                    <span className="text-secondary text-sm">Teórico</span>
                    <span className="text-lg font-bold">${totalTeorico.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex-col text-right">
                    <span className="text-secondary text-sm">Real</span>
                    <span className="text-lg font-bold">${totalReal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div className="flex-row gap-4">
                <div className="flex-col w-full">
                    <div className="flex-row justify-between items-center mb-1">
                        <label className="text-xs text-secondary">Efectivo Real en Caja</label>
                        <button
                            onClick={() => setShowCounter(true)}
                            className="text-[10px] uppercase font-bold text-accent hover:opacity-80 transition-opacity bg-white bg-opacity-5 px-2 py-1 rounded border border-white border-opacity-10"
                        >
                            🔢 Contar Billetes
                        </button>
                    </div>
                    <div className="input-group">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            step="0.01"
                            className="input-field"
                            value={inputEfectivo}
                            onChange={e => handleEfectivoChange(e.target.value)}
                            onBlur={() => formatOnBlur('efectivo')}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="flex-col w-full">
                    <label className="text-xs text-secondary mb-1">Caja Digital Real (MP/Transf)</label>
                    <div className="input-group">
                        <span className="input-prefix">$</span>
                        <input
                            type="number"
                            step="0.01"
                            className="input-field"
                            value={inputDigital}
                            onChange={e => handleDigitalChange(e.target.value)}
                            onBlur={() => formatOnBlur('digital')}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            <div
                className="glass-panel text-center font-bold transition-all mx-auto"
                style={{
                    background: getStatusColor(),
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    padding: '0.5rem 1rem',
                    width: 'fit-content',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem'
                }}
            >
                {getStatusLabel()}
            </div>

            <div className="mt-2">
                <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isClosing || data.audit.realCash === "" || data.audit.realDigital === ""}
                    className="btn w-full"
                    style={{
                        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                        fontSize: '1rem',
                        padding: '0.75rem',
                        opacity: (isClosing || data.audit.realCash === "" || data.audit.realDigital === "") ? 0.6 : 1
                    }}
                >
                    {isClosing ? 'Guardando...' : '🔒 CERRAR DÍA Y GUARDAR'}
                </button>

                {(data.audit.realCash === "" || data.audit.realDigital === "") && (
                    <p className="text-xs text-secondary text-center mt-3 italic">
                        Ingresá los recuentos reales para cerrar
                    </p>
                )}
            </div>

            {/* Modal de Confirmación */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => !isClosing && setShowConfirmModal(false)}>
                    <div className="glass-panel modal-content max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="section-title">📊 Resumen de Cierre</h3>
                        <p className="text-secondary text-sm mb-4">¿Estás segura de cerrar la caja con estos valores?</p>

                        <div className="flex-col gap-2 mb-6">
                            <div className="flex-row justify-between">
                                <span className="text-secondary">Efectivo Real:</span>
                                <span className="font-bold">${Number(data.audit.realCash).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex-row justify-between">
                                <span className="text-secondary">Caja Digital Real:</span>
                                <span className="font-bold">${Number(data.audit.realDigital).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex-row justify-between pt-2 border-t border-white border-opacity-10">
                                <span className="text-secondary">Diferencia Total:</span>
                                <span className="font-bold" style={{ color: getStatusColor() }}>
                                    ${diferencia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex-row items-center gap-2 mb-6 cursor-pointer" onClick={() => setShouldDownloadExcel(!shouldDownloadExcel)}>
                            <input
                                type="checkbox"
                                checked={shouldDownloadExcel}
                                onChange={() => { }} // Manejado por el div
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span className="text-sm">Descargar Excel en esta computadora</span>
                        </div>

                        <div className="flex-col gap-1 mb-6">
                            <label className="text-xs text-secondary italic">Notas u Observaciones (Opcional):</label>
                            <textarea
                                className="input-field w-full text-sm"
                                placeholder="Ej: Día lluvioso, retiro extra de caja..."
                                value={notas}
                                onChange={e => setNotas(e.target.value)}
                                style={{ minHeight: '60px', borderRadius: '0.5rem', padding: '0.5rem' }}
                            />
                        </div>

                        <div className="flex-row gap-3">
                            <button
                                onClick={handleConfirmClose}
                                disabled={isClosing}
                                className="btn flex-1"
                            >
                                {isClosing ? 'PROCESANDO...' : 'SÍ, CERRAR DÍA'}
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isClosing}
                                className="btn-secondary flex-1"
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Contador (Ahora Externo) */}
            <BillCounter
                isOpen={showCounter}
                onClose={() => setShowCounter(false)}
                onConfirm={handleCounterConfirm}
            />

            {/* Modal de Éxito */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content max-w-sm text-center">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h3 className="brand-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Día Cerrado</h3>
                        <p className="text-secondary text-sm mb-8">El arqueo se guardó correctamente en la base de datos y se subió a la nube.</p>

                        <div className="flex-col gap-3">
                            {successUrl && (
                                <Link href={successUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
                                    📥 Ver Reporte en Nube
                                </Link>
                            )}
                            <button onClick={() => setShowSuccessModal(false)} className="btn w-full">
                                ENTENDIDO
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
