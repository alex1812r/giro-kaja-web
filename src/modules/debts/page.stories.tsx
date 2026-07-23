import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DebtsPage } from "./page";

const meta = {
  title: "Modules/Debts/Main",
  component: DebtsPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DebtsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
