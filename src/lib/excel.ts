import * as XLSX from 'xlsx';
import type { CashRegisterRecord } from '@/types';
import { PAYMENT_METHODS } from '@/types';

export const generateArqueoExcel = (data: CashRegisterRecord, totalVentas: number, diferencia: number): Buffer => {
    const wb = XLSX.utils.book_new();

    // --- HOJA 1: RESUMEN ---
    const resumenData = [
        ['REPORTE DE CIERRE DE CAJA'],
        ['Fecha:', data.date],
        ['Generado:', new Date().toLocaleString()],
        [''],
        ['RESUMEN FINANCIERO', ''],
        ['Total Ventas Brutas', totalVentas],
        ['Total Ventas Netas', totalVentas - (data.expenses.commissions || 0)],
        [''],
        ['INGRESOS', ''],
        ['Inicio Efectivo', data.income.startCash],
        ['Inicio Digital', data.income.startDigital],
        ['Otros Ingresos', data.income.others.reduce((acc, i) => acc + i.amount, 0)],
        ['Total Ingresos', (data.income.startCash + data.income.startDigital + data.income.others.reduce((acc, i) => acc + i.amount, 0))],
        [''],
        ['EGRESOS', ''],
        ['Gastos Operativos', data.expenses.others.reduce((acc, e) => acc + e.amount, 0)],
        ['Comisiones', data.expenses.commissions],
        ['Total Egresos', (data.expenses.others.reduce((acc, e) => acc + e.amount, 0) + data.expenses.commissions)],
        [''],
        ['ARQUEO', ''],
        ['Efectivo Real', Number(data.audit.realCash) || 0],
        ['Digital Real', Number(data.audit.realDigital) || 0],
        ['Total Real', (Number(data.audit.realCash) || 0) + (Number(data.audit.realDigital) || 0)],
        [''],
        ['RESULTADO', ''],
        ['Diferencia', diferencia],
        ['Estado', diferencia === 0 ? 'OK' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE'],
        [''],
        ['OBSERVACIONES'],
        [data.audit.notes || 'Ninguna']
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // --- HOJA 2: VENTAS ---
    const ventasRows = [
        ['ID', 'Hora', 'Monto', 'Medio de Pago', 'Comisión', 'Descripción', 'Es Crédito'],
        ...data.sales.map(v => [
            v.id,
            v.time,
            v.amount,
            PAYMENT_METHODS.find(m => m.value === v.paymentMethod)?.label || v.paymentMethod,
            v.commission || 0,
            v.description || '',
            v.isCredit ? 'Sí' : 'No'
        ])
    ];
    const wsVentas = XLSX.utils.aoa_to_sheet(ventasRows);
    XLSX.utils.book_append_sheet(wb, wsVentas, "Detalle Ventas");

    // --- HOJA 3: OTROS MOVIMIENTOS ---
    const movsRows = [
        ['TIPO', 'Descripción', 'Monto', 'Categoría', 'Proveedor'],
        ...data.income.others.map(i => ['INGRESO', i.description, i.amount, '-', '-']),
        ...data.expenses.others.map(e => ['GASTO', e.description, -e.amount, e.category, e.providerName || '-'])
    ];
    const wsMovs = XLSX.utils.aoa_to_sheet(movsRows);
    XLSX.utils.book_append_sheet(wb, wsMovs, "Otros Movimientos");

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
