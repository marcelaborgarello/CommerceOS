'use server';

import prisma from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import type { CashRegisterRecord } from '@/types';


// 1. SAVE ARQUEO
export async function saveArqueo(data: CashRegisterRecord, totalSales: number, difference: number, reportUrl?: string, notes?: string, organizationId?: string) {

    try {
        const audit = await prisma.cashAudit.create({
            data: {
                date: data.date,
                data: data as any,
                totalSales: totalSales,
                difference: difference,
                reportUrl,
                notes: notes,
                organizationId
            },
        });

        return { success: true, id: audit.id };
    } catch (error) {
        console.error('[DB] Error al guardar arqueo:', error);
        return { success: false, error: 'No se pudo guardar en la base de datos' };
    }
}

export async function uploadReport(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No se recibió ningún archivo');

        const fileName = file.name;

        const buffer = Buffer.from(await file.arrayBuffer());
        const supabase = await createClient();

        const { error } = await supabase.storage
            .from('arqueos')
            .upload(fileName, buffer, {
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                upsert: true
            });

        if (error) {
            console.error('[Storage] Error en upload:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('arqueos')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('[Storage] Catch error:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido al subir';
        return { success: false, error: message };
    }
}

export async function getArqueos(month?: number, year?: number, organizationId?: string) {
    try {
        const whereClause: { organizationId?: string; createdAt?: { gte: Date; lte: Date } } = {};

        if (organizationId) whereClause.organizationId = organizationId;

        if (year !== undefined) {
            let startDate, endDate;

            if (month !== undefined) {
                startDate = new Date(year, month, 1);
                endDate = new Date(year, month + 1, 0, 23, 59, 59);
            } else {
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59);
            }

            whereClause.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        const audits = await prisma.cashAudit.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return { success: true, data: audits };
    } catch (error) {
        console.error('[DB] Error al obtener arqueos:', error);
        return { success: false, error: 'No se pudieron obtener los datos' };
    }
}

export async function deleteArqueo(id: string) {
    try {
        await prisma.cashAudit.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error('[DB] Error al eliminar arqueo:', error);
        return { success: false, error: 'No se pudo eliminar el arqueo' };
    }
}

export async function updateArqueo(id: string, date: string, notes: string) {
    try {
        const existing = await prisma.cashAudit.findUnique({ where: { id } });
        if (!existing) throw new Error('Arqueo no encontrado');

        const currentData = existing.data as any;
        const newData = { ...currentData, date: date };

        await prisma.cashAudit.update({
            where: { id },
            data: {
                date: date,
                notes: notes,
                data: newData
            }
        });
        return { success: true };
    } catch (error) {
        console.error('[DB] Error al actualizar arqueo:', error);
        return { success: false, error: 'No se pudo actualizar el arqueo' };
    }
}

import { generateArqueoExcel } from '@/lib/excel';

// Helper to upload buffer directly
async function uploadReportBuffer(fileName: string, buffer: Buffer) {
    try {
        const supabase = await createClient();
        const { error } = await supabase.storage
            .from('arqueos')
            .upload(fileName, buffer, {
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('arqueos')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('[Storage] Error uploadBuffer:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: message };
    }
}

export async function regenerateArqueoReport(id: string) {
    try {
        const audit = await prisma.cashAudit.findUnique({ where: { id } });
        if (!audit) throw new Error('Arqueo no encontrado');

        const data = audit.data as unknown as CashRegisterRecord;

        // Generate Excel Buffer
        const buffer = generateArqueoExcel(data, audit.totalSales, audit.difference);

        // Upload
        const fileName = `cierre-${data.date}-${Date.now()}.xlsx`;
        const uploadRes = await uploadReportBuffer(fileName, buffer);

        if (!uploadRes.success || !uploadRes.url) {
            throw new Error(uploadRes.error || 'Error subiendo archivo');
        }

        // Update DB
        await prisma.cashAudit.update({
            where: { id },
            data: { reportUrl: uploadRes.url }
        });

        return { success: true, url: uploadRes.url };
    } catch (error) {
        console.error('[Regenerate] Error:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: message };
    }
}

export async function getLastArqueo(organizationId?: string) {
    try {
        const lastAudit = await prisma.cashAudit.findFirst({
            where: organizationId ? { organizationId } : {},
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!lastAudit) return { success: true, data: null };

        const closedData = lastAudit.data as unknown as CashRegisterRecord;

        return {
            success: true,
            data: {
                date: lastAudit.date,
                effective: Number(closedData.audit.realCash) || 0,
                mp: Number(closedData.audit.realDigital) || 0 // realDigital mapped to mp for frontend compatibility
            }
        };
    } catch (error) {
        console.error('[DB] Error al obtener último arqueo:', error);
        return { success: false, error: 'No se pudo obtener el último cierre' };
    }
}
