import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoansPage } from "./page";

const meta = {
  title: "Modules/Loans/Main",
  component: LoansPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoansPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
