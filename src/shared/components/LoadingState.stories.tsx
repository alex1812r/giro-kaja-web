import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoadingState } from "./LoadingState";

const meta = {
  title: "Shared/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    title: "Cargando sesión…",
    description: "Estamos verificando tus credenciales.",
  },
};
