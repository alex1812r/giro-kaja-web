import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AllLoansPage } from "./page";

const meta = {
  title: "Modules/Loans/All",
  component: AllLoansPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AllLoansPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
