import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DebtDetailsPage } from "./page";

const meta = {
  title: "Modules/Debts/Detail",
  component: DebtDetailsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/debts/d1",
        params: { id: "d1" },
      },
    },
  },
} satisfies Meta<typeof DebtDetailsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
