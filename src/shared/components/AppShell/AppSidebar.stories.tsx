import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { appNavItems } from "./appShellNav";
import { AppSidebar } from "./AppSidebar";

const meta = {
  title: "Shared/Layout/AppSidebar",
  component: AppSidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-dvh bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    currentPath: "/loans",
    items: appNavItems,
  },
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HomeActive: Story = {
  args: {
    currentPath: "/",
  },
};
