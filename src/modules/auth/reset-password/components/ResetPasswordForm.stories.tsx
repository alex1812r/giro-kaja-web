import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthCard } from "@/modules/auth/components";

import { ResetPasswordForm } from "./ResetPasswordForm";

const meta = {
  title: "Modules/Auth/ResetPasswordForm",
  component: ResetPasswordForm,
  decorators: [
    (Story) => (
      <div className="flex justify-center bg-background p-8">
        <AuthCard
          showBrand={false}
          heading="Nueva contraseña"
          description="Elige una contraseña segura para tu cuenta."
        >
          <Story />
        </AuthCard>
      </div>
    ),
  ],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: () => undefined,
  },
};

export const WithError: Story = {
  args: {
    errorMessage: "El enlace expiró. Solicita uno nuevo.",
    onSubmit: () => undefined,
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: () => undefined,
  },
};
