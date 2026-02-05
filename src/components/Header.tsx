import Link from 'next/link';
import Image from 'next/image';
import { Clock } from './Clock';
import { storeConfig } from '@/config/storeConfig';

import { UserMenu } from './UserMenu';

interface HeaderProps {
    title: string;
    subtitle?: string;
    organizationName?: string;
    organizationType?: string;
    logoUrl?: string | null;
    userEmail?: string;
}

export const Header = ({ title, subtitle, organizationName, organizationType, logoUrl, userEmail }: HeaderProps) => {
    // Format Current Date
    const defaultSubtitle = new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const displayTitle = organizationName ? organizationName.toUpperCase() : storeConfig.name.toUpperCase();
    const displayType = organizationType ? organizationType.toUpperCase() : storeConfig.type;

    return (
        <div className="w-full px-2 pt-4 pb-4 md:px-6 md:pt-8 md:pb-8 relative z-50">
            <header className="glass-panel max-w-7xl mx-auto flex flex-row justify-between items-center border-l-2 md:border-l-4 border-brand-green px-3 py-3 md:px-10 md:py-6">
                {/* Left: Branding & Back Button */}
                <div className="flex flex-row items-center gap-2 md:gap-6">
                    <Link href="/" className="btn-secondary text-sm px-2 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 no-underline hover:bg-white/5 transition-colors">
                        <span>🏠</span>
                        <span className="hidden md:inline">Inicio</span>
                    </Link>

                    {/* Brand / Logo Area */}
                    <Link href="/" className="flex flex-row items-center gap-2 md:gap-4 no-underline group cursor-pointer">
                        {logoUrl && (
                            <Image
                                src={logoUrl}
                                alt="Logo"
                                width={48}
                                height={48}
                                className="w-8 h-8 md:w-12 md:h-12 object-contain rounded-md"
                            />
                        )}
                        <div className="flex flex-col gap-0">
                            <span className="font-brand text-[0.6rem] md:text-[0.8rem] tracking-[2px] text-brand-peach uppercase group-hover:opacity-80 transition-opacity whitespace-nowrap">
                                {displayType}
                            </span>
                            <h1 className="font-brand text-[1.2rem] md:text-[1.8rem] font-black m-0 leading-none text-transparent bg-clip-text bg-gradient-to-r from-brand-cream to-white group-hover:opacity-80 transition-opacity whitespace-nowrap">
                                {displayTitle}
                            </h1>
                        </div>
                    </Link>
                </div>

                {/* Center: Simplified Date (Hidden on Mobile) */}
                <div className="text-center hidden lg:flex flex-col gap-0 transform -translate-x-12">
                    <span className="text-secondary text-xs capitalize font-medium tracking-widest">
                        {subtitle || defaultSubtitle}
                    </span>
                </div>

                {/* Right: User Menu & Time */}
                <div className="flex flex-row items-center gap-3 md:gap-6">
                    <div className="hidden md:block">
                        <Clock />
                    </div>
                    <div className="hidden md:block h-8 w-px bg-white/10 mx-2" />
                    <UserMenu email={userEmail} logoUrl={logoUrl} />
                </div>
            </header>
        </div>
    );
};
