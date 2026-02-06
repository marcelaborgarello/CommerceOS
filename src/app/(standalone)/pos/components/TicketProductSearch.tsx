import { useState, useRef, useEffect } from 'react';
import type { POSProduct } from '@/actions/productActions';

interface TicketProductSearchProps {
    products: POSProduct[];
    onAddItem: (item: {
        productId: string;
        name: string;
        unit: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
    }) => void;
}

export function TicketProductSearch({ products, onAddItem }: TicketProductSearchProps) {
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<POSProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null);
    const [quantity, setQuantity] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const quantityInputRef = useRef<HTMLInputElement>(null);

    // Debounce effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // Filter products
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(term)
        ).slice(0, 5);
        setSearchResults(filtered);
        setHighlightedIndex(0);
    }, [searchTerm, products]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (searchResults.length > 0) {
                selectProduct(searchResults[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setInputValue('');
            setSearchResults([]);
            setSelectedProduct(null);
        }
    };

    const selectProduct = (product: POSProduct) => {
        setSelectedProduct(product);
        setInputValue(product.name);
        setSearchResults([]);
        setTimeout(() => quantityInputRef.current?.focus(), 50);
    };

    const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        } else if (e.key === 'Escape') {
            setSelectedProduct(null);
            setQuantity('');
            setInputValue('');
            searchInputRef.current?.focus();
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        const qty = parseFloat(quantity);
        if (!qty || qty <= 0) return;

        onAddItem({
            productId: selectedProduct.id,
            name: selectedProduct.name,
            unit: selectedProduct.unit,
            unitPrice: selectedProduct.finalPrice,
            quantity: qty,
            subtotal: selectedProduct.finalPrice * qty
        });

        // Reset
        setSelectedProduct(null);
        setInputValue('');
        setQuantity('');
        searchInputRef.current?.focus();
    };

    return (
        <div className="glass-panel p-6 flex flex-col gap-4 border border-green-500/30 relative">
            <h2 className="text-lg font-bold text-green-400">⚡ Agregar Producto</h2>

            <div className="relative">
                <label className="text-xs uppercase text-secondary font-semibold mb-1 block">Producto (Buscar)</label>
                <input
                    ref={searchInputRef}
                    className={`input-field text-lg ${selectedProduct ? 'text-green-400 font-bold' : ''}`}
                    placeholder="Escribí para buscar..."
                    value={inputValue}
                    onChange={e => {
                        setInputValue(e.target.value);
                        if (selectedProduct) setSelectedProduct(null);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                />

                {/* Dropdown Results */}
                {searchResults.length > 0 && !selectedProduct && (
                    <div className="absolute top-full left-0 right-0 bg-slate-800 border border-white/20 rounded-b-xl shadow-2xl z-50 overflow-hidden mt-1 max-h-[300px] overflow-y-auto">
                        {searchResults.map((p, idx) => (
                            <div
                                key={p.id}
                                className={`p-3 cursor-pointer flex justify-between items-center ${idx === highlightedIndex ? 'bg-green-500 text-black' : 'hover:bg-white/5 text-white'}`}
                                onClick={() => selectProduct(p)}
                                onMouseDown={e => e.preventDefault()}
                            >
                                <span className="font-bold">{p.name}</span>
                                <span className="text-secondary text-xs">x {p.unit}</span>
                                <span className={idx === highlightedIndex ? 'font-bold' : 'text-secondary'}>
                                    ${p.finalPrice}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedProduct && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs uppercase text-secondary font-semibold mb-1 block">
                        Cantidad / Peso ({selectedProduct.unit})
                    </label>
                    <div className="flex gap-2">
                        <input
                            ref={quantityInputRef}
                            type="number"
                            className="input-field text-xl font-bold bg-green-500/10 border-green-500/50"
                            placeholder="0"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            onKeyDown={handleQuantityKeyDown}
                        />
                        <button
                            onClick={handleAddItem}
                            className="bg-green-500 text-black font-black px-6 rounded-lg uppercase tracking-wider hover:bg-green-400"
                        >
                            Enter ↵
                        </button>
                    </div>
                    <div className="mt-2 text-right text-sm text-secondary">
                        Subtotal: <span className="text-white font-bold">${(selectedProduct.finalPrice * (parseFloat(quantity) || 0)).toLocaleString('es-AR')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
