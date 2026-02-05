import { getRequiredAuth } from '@/utils/serverContext';
import { TicketClient } from './TicketClient';
import { getProducts } from '@/actions/productActions';

export default async function TicketPage() {
    const { user, org } = await getRequiredAuth();

    // Load initial products on server
    const productsRes = await getProducts();

    return (
        <TicketClient
            organization={{
                name: org.name,
                type: org.type,
                logoUrl: org.logoUrl || undefined,
                address: org.address || undefined,
                phone: org.phone || undefined
            }}
            userEmail={user.email}
            initialProducts={productsRes.success ? productsRes.data || [] : []}
        />
    );
}
