import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ResetPasswordPage } from "./page";

const meta = {
  title: "Modules/Auth/ResetPasswordPage",
  component: ResetPasswordPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ResetPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
