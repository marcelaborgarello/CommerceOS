import { storeConfig } from '@/config/storeConfig';
import type { SaleType } from '@/types';

// Define shared interface if not importing from Types
interface TicketItem {
    id: string;
    productId: string;
    name: string;
    unit: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

interface TicketReceiptProps {
    items: TicketItem[];
    customerInfo: {
        name: string;
        address: string;
        phone: string;
    };
    organization?: {
        name: string;
        type: string;
        address?: string;
        phone?: string;
    };
    total: number;
    onRemoveItem: (id: string) => void;
    // New Props
    saleType?: SaleType;
    saleNumber?: number;
    subtotal?: number;
    discount?: number;
    surcharge?: number;
}

export function TicketReceipt({ items, customerInfo, organization, total, onRemoveItem, saleType = 'TICKET', saleNumber, subtotal = 0, discount = 0, surcharge = 0 }: TicketReceiptProps) {
    const isPresupuesto = saleType === 'PRESUPUESTO';

    return (
        <div className="print-container bg-white text-black w-[105mm] h-[140mm] p-2 flex flex-col justify-between relative print:shadow-none print:m-0 overflow-hidden cursor-default leading-none">

            {/* TOP SECTION: Content */}
            <div className="w-full">

                {/* HEADER SECTION */}
                <table className="w-full mb-1 border-b border-black border-dashed pb-1">
                    <tbody>
                        <tr>
                            {/* Left Column: Business Info */}
                            <td className="w-[50%] align-top text-left pr-1 overflow-hidden">
                                <div className="font-roboto tracking-tight leading-none mb-[1px] whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 900 }}>
                                    {(organization?.name || storeConfig.name).toUpperCase()}
                                </div>
                                <div className="font-roboto uppercase tracking-widest leading-none mb-[2px] whitespace-nowrap" style={{ fontSize: '5px', fontWeight: 400 }}>
                                    {organization?.type || storeConfig.type}
                                </div>
                                <div className="flex flex-col font-bold text-black leading-none" style={{ fontSize: '6px' }}>
                                    <span>{(organization?.address || "CABRERA 1622").toUpperCase()}</span>
                                    <span>{(organization?.phone || "(0358) 156 002163")}</span>
                                </div>
                            </td>
                            {/* Right Column: Doc Type & Customer */}
                            <td className="w-[50%] align-top text-right">
                                {/* DOCUMENT TYPE & NUMBER */}
                                <div className="mb-1 border-b border-black/50 pb-1">
                                    <div className="font-black text-[10px] uppercase">
                                        {isPresupuesto ? 'PRESUPUESTO' : 'TICKET'}
                                    </div>
                                    <div className="font-mono text-[10px] font-bold">
                                        Nº {saleNumber ? saleNumber.toString().padStart(8, '0') : '--------'}
                                    </div>
                                </div>

                                {/* Customer Compact */}
                                <div className="w-full text-left pl-2 leading-tight" style={{ fontSize: '5px' }}>
                                    <div className="mb-[1px]">
                                        <span className="font-bold mr-1">CLI:</span>
                                        <span className="uppercase font-normal break-words">{customerInfo.name || 'CONSUMIDOR FINAL'}</span>
                                    </div>
                                    {customerInfo.address && (
                                        <div className="mb-[1px]">
                                            <span className="font-bold mr-1">DIR:</span>
                                            <span className="uppercase font-normal">{customerInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* LEGAL & DATE */}
                <div className="flex flex-col items-center justify-center border-b border-dashed border-black pb-1 mb-2 w-full">
                    <span
                        className="text-[6px] uppercase tracking-widest mb-1"
                        style={{ color: '#9ca3af !important', fontWeight: 'normal', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                    >
                        {isPresupuesto ? 'DOCUMENTO NO VÁLIDO COMO FACTURA' : 'No válido como factura'}
                    </span>
                    <div className="flex flex-row justify-between w-full text-[9px] font-bold">
                        <span>Fecha: {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        <span>Hora: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <table className="w-full border-collapse mb-1" style={{ fontSize: '9px' }}>
                    <thead>
                        <tr className="font-bold uppercase text-[8px] border-b border-black">
                            <th className="w-[15%] py-1 text-left">CANT.</th>
                            <th className="w-[10%] py-1 text-center">UN.</th>
                            <th className="w-[45%] py-1 text-left">DESCRIPCIÓN</th>
                            <th className="w-[15%] py-1 text-right">P.UNIT</th>
                            <th className="w-[15%] py-1 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-400 italic">- Sin items -</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id} className="relative group font-bold">
                                <td className="py-0.5 text-left relative font-mono text-[10px]">
                                    {item.quantity.toFixed(3)}
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="print-hidden absolute -left-4 top-0 text-red-500 font-bold px-1 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </td>
                                <td className="py-0.5 text-center font-mono text-[8px]">{item.unit.substring(0, 4).toUpperCase()}</td>
                                <td className="py-0.5 text-left font-semibold uppercase font-condensed tracking-tight leading-none">
                                    {item.name}
                                </td>
                                <td className="py-0.5 text-right font-mono">${Math.round(item.unitPrice).toLocaleString('es-AR')}</td>
                                <td className="py-0.5 text-right font-black font-mono text-[10px]">${Math.round(item.subtotal).toLocaleString('es-AR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* FOOTER SECTION */}
            <div className="w-full mt-auto">
                <div className="border-t border-black border-dashed my-1 w-full"></div>
                <table className="w-full mb-2">
                    <tbody>
                        {(discount > 0 || surcharge > 0) && (
                            <>
                                <tr>
                                    <td className="text-right align-bottom pr-8">
                                        <span className="font-roboto font-bold text-[8px]">SUBTOTAL</span>
                                    </td>
                                    <td className="text-right align-bottom w-auto">
                                        <span className="font-mono text-[10px]">${Math.round(subtotal).toLocaleString('es-AR')}</span>
                                    </td>
                                </tr>
                                {discount > 0 && (
                                    <tr>
                                        <td className="text-right align-bottom pr-8">
                                            <span className="font-roboto font-bold text-[8px]">DESCUENTO</span>
                                        </td>
                                        <td className="text-right align-bottom w-auto">
                                            <span className="font-mono text-[10px] text-black">-${Math.round(discount).toLocaleString('es-AR')}</span>
                                        </td>
                                    </tr>
                                )}
                                {surcharge > 0 && (
                                    <tr>
                                        <td className="text-right align-bottom pr-8">
                                            <span className="font-roboto font-bold text-[8px]">RECARGO</span>
                                        </td>
                                        <td className="text-right align-bottom w-auto">
                                            <span className="font-mono text-[10px] text-black">+${Math.round(surcharge).toLocaleString('es-AR')}</span>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )}
                        <tr>
                            <td className="text-right align-bottom pr-8">
                                <span className="font-roboto font-bold text-lg">TOTAL</span>
                            </td>
                            <td className="text-right align-bottom w-auto">
                                <span className="font-mono font-black text-3xl tracking-tighter leading-none">${Math.round(total).toLocaleString('es-AR')}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* FINAL MESSAGE - Strict Conditional */}
                {
                    isPresupuesto ? (
                        <div className="text-center font-roboto border-t border-dashed border-black pt-1" style={{ fontSize: '5px', fontWeight: 700 }}>
                            VALIDEZ DEL PRESUPUESTO: 7 DÍAS
                        </div>
                    ) : (
                        <div className="text-center font-roboto border-t border-dashed border-black pt-1" style={{ fontSize: '5px', fontWeight: 700 }}>
                            ¡MUCHAS GRACIAS POR SU COMPRA!
                        </div>
                    )
                }
            </div >
        </div >
    );
}
