'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logout } from '@/actions/authActions';

interface UserMenuProps {
    email?: string;
    logoUrl?: string | null;
}

export const UserMenu = ({ email, logoUrl }: UserMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = email ? email.substring(0, 2).toUpperCase() : '??';

    return (
        <div className="relative z-[60]" ref={menuRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    text-sm font-bold tracking-wider transition-all duration-200 overflow-hidden
                    ${isOpen ? 'bg-accent text-white ring-4 ring-accent/30 scale-105' : 'bg-white/10 text-white hover:bg-white/20'}
                `}
                aria-label="Menú de Usuario"
            >
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt="Logo"
                        fill
                        className="object-cover"
                        sizes="40px"
                    />
                ) : (
                    initials
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[#1a1a1a] border border-[#333] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-white/10">

                    {/* User Info Header */}
                    <div className="px-5 py-4 border-b border-[#333] bg-white/5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Cuenta Activa</p>
                        <p className="text-sm font-bold text-white truncate" title={email}>
                            {email || 'Usuario'}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 flex flex-col gap-1">
                        <Link
                            href="/my-businesses"
                            className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors no-underline mx-2 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="text-lg opacity-70 group-hover:opacity-100">🏪</span>
                            <div className="flex flex-col">
                                <span className="font-medium">Mis Negocios</span>
                                <span className="text-[10px] text-gray-500 group-hover:text-gray-400">Cambiar o Crear</span>
                            </div>
                        </Link>

                        <Link
                            href="/settings"
                            className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors no-underline mx-2 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="text-lg opacity-70 group-hover:opacity-100">⚙️</span>
                            <div className="flex flex-col">
                                <span className="font-medium">Configuración</span>
                                <span className="text-[10px] text-gray-500 group-hover:text-gray-400">Widgets y Preferencias</span>
                            </div>
                        </Link>

                        <div className="h-px bg-[#333] my-1 mx-4" />

                        <button
                            onClick={async () => {
                                await logout();
                                setIsOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mx-2 rounded-lg"
                        >
                            <span className="text-lg">🚪</span>
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
