# Auth y sesión (arquitectura control-ventas)

## Flujo

```
LoginForm → useLogin → POST /api/auth/login
  → Supabase signInWithPassword (cookies)
  → ensure_profile / ensure_vault (RPC, best-effort)
  → AuthUser + organization + role
  → setQueryData(["auth","me"]) → redirect por rol

AuthenticatedAppShell → useCurrentUser → GET /api/auth/me
  → getAuthProfileFromSession + organization_members

proxy.ts: sesión + gate de rutas por rol (viewer → /loans*)
```

## AuthUser (sesión)

```ts
{
  id, name, email?, phone?,
  role: "owner" | "admin" | "viewer",
  organization: { id, name } | null,
  systemRole: "superadmin" | null,
  isActive: boolean
}
```

- Rol e organización vienen de `profiles.default_organization_id` + `organization_members`.
- `systemRole` viene de `profiles.system_role` (ortogonal al tenant). Ver `docs/SUPERADMIN.md`.
- Si la Fase 1 DB no está aplicada o no hay membership → `role: "owner"` (compat).
- Cliente: `useCurrentUser` / `useSessionOrganization` (`modules/auth/hooks`).

## Rutas por rol

| Rol | Acceso UI |
|-----|-----------|
| `superadmin` | Solo `/admin/*` (usuarios + organizaciones) |
| sin organización | Solo `/onboarding/organization` (crear tenant); luego refetch de `/api/auth/me` |
| `owner` / `admin` | App completa (home, loans, debts, caja, settings); no `/admin` |
| `viewer` | Solo `/loans` y `/loans/[id]` (listado simplificado, sin crear/pagar) |

Helpers: `modules/auth/roleAccess.ts` (`isPathAllowedForUser`, `defaultPathForUser`).

## Rutas públicas

| Ruta | Acceso |
|------|--------|
| `/login`, `/forgot-password`, `/reset-password` | Públicas |
| `/auth/callback` | Pública (intercambia `code`) |
| `/api/auth/*` | Autenticación propia (sin proxy) |

## Env

Ver `.env.local.example`. En Supabase Auth → URL Configuration, añade:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

## Capas

- Cliente: `apiFetch` + React Query hooks
- API: Route Handlers + `jsonData` / `toErrorResponse`
- Supabase: `route-client` (escribe cookies), `server-client` (RSC)
- Org helpers: `lib/supabase/auth/organization.server.ts`, `profile.server.ts`
