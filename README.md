# Front Finanzas

Bootstrap frontend con React + Vite + TypeScript bajo enfoque de Clean Architecture.

## Stack

- React 19 + Vite
- TypeScript estricto
- React Router
- Tailwind CSS v4 + base UI tipo shadcn/ui (Radix)
- TanStack Query + Zustand
- React Hook Form + Zod
- ESLint + Prettier + Vitest + RTL
- Husky + lint-staged

## Scripts

- `npm run dev`: servidor local
- `npm run build`: typecheck + build producción
- `npm run preview`: preview del build
- `npm run lint`: análisis estático
- `npm run format`: formatea código
- `npm run format:check`: valida formato
- `npm run test`: pruebas unitarias
- `npm run test:watch`: pruebas en watch

## Variables de entorno

Crear `.env` en raíz de `front_finanzas`:

```env
VITE_APP_NAME=Mis Finanzas
VITE_API_BASE_URL=http://localhost:3100/api/v1
```

## Arquitectura

```txt
src/
  domain/
  application/
  infrastructure/
  presentation/
  shared/
```

## Notas

- El login real se implementa en la siguiente fase.
- Este bootstrap ya deja el guard de rutas, estado de sesión y cliente HTTP listos.
