'use client';

import { useState } from 'react';
import { deleteOrganization } from '@/actions/organizationActions';

interface DeleteBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: {
        id: string;
        name: string;
    };
}

export function DeleteBusinessModal({ isOpen, onClose, organization }: DeleteBusinessModalProps) {
    const [confirmName, setConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (confirmName !== organization.name) return;

        setIsDeleting(true);
        const formData = new FormData();
        formData.append('organizationId', organization.id);

        await deleteOrganization(formData);
        // Action handles redirect/revalidate
        setIsDeleting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    ✕
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl mb-2">
                        ⚠️
                    </div>

                    <h3 className="text-xl font-bold text-white">¿Eliminar {organization.name}?</h3>

                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-sm text-red-200 font-medium">
                        Esta acción es irreversible. Se eliminarán todas las ventas, productos, clientes y datos asociados a este negocio.
                    </div>

                    <div className="w-full flex flex-col gap-2 text-left mt-2">
                        <label className="text-xs text-gray-400 uppercase font-bold">
                            Escribí <span className="text-white select-all">"{organization.name}"</span> para confirmar:
                        </label>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder={organization.name}
                            className="input-field bg-black/50 border-red-500/30 focus:border-red-500 text-center font-bold"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-row gap-3 w-full mt-4">
                        <button
                            onClick={onClose}
                            className="btn bg-white/5 hover:bg-white/10 text-white flex-1"
                            disabled={isDeleting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={confirmName !== organization.name || isDeleting}
                            className="btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar Negocio'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
