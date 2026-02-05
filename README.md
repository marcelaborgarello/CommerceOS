# 🚀 CommerceOS

**CommerceOS** es una plataforma de gestión integral (SaaS) diseñada para potenciar pequeños y medianos comercios.
Originalmente nacida como una solución a medida, ha evolucionado hacia un sistema multi-organización robusto, permitiendo a múltiples negocios gestionar su caja, stock y finanzas de manera centralizada y segura.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

🔗 **Demo en Vivo:** [https://commerce-os.vercel.app/](https://commerce-os.vercel.app/)

---

## ✨ Características Principales

### 🏢 Multi-Tenancy (Multi-Organización)
- **Gestión Centralizada**: Administrá múltiples negocios con una sola cuenta.
- **Aislamiento de Datos**: Seguridad y privacidad total por organización.
- **Branding Dinámico**: La interfaz se adapta a la identidad de tu negocio.

### 💰 Gestión de Caja (Arqueo)
- **Cierre Diario Inteligente**: Cálculo automático de diferencias (Teórico vs Real).
- **Asistente de Conteo**: Calculadora de billetes integrada.
- **Auditoría**: Registro inmutable de cierres y movimientos.

### 📊 Finanzas y Reportes
- **Dashboard en Tiempo Real**: Visualizá rentabilidad, costos y márgenes al instante.
- **Agenda Financiera**: Control de vencimientos, cheques y compromisos de pago.
- **Gestión de Proveedores**: Cuentas corrientes y historial de compras.

### 📦 Gestión de Stock
- **Catálogo de Productos**: Precios, costos y márgenes de ganancia.
- **Gestión de Insumos**: Control de stock interno separado de productos de venta.
- **Listas de Precios**: Generación de PDFs para clientes.
- **Control de Mermas**: Registro y análisis de desperdicios.

---

## 🚀 Tecnologías

Construido sobre un stack moderno para garantizar velocidad, escalabilidad y una excelente experiencia de desarrollador:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) - Server Components & Server Actions
- **Lenguaje**: [TypeScript 5.9.3](https://www.typescriptlang.org/) - Type-safe development
- **Base de Datos**: PostgreSQL (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma 7.3.0](https://www.prisma.io/) - Type-safe database access
- **Autenticación**: Supabase Auth - Row Level Security (RLS)
- **Estilos**: Tailwind CSS - Utility-first CSS
- **Despliegue**: [Vercel](https://vercel.com/) - Edge-ready deployment
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime

---

## 🏗️ Arquitectura

### Multi-Tenancy
- **Aislamiento de Datos**: Cada organización tiene sus propios datos mediante `organizationId` en todas las tablas
- **Row Level Security**: Políticas de seguridad a nivel de base de datos en Supabase
- **Contexto de Organización**: Sistema de cookies para mantener el contexto activo

### Server-Side Rendering
- **Server Components**: Componentes por defecto renderizados en el servidor
- **Server Actions**: Toda la lógica de negocio ejecutada en el servidor
- **Optimización de Carga**: Datos iniciales cargados en el servidor para una experiencia instantánea

### Estructura del Proyecto
```
src/
├── app/                    # Rutas y layouts de Next.js
├── actions/                # Server Actions (lógica de negocio)
├── components/             # Componentes reutilizables
├── lib/                    # Utilidades y configuración
├── types/                  # Definiciones de TypeScript
└── utils/                  # Helpers y funciones auxiliares
```

### Seguridad
- **Autenticación**: Supabase Auth con sesiones seguras
- **Autorización**: Verificación de pertenencia a organización en cada acción
- **Validación**: Validación de datos tanto en cliente como servidor con Zod

---

## 📦 Instalación
```bash
# Clonar el repositorio
git clone https://github.com/marcelaborgarello/CommerceOS.git
cd CommerceOS

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env.local

# Generar cliente de Prisma
bunx prisma generate

# Ejecutar migraciones
bunx prisma migrate dev

# Iniciar servidor de desarrollo
bun run dev
```

### Variables de Entorno Requeridas
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_postgres_connection_string
DIRECT_URL=your_direct_postgres_connection_string
```

---

## 🎯 Desafíos Técnicos Resueltos

- ✅ **Multi-tenancy seguro**: Implementación de aislamiento de datos a nivel de aplicación y base de datos
- ✅ **Performance**: Optimización de carga inicial con Server Components y datos pre-cargados
- ✅ **Escalabilidad**: Arquitectura preparada para múltiples organizaciones sin degradación
- ✅ **Type Safety**: TypeScript end-to-end con Prisma para garantizar consistencia de tipos
- ✅ **UX Fluida**: Eliminación de estados de carga innecesarios, interfaz instantánea
- ✅ **Migración Next.js 15→16**: Actualización a patrones async (searchParams, cookies, headers)

---

## 🛣️ Roadmap

- [ ] Sistema de roles y permisos
- [ ] Integración con pasarelas de pago
- [ ] App móvil nativa
- [ ] Módulo de facturación electrónica
- [ ] Dashboards personalizables
- [ ] Exportación de datos a formatos múltiples

---

## 📸 Screenshots

> 💡 **Próximamente**: Capturas de pantalla de las principales funcionalidades.

---

## 🤝 Contribuciones

Este proyecto es de uso personal, pero las sugerencias y feedback son bienvenidos.

---

## 📄 Licencia

Este proyecto es privado y de uso personal.

---

© 2026 **CommerceOS** - Hecho con ❤️ por [Marcela Borgarello](https://github.com/marcelaborgarello)