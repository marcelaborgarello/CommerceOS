'use client';

import { useState, useEffect } from 'react';

import { getCompromisos, addCompromiso, deleteCompromiso, markAsPaid, updateCompromiso } from '@/actions/compromisosActions';
import { getProviders } from '@/actions/providerActions';
import { Toast } from '@/components/Toast';
import type { Commitment, Provider, Organization } from '@/types';
import { CommitmentCard } from './components/CommitmentCard';
import { CommitmentFormModal, type CommitmentFormData } from './components/CommitmentFormModal';
import { PaymentModal } from './components/PaymentModal';
import { DeleteModal } from './components/DeleteModal';
import { CardSkeleton } from '@/components/Skeleton';
import { getArgentinaDateKey } from '@/utils/dateUtils';

interface CommitmentsClientProps {
    organization: Pick<Organization, 'name' | 'type' | 'logoUrl'> & { userEmail?: string };
    initialCompromisos?: Commitment[];
    initialProviders?: Provider[];
}

export function CommitmentsClient({
    organization,
    initialCompromisos = [],
    initialProviders = []
}: CommitmentsClientProps) {
    const [commitments, setCommitments] = useState<Commitment[]>(initialCompromisos);
    const [providers, setProviders] = useState<Provider[]>(initialProviders);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending'>('pending');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CommitmentFormData | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, commitmentId: string | null }>({ isOpen: false, commitmentId: null });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, commitmentId: string | null }>({ isOpen: false, commitmentId: null });

    useEffect(() => {
        // Only reload when filter changes (not on initial mount unless we want strict sync)
        if (filter !== 'pending') {
            loadData();
        }
    }, [filter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [compRes, provRes] = await Promise.all([
                getCompromisos(filter),
                getProviders()
            ]);

            if (compRes.success) {
                setCommitments(compRes.data || []);
            } else {
                setToast({ message: 'Error: ' + compRes.error, type: 'error' });
            }

            if (provRes.success) setProviders(provRes.data || []);
        } catch (err) {
            setToast({ message: 'Error de conexión', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleSave = async (data: CommitmentFormData) => {
        setIsLoading(true); // Optimistic UI or generic loading
        try {
            if (!data.description || !data.amount) {
                setToast({ message: 'Descripción y Monto requeridos', type: 'error' });
                setIsLoading(false);
                return;
            }

            let res;
            if (editingId) {
                res = await updateCompromiso(editingId, { ...data, amount: parseFloat(data.amount) });
            } else {
                res = await addCompromiso({ ...data, amount: parseFloat(data.amount) });
            }

            if (res.success) {
                setToast({ message: editingId ? '¡Actualizado exitosamente!' : '¡Agendado exitosamente!', type: 'success' });
                setIsFormModalOpen(false);
                setEditingId(null);
                setEditingItem(null);
                await loadData(); // Reload to ensure sync
            } else {
                setToast({ message: 'Ocurrió un error al guardar', type: 'error' });
            }
        } catch (e) {
            setToast({ message: 'Error inesperado', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: Commitment) => {
        setEditingItem({
            description: item.description,
            amount: item.amount.toString(),
            dueDate: typeof item.dueDate === 'string' ? item.dueDate.split('T')[0] : new Date(item.dueDate).toISOString().split('T')[0],
            providerId: item.providerId || '',
            notes: item.notes || ''
        });
        setEditingId(item.id);
        setIsFormModalOpen(true);
    };

    const handleNew = () => {
        setEditingId(null);
        setEditingItem(null);
        setIsFormModalOpen(true);
    };

    const confirmPayment = async (useCaja: boolean) => {
        const id = paymentModal.commitmentId;
        if (!id) return;

        const res = await markAsPaid(id, useCaja, getArgentinaDateKey());

        if (res.success) {
            setToast({ message: useCaja ? 'Pago registrado y descontado de Caja' : 'Compromiso marcado como Pagado', type: 'success' });
            loadData();
        } else {
            setToast({ message: 'Error al procesar el pago', type: 'error' });
        }
        setPaymentModal({ isOpen: false, commitmentId: null });
    };

    const confirmDelete = async () => {
        const id = deleteModal.commitmentId;
        if (!id) return;

        const res = await deleteCompromiso(id);
        if (res.success) {
            setToast({ message: 'Compromiso eliminado correctamente', type: 'success' });
            loadData();
        } else {
            setToast({ message: 'No se pudo eliminar el compromiso', type: 'error' });
        }
        setDeleteModal({ isOpen: false, commitmentId: null });
    };

    const totalAmount = commitments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="min-h-screen pb-20 bg-slate-900">
            <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
                <div className="mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold text-white mb-1">Agenda Financiera</h1>
                    <p className="text-secondary text-sm">Gestión de Vencimientos y Pagos</p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'pending' ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Pendientes
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Historial Completo
                            </button>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <span className="text-secondary text-sm uppercase tracking-wider font-bold">Total {filter === 'pending' ? 'a Pagar' : 'Registrado'}</span>
                            <span className="text-4xl font-black text-white tracking-tight">
                                ${totalAmount.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleNew}
                        className="btn px-6 py-3 text-sm animate-in fade-in zoom-in duration-300"
                    >
                        <span className="text-xl leading-none mr-1">+</span> Nuevo Compromiso
                    </button>
                </div>

                {/* GRID CONTENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        // SKELETONS
                        Array.from({ length: 4 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))
                    ) : commitments.length === 0 ? (
                        // EMPTY STATE
                        <div className="col-span-full py-20 px-4 flex flex-col items-center justify-center text-center opacity-75 animate-in fade-in duration-500">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
                                <span className="text-5xl grayscale">🎉</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">¡Todo al día!</h3>
                            <p className="text-secondary max-w-md mx-auto">
                                No tenés compromisos pendientes por ahora. <br />
                                Agregá uno nuevo cuando lo necesites.
                            </p>
                        </div>
                    ) : (
                        // CARDS
                        commitments.map(item => (
                            <div key={item.id} className="animate-in fade-in zoom-in-95 duration-300 fill-mode-backwards" style={{ animationDelay: '0ms' }}>
                                <CommitmentCard
                                    item={item}
                                    onEdit={handleEdit}
                                    onDelete={(id) => setDeleteModal({ isOpen: true, commitmentId: id })}
                                    onPay={(id) => setPaymentModal({ isOpen: true, commitmentId: id })}
                                />
                            </div>
                        ))
                    )}
                </div>

                <CommitmentFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingItem}
                    providers={providers}
                    isEditing={!!editingId}
                />

                <DeleteModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, commitmentId: null })}
                    onConfirm={confirmDelete}
                />

                <PaymentModal
                    isOpen={paymentModal.isOpen}
                    onClose={() => setPaymentModal({ isOpen: false, commitmentId: null })}
                    onConfirm={confirmPayment}
                />

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
}
