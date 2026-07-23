# Design tokens — Giro Kaja

Contrato visual alineado con **Google Stitch** (proyecto Giro Kaja Web DS).  
Fuente TS: [`src/shared/theme/tokens.ts`](../src/shared/theme/tokens.ts)  
CSS: [`src/app/globals.css`](../src/app/globals.css)

Usar utilidades semánticas (`bg-primary`, `text-text-secondary`, `font-headline`). Evitar hex sueltos en módulos.

## Marca

| Token | Valor | Tailwind |
|-------|--------|----------|
| Primary | `#107C41` | `bg-primary` / `text-primary` |
| Primary dark | `#0B532C` | `bg-primary-dark` / hover |
| Primary light | `#EAF4EC` (light) / `#1A3D2A` (dark) | `bg-primary-light` |
| Primary container | `#96F7AF` (light) / `#1A3D2A` (dark) | `bg-primary-container` — nav activo (Stitch) |
| On primary container | `#005F2F` (light) / `#96F7AF` (dark) | `text-on-primary-container` |
| On primary | `#FFFFFF` | `text-on-primary` |

## Superficies y texto

| Token | Light | Dark | Tailwind |
|-------|-------|------|----------|
| Background | `#F8F9FA` | `#111827` | `bg-background` |
| Surface | `#FFFFFF` | `#1F2937` | `bg-surface` |
| Surface muted | `#F1F4F5` | `#374151` | `bg-surface-muted` |
| Border | `#E5E7EB` | `#374151` | `border-border` |
| Text main | `#1F2937` | `#F9FAFB` | `text-text-main` |
| Text secondary | `#6B7280` | `#9CA3AF` | `text-text-secondary` |

## Semánticos

| Rol | Light | Dark | Tailwind |
|-----|-------|------|----------|
| Success | `#107C41` | `#34D399` | `text-success` / `bg-success` |
| Warning | `#F59E0B` | `#FBBF24` | `text-warning` |
| Danger | `#EF4444` | `#F87171` | `text-danger` |
| Ring / focus | `#107C41` | `#34D399` | `ring-ring` |

## Tipografía

| Rol | Familia | Variable / clase |
|-----|---------|------------------|
| Headlines / marca / montos | **Manrope** | `--font-manrope` → `font-headline` |
| Body / UI / forms | **DM Sans** | `--font-dm-sans` → `font-sans` (default body) |

Carga: `next/font/google` en `src/app/layout.tsx`.

## Radios y layout

| Token | Valor | Uso |
|-------|--------|-----|
| `radius-sm` | 6px | chips, inputs densos |
| `radius-md` | 8px | botones, cards (Stitch ROUND_EIGHT) |
| `radius-lg` | 12px | diálogos, sheets |
| `radius-xl` | 16px | auth cards |
| Sidebar | 240px (`15rem`) | `--gk-sidebar-width` |
| Content max | 1120px (`70rem`) | `--gk-content-max-width` |
| Auth card | 420px (`26.25rem`) | `--gk-auth-card-max-width` / `.gk-auth-shell` |

## Iconos

- Familia: **lucide-react** (misma línea que control-ventas)
- Auth login (Stitch): `Mail`, `Lock`, `Eye` / `EyeOff`, `ShieldCheck`

## Theme runtime

| Pieza | Ubicación |
|-------|-----------|
| Storage key | `giro-kaja:theme` |
| Provider | `ThemeProvider` + `useTheme()` |
| Anti-FOUC | script inline en `layout.tsx` |
| Clases en `<html>` | `light` \| `dark` |

```tsx
import { useTheme } from "@/shared/theme";

const { theme, setTheme, toggleTheme } = useTheme();
```

## Verificación

```bash
# Preferir tokens semánticos; evitar marcas ajenas
rg "bg-indigo|text-blue-600|bg-purple" src/
```
