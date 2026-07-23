"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

import { AppShell } from "./AppShell";

const meta = {
  title: "Shared/Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    currentPath: "/",
    user: {
      id: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "owner",
      organization: { id: "org-1", name: "Alex Rivera" },
      memberships: [
        {
          organization: { id: "org-1", name: "Alex Rivera" },
          role: "owner",
        },
      ],
      systemRole: null,
      isActive: true,
    },
    onSignOut: fn(),
    children: <ModulePlaceholder title="Inicio" />,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {};

export const LoansActive: Story = {
  args: {
    currentPath: "/loans",
    children: <ModulePlaceholder title="Préstamos" />,
  },
};

export const Settings: Story = {
  args: {
    currentPath: "/settings",
    children: <ModulePlaceholder title="Ajustes" />,
  },
};
