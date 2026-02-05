import { SavingsClient } from './SavingsClient';
import { createClient } from '@/utils/supabase/server';
import { getCurrentOrganization } from '@/utils/serverContext';
import { redirect } from 'next/navigation';
import { getReservaBalance } from '@/actions/savingsActions';

import { getProviders } from '@/actions/cashActions';

export const dynamic = 'force-dynamic';

export default async function ReservaPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const org = await getCurrentOrganization(user);
    if (!org) redirect('/setup');

    // Load initial data on server
    const [balanceCashRes, balanceBankRes, providersRes] = await Promise.all([
        getReservaBalance('CASH'),
        getReservaBalance('BANK'),
        getProviders(org.id)
    ]);

    return (
        <SavingsClient
            organization={{
                name: org.name,
                type: org.type,
                logoUrl: org.logoUrl,
                userEmail: user.email
            }}
            initialCashBalance={balanceCashRes.success ? balanceCashRes.balance || 0 : 0}
            initialBankBalance={balanceBankRes.success ? balanceBankRes.balance || 0 : 0}

            initialProviders={providersRes.success ? providersRes.providers || [] : []}
        />
    );
}
