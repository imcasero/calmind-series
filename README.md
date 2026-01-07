# Pokemon Calmind Series

Competición Amateur de Pokemon con clasificaciones en tiempo real.

## Stack Tecnológico

- **Next.js 16** - App Router con React Server Components
- **React 19** - UI Components
- **Tailwind CSS v4** - Sistema de estilos retro Pokemon
- **Supabase** - Base de datos con actualizaciones en tiempo real
- **TypeScript** - Type safety completo
- **pnpm** - Package manager

## Características Principales

### ISR (Incremental Static Regeneration)
- Páginas de divisiones se regeneran cada 60 segundos
- Mejor rendimiento y menor latencia
- SEO optimizado

### Real-Time Updates
- Rankings actualizados en tiempo real usando Supabase Realtime
- Indicador visual "En Vivo" cuando está conectado
- Sin necesidad de recargar la página

## Setup

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configurar base de datos

Ejecuta el script `supabase-schema.sql` en tu proyecto de Supabase para crear las tablas necesarias.

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`

## Deploy en Vercel

1. Push el código a GitHub
2. Conecta el repo en vercel.com
3. Configura las variables de entorno
4. Deploy automático en cada push

## Estructura del Proyecto

```
app/
├── _components/          # Componentes React
├── _lib/
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Servicios de datos
│   ├── supabase/        # Configuración Supabase
│   └── types/           # TypeScript types
├── primera-division/    # Página Primera División
├── segunda-division/    # Página Segunda División
├── layout.tsx           # Layout principal
├── page.tsx             # Homepage
└── globals.css          # Estilos globales
```

---

**Migrado de Astro a Next.js - Enero 2026**
