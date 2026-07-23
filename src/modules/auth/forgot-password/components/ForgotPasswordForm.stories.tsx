import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthCard } from "@/modules/auth/components";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

const meta = {
  title: "Modules/Auth/ForgotPasswordForm",
  component: ForgotPasswordForm,
  decorators: [
    (Story) => (
      <div className="flex justify-center bg-background p-8">
        <AuthCard
          showBrand={false}
          heading="Recuperar contraseña"
          description="Te enviaremos un enlace a tu correo para restablecer el acceso."
        >
          <Story />
        </AuthCard>
      </div>
    ),
  ],
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: () => undefined,
  },
};

export const WithError: Story = {
  args: {
    errorMessage: "No pudimos enviar el enlace. Intenta de nuevo.",
    onSubmit: () => undefined,
  },
};

export const Success: Story = {
  args: {
    successMessage:
      "Si el correo existe, te enviamos un enlace para restablecer tu contraseña.",
    onSubmit: () => undefined,
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: () => undefined,
  },
};
