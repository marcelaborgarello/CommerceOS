import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';

import { storeConfig } from '@/config/storeConfig';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400', '500', '700', '900'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "CommerceOS",
    description: `Sistema integral de gestión de caja y stock para ${storeConfig.type}`,
    icons: {
        icon: '/favicon.svg',
    },
    verification: {
        google: '73FK3hA-b7uSwN2hAq-hIkRyG_TIg-SPP0iGb7_vzNo',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={`${inter.className} ${roboto.className}`}>
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
