import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoginPage } from "./page";

const meta = {
  title: "Modules/Auth/LoginPage",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
