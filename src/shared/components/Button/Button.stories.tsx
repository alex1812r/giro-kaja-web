import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";

const meta = {
  title: "Shared/Button",
  component: Button,
  args: {
    children: "Guardar",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: "Cancelar",
    variant: "secondary",
  },
};

export const Danger: Story = {
  args: {
    children: "Eliminar",
    variant: "danger",
  },
};

export const Ghost: Story = {
  args: {
    children: "Más opciones",
    variant: "ghost",
  },
};

export const Disabled: Story = {
  args: {
    children: "Guardando…",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
