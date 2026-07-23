import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthCard } from "@/modules/auth/components";

import { LoginForm } from "./LoginForm";

const meta = {
  title: "Modules/Auth/LoginForm",
  component: LoginForm,
  decorators: [
    (Story) => (
      <div className="flex justify-center bg-background p-8">
        <AuthCard>
          <Story />
        </AuthCard>
      </div>
    ),
  ],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: () => undefined,
  },
};

export const WithError: Story = {
  args: {
    errorMessage: "Correo o contraseña incorrectos.",
    onSubmit: () => undefined,
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: () => undefined,
  },
};
