"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { ThemeSwitch } from "./ThemeSwitch";

const meta = {
  title: "Shared/ThemeSwitch",
  component: ThemeSwitch,
} satisfies Meta<typeof ThemeSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemeSwitchDemo() {
  const [value, setValue] = useState<"light" | "dark">("light");

  return (
    <div className="max-w-md rounded-xl border border-border bg-surface p-5">
      <ThemeSwitch
        value={value}
        onChange={setValue}
        label="Modo oscuro"
        description="Usar tema oscuro en la app"
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    value: "light",
    onChange: () => undefined,
    label: "Modo oscuro",
  },
  render: () => <ThemeSwitchDemo />,
};
