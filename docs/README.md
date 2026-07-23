# Documentación — Giro Kaja

Índice de documentación alineada con el código.

## Empezar aquí

| Documento | Para qué sirve |
|-----------|----------------|
| Este README | Estructura del proyecto y convenciones de carpetas |
| [design-tokens.md](design-tokens.md) | Colores, tipografía, radios, light/dark |
| [storybook.md](storybook.md) | Storybook: stories, tema, MSW |

## Estructura de código

```text
src/app/                 → rutas App Router (thin routes) + Route Handlers /api
src/modules/             → dominios (auth, home, loans, debts, cash-register, settings)
src/shared/              → components, hooks, utils reutilizables
src/lib/supabase/        → cliente y helpers de Supabase
docs/                    → documentación del proyecto
```

### Convenciones

- **`src/app/`** — Solo rutas delgadas que reexportan el módulo, layouts y handlers. Sin lógica de negocio.
- **`src/modules/`** — Código por dominio (pantallas tipo `*-list` / `*-create` / `*-details`).
- **`src/shared/`** — Piezas transversales: componentes, hooks y utilidades compartidas.
- **`src/lib/`** — Integraciones e infraestructura (p. ej. Supabase).

Ejemplo thin route:

```ts
// src/app/page.tsx
export { HomePage as default } from "@/modules/home/page";
```

