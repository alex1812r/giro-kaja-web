import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomePage } from "./page";

const meta = {
  title: "Modules/Home/Dashboard",
  component: HomePage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
