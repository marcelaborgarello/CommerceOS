import { getCurrentOrganization } from '@/utils/serverContext';
import { getPOSProducts } from '@/actions/productActions';
import { TicketClient } from './TicketClient';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getArgentinaDateKey } from '@/utils/dateUtils';
import prisma from '@/lib/db';

export default async function POSPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 1. Get Organization
    const org = await getCurrentOrganization(user);
    if (!org) {
        redirect('/setup');
    }

    // 2. Get Products (Optimized for POS)
    const productRes = await getPOSProducts();
    const products = productRes.success && productRes.data ? productRes.data : [];

    // 3. Get Today's Session Status
    const today = getArgentinaDateKey();
    const session = await prisma.cashSession.findFirst({
        where: {
            organizationId: org.id,
            date: today
        },
        select: {
            status: true,
            closeDate: true
        }
    });

    let sessionStatus: 'OPEN' | 'CLOSED' | 'NONE' = 'NONE';
    if (session) {
        if (session.status === 'CLOSED' || session.closeDate) {
            sessionStatus = 'CLOSED';
        } else {
            sessionStatus = 'OPEN';
        }
    }

    return (
        <TicketClient
            organization={{
                id: org.id,
                name: org.name,
                type: org.type,
                logoUrl: org.logoUrl || undefined,
                address: org.address || undefined,
                phone: org.phone || undefined
            }}
            userEmail={user.email || undefined}
            initialProducts={products}
            initialSessionStatus={sessionStatus}
        />
    );
}
