import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ForgotPasswordPage } from "./page";

const meta = {
  title: "Modules/Auth/ForgotPasswordPage",
  component: ForgotPasswordPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
