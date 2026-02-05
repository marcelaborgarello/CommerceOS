export interface StoreTheme {
    primary: string;
    secondary: string;
    accent: string;
}

export interface StoreConfig {
    name: string;
    slogan: string;
    type: string; // e.g., 'Verdulería', 'Carnicería', 'Almacén'
    theme: StoreTheme;
    logoEmoji?: string; // Simple placeholder if no image
}

export const storeConfig: StoreConfig = {
    name: 'Imprenart',
    slogan: 'Diseño y Gráfica',
    type: 'Imprenta',
    theme: {
        primary: '#2563eb', // Un azulcito estándar
        secondary: '#1e293b',
        accent: '#f59e0b',
    },
    logoEmoji: '🖨️',
};

