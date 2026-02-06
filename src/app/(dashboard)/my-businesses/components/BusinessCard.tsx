'use client';

import { useState } from 'react';
import { DeleteBusinessModal } from './DeleteBusinessModal';
import { switchOrganization } from '@/actions/sessionActions';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Organization } from '@/generated/prisma/client';

interface BusinessCardProps {
    organization: Organization;
    role: string;
}

export function BusinessCard({ organization, role }: BusinessCardProps) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelect = async () => {
        setIsLoading(true);
        try {
            const result = await switchOrganization(organization.id);
            if (result?.error) {
                alert(result.error);
                setIsLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="glass-panel relative flex flex-col p-0 overflow-hidden group hover:border-brand-peach/50 transition-colors">
                {/* Header / Banner */}
                <div className="h-24 bg-gradient-to-br from-white/5 to-white/0 p-4 flex items-start justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded bg-black/40 text-secondary">
                        {organization.type}
                    </span>
                    {role === 'OWNER' && (
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/setup?orgId=${organization.id}`}
                                className="text-gray-500 hover:text-white transition-colors p-1"
                                title="Editar Negocio"
                            >
                                ⚙️
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteModal(true);
                                }}
                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                title="Eliminar Negocio"
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 pt-0 flex flex-col items-center -mt-10">
                    <div className="w-20 h-20 rounded-xl bg-[#222] border-4 border-[#111] shadow-xl overflow-hidden mb-4 relative z-10">
                        {organization.logoUrl ? (
                            <Image
                                src={organization.logoUrl}
                                fill
                                sizes="80px"
                                className="object-cover"
                                alt="Logo"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/20">
                                {organization.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white text-center mb-1">{organization.name}</h3>
                    <p className="text-xs text-secondary mb-6">{role === 'OWNER' ? 'Dueño' : 'Empleado'}</p>

                    <button
                        onClick={handleSelect}
                        disabled={isLoading}
                        className="btn w-full bg-white/5 hover:bg-brand-peach hover:text-black transition-all font-bold tracking-wider text-sm py-3"
                    >
                        {isLoading ? 'Entrando...' : 'Ingresar'}
                    </button>
                </div>
            </div>

            <DeleteBusinessModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                organization={organization}
            />
        </>
    );
}
