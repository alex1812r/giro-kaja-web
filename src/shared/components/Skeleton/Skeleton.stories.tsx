import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./Skeleton";

const meta = {
  title: "Shared/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {
  args: {
    className: "h-16 w-64",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    className: "w-48",
  },
};

export const Circle: Story = {
  args: {
    variant: "circle",
  },
};
