import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteArqueo, updateArqueo } from '@/actions/arqueoActions';
import type { EditArqueoState } from '@/types';

export function useArqueoActions() {
    const router = useRouter();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editingArqueo, setEditingArqueo] = useState<EditArqueoState | null>(null);

    const handleDelete = async (id: string) => {
        const res = await deleteArqueo(id);
        if (res.success) {
            setDeleteConfirmId(null);
            router.refresh();
        } else {
            alert('Error al eliminar: ' + res.error);
        }
    };

    const handleUpdate = async (state: EditArqueoState) => {
        if (!state.date) {
            alert('La fecha es obligatoria');
            return;
        }

        const res = await updateArqueo(state.id, state.date, state.notes);
        if (res.success) {
            setEditingArqueo(null);
            router.refresh();
        } else {
            alert('Error al actualizar: ' + res.error);
        }
    };

    return {
        deleteConfirmId,
        setDeleteConfirmId,
        editingArqueo,
        setEditingArqueo,
        handleDelete,
        handleUpdate
    };
}
