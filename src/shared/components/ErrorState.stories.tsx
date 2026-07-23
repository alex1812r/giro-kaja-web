import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { ErrorState } from "./ErrorState";

const meta = {
  title: "Shared/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "No se pudo cargar la sesión",
    description: "Revisa tu conexión e intenta de nuevo.",
  },
};

export const WithRetry: Story = {
  args: {
    title: "Algo salió mal",
    description: "Ocurrió un error inesperado.",
    retryLabel: "Reintentar",
    onRetry: fn(),
  },
};
