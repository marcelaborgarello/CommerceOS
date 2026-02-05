'use client';

import { SupplyManager } from '@/components/SupplyManager';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Supply, Provider } from '@/types';

export const SupplyManagerWrapper = ({ initialSupplies, initialProviders }: { initialSupplies: Supply[], initialProviders: Provider[] }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = () => {
        setIsLoading(true);
        router.refresh();
    };

    // Listen for refresh completion? Next.js router.refresh is async but doesn't return promise in standard way easily.
    // We can rely on prop update.
    useEffect(() => {
        setIsLoading(false);
    }, [initialSupplies]);

    return (
        <SupplyManager
            supplies={initialSupplies}
            providers={initialProviders}
            isLoading={isLoading}
            onRefresh={handleRefresh}
        />
    );
};
