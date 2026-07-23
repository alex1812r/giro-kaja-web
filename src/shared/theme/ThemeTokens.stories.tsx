import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { brand, layout, lightPalette, typography } from "./tokens";

function ThemeTokensShowcase() {
  const swatches = [
    { name: "primary", className: "bg-primary text-on-primary" },
    { name: "primary-dark", className: "bg-primary-dark text-on-primary" },
    { name: "primary-light", className: "bg-primary-light text-primary" },
    {
      name: "primary-container",
      className: "bg-primary-container text-on-primary-container",
    },
    { name: "background", className: "bg-background text-text-main border border-border" },
    { name: "surface", className: "bg-surface text-text-main border border-border" },
    { name: "success", className: "bg-success text-on-primary" },
    { name: "warning", className: "bg-warning text-text-main" },
    { name: "danger", className: "bg-danger text-on-primary" },
  ] as const;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="space-y-2">
        <p className="font-headline text-3xl font-bold text-primary">Giro Kaja</p>
        <p className="text-sm text-text-secondary">
          Tokens de diseño — {typography.headline} / {typography.body}. Usa el toolbar
          Tema para alternar claro/oscuro.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-headline text-lg font-semibold text-text-main">Colores</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map((swatch) => (
            <div
              key={swatch.name}
              className={`flex h-20 flex-col justify-end rounded-md p-2 text-xs font-medium ${swatch.className}`}
            >
              {swatch.name}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-headline text-lg font-semibold">Tipografía</h2>
        <p className="font-headline text-2xl font-bold tracking-tight">
          Headline Manrope — montos y títulos
        </p>
        <p className="text-base">Body DM Sans — formularios y UI general.</p>
        <p className="text-sm text-text-secondary">Texto secundario / meta.</p>
      </section>

      <section className="space-y-2 text-sm text-text-secondary">
        <p>
          Primary seed: <code className="text-text-main">{brand.primary}</code>
        </p>
        <p>
          Background: <code className="text-text-main">{lightPalette.background}</code>
        </p>
        <p>
          Sidebar: <code className="text-text-main">{layout.sidebarWidth}</code> · Content max:{" "}
          <code className="text-text-main">{layout.contentMaxWidth}</code>
        </p>
      </section>
    </div>
  );
}

const meta = {
  title: "Theme/Tokens",
  component: ThemeTokensShowcase,
  parameters: {
    docs: {
      description: {
        component:
          "Catálogo visual de tokens. Fuente: `src/shared/theme/tokens.ts` + `globals.css`.",
      },
    },
  },
} satisfies Meta<typeof ThemeTokensShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
