'use client';

interface TicketCustomerFormProps {
    clientName: string;
    setClientName: (value: string) => void;
    address: string;
    setAddress: (value: string) => void;
    phone: string;
    setPhone: (value: string) => void;
}

export function TicketCustomerForm({
    clientName,
    setClientName,
    address,
    setAddress,
    phone,
    setPhone
}: TicketCustomerFormProps) {
    return (
        <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-secondary font-bold uppercase text-xs tracking-wider">👤 Datos del Cliente</h3>
            <div className="grid grid-cols-1 gap-3">
                <input
                    className="input-field"
                    placeholder="Nombre..."
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                />
                <input
                    className="input-field"
                    placeholder="Dirección..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                />
                <input
                    className="input-field"
                    placeholder="Teléfono..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
            </div>
        </div>
    );
}
