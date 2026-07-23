import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CashRegisterPage } from "./page";

const meta = {
  title: "Modules/CashRegister/Main",
  component: CashRegisterPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CashRegisterPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
