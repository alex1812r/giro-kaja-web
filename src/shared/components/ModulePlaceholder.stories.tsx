import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ModulePlaceholder } from "./ModulePlaceholder";

const meta = {
  title: "Shared/ModulePlaceholder",
  component: ModulePlaceholder,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Préstamos",
    description: "Módulo en construcción.",
  },
} satisfies Meta<typeof ModulePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    title: "Caja",
    description: "Aquí irá el saldo y los movimientos.",
  },
};
