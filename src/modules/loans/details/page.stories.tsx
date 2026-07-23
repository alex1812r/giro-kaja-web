import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoanDetailsPage } from "./page";

const meta = {
  title: "Modules/Loans/Detail",
  component: LoanDetailsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/loans/l1",
        segments: [["id", "l1"]],
      },
    },
  },
} satisfies Meta<typeof LoanDetailsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
