import { useState } from 'react';

export interface TicketItem {
    id: string; // random id for list key
    productId: string;
    name: string;
    unit: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export function useTicket() {
    // Ticket Items
    const [items, setItems] = useState<TicketItem[]>([]);

    // Customer Info
    const [clientName, setClientName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    // Actions
    const addItem = (newItemData: Omit<TicketItem, 'id'>) => {
        const newItem: TicketItem = {
            id: crypto.randomUUID(),
            ...newItemData
        };
        setItems(prev => [...prev, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearTicket = () => {
        setItems([]);
        setClientName('');
        setAddress('');
        setPhone('');
    };

    // Derived State
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
        // State
        items,
        clientName,
        address,
        phone,
        total,
        // Setters (for direct input binding)
        setClientName,
        setAddress,
        setPhone,
        // Methods
        addItem,
        removeItem,
        clearTicket
    };
}
