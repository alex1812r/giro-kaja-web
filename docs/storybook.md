# Storybook — Giro Kaja

Misma línea que BodegaHub / control-ventas: componentes y pantallas se documentan con stories en `src/**/*.stories.tsx`.

## Comandos

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # salida en storybook-static/
```

## Configuración

| Archivo | Rol |
|---------|-----|
| `.storybook/main.ts` | Framework `@storybook/nextjs-vite`, stories, addons |
| `.storybook/preview.tsx` | `globals.css`, `AppProviders`, toolbar Tema, MSW |
| `.storybook/msw-handlers.ts` | Handlers mock (vacío por ahora) |

## Convenciones

- Stories junto al componente: `Button.tsx` + `Button.stories.tsx`
- Título: `Shared/Button`, `Shared/Layout/AppShell`, `Theme/Tokens`, `Modules/Auth/...`
- Usar tokens semánticos (`bg-primary`, `font-headline`); no hex sueltos
- El toolbar **Tema** (Claro / Oscuro) sincroniza `giro-kaja:theme` y la clase en `<html>`

## Catálogo Shared

| Story | Componente |
|-------|------------|
| `Shared/Button` | Botón primary / secondary / danger / ghost |
| `Shared/Skeleton` | Placeholder de carga (pulse) |
| `Shared/Card` | Card + header / content / footer |
| `Shared/Modal` | Diálogo con portal |
| `Shared/PortalMenu` | Menú anclado (profile / notificaciones) |
| `Shared/ThemeSwitch` | Switch sol / luna |
| `Shared/LoadingState` | Estado de carga |
| `Shared/ErrorState` | Estado de error + retry |
| `Shared/ModulePlaceholder` | Placeholder de módulo |
| `Shared/Layout/AppShell` | Shell completo (sidebar + header) |
| `Shared/Layout/AppSidebar` | Solo sidebar |
| `Shared/Layout/AppHeader` | Solo header |
| `Theme/Tokens` | Catálogo de tokens |

## Modules

Stories de auth bajo `Modules/Auth/*` (Login, Forgot, Reset, AuthCard).

| Story | Componente |
|-------|------------|
| `Modules/Home/Dashboard` | Pantalla Inicio (Stitch) |
| `Modules/Home/MetricCard` | Tarjeta de métrica del dashboard |
| `Modules/CashRegister/Main` | Pantalla Caja (Stitch) |
| `Modules/Loans/Main` | Pantalla Préstamos (Stitch) |
| `Modules/Loans/Detail` | Detalle de préstamo (Stitch) |
