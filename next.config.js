/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compress: true,
    // output: 'standalone',

    images: {
        remotePatterns: [
            // 1. TU PROYECTO DE SUPABASE (El importante)
            {
                protocol: 'https',
                hostname: 'epagmxnedpicvrpfrdfq.supabase.co',
                port: '',
                pathname: '/**', // <--- Esto es el "Pase Libre" para cualquier carpeta
            },
            // 2. Google (por si usás login con Google y querés ver la fotito)
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            }
        ],
    },

    // Configuración de TypeScript (integrada acá adentro para no romper nada)
    typescript: {
        ignoreBuildErrors: false,
        tsconfigPath: 'tsconfig.json',
    },
};

module.exports = nextConfig;