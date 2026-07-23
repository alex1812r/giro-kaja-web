import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AllDebtsPage } from "./page";

const meta = {
  title: "Modules/Debts/All",
  component: AllDebtsPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AllDebtsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
