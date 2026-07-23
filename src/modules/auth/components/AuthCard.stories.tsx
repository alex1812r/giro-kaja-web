import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthCard } from "./AuthCard";

const meta = {
  title: "Modules/Auth/AuthCard",
  component: AuthCard,
  parameters: {
    docs: {
      description: {
        component:
          "Shared auth card: brand + tagline. Reused by login, forgot, and reset password.",
      },
    },
  },
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginShell: Story = {
  args: {
    children: (
      <p className="rounded-md bg-surface-muted px-3 py-8 text-center text-sm text-text-secondary">
        Login form slot
      </p>
    ),
  },
};

export const RecoverPasswordShell: Story = {
  args: {
    showBrand: false,
    heading: "Recuperar contraseña",
    description: "Te enviaremos un enlace a tu correo para restablecer el acceso.",
    children: (
      <p className="rounded-md bg-surface-muted px-3 py-8 text-center text-sm text-text-secondary">
        Forgot-password form slot
      </p>
    ),
  },
};

export const NewPasswordShell: Story = {
  args: {
    showBrand: false,
    heading: "Nueva contraseña",
    description: "Elige una contraseña segura para tu cuenta.",
    children: (
      <p className="rounded-md bg-surface-muted px-3 py-8 text-center text-sm text-text-secondary">
        Reset-password form slot
      </p>
    ),
  },
};
