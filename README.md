# Giro Kaja Web

Aplicación web de Giro Kaja (microcréditos + caja) — Next.js App Router, Supabase Auth/RLS, TanStack Query, i18n (es/en).

## Requisitos

- Node.js 20+
- Proyecto Supabase con las migraciones del monorepo `giro-kaja/supabase`

## Setup

```bash
npm install
cp .env.local.example .env.local
# Completa NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# y SUPABASE_SERVICE_ROLE_KEY (consola superadmin)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook (si está configurado) |

## Documentación interna

Ver [`docs/`](./docs/) — auth, i18n, design tokens, Storybook.

## Seguridad

- No commitear `.env.local` ni claves reales.
- `SUPABASE_SERVICE_ROLE_KEY` solo en servidor.
