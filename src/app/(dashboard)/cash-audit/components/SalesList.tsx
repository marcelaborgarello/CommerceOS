import type { Sale } from '@/types/index';
import { SalesRow } from './SalesRow';

interface Props {
    ventas: Sale[];
    totalVentas: number;
    readOnly?: boolean;
}

export const SalesList = ({ ventas, totalVentas, readOnly = false }: Props) => {
    return (
        <div className="glass-panel w-full h-[600px] overflow-y-auto p-4 bg-black/20">
            <div className="mb-4 flex flex-row justify-between items-center w-full">
                <h3 className="section-title text-sm" style={{ marginBottom: 0 }}>Total Ventas: <span className="text-green text-xl">${totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></h3>
                <span className="text-secondary text-sm">Cant: <span className="font-bold text-accent-color">{ventas.length}</span></span>
            </div>

            <h4 className="text-secondary text-sm mb-2">Últimas ventas</h4>
            {ventas.length === 0 ? (
                <p className="text-secondary text-sm text-center">No hay ventas registradas hoy</p>
            ) : (
                <div className="flex-col">
                    {ventas.map((v) => (
                        <SalesRow key={v.id} venta={v} readOnly={readOnly} />
                    ))}
                </div>
            )}
        </div>
    );
};
