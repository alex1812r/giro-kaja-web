import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Landmark } from "lucide-react";

import { MetricCard } from "./MetricCard";

const meta = {
  title: "Modules/Home/MetricCard",
  component: MetricCard,
  args: {
    label: "Capital en caja",
    value: "$45,280.50",
    icon: Landmark,
    iconClassName: "text-primary",
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Danger: Story = {
  args: {
    label: "Alertas de mora",
    value: "3",
    tone: "danger",
  },
};
