import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { CurrencyProvider } from "@/shared/currency";

import { AppHeader } from "./AppHeader";

const meta = {
  title: "Shared/Layout/AppHeader",
  component: AppHeader,
  decorators: [
    (Story) => (
      <CurrencyProvider>
        <div className="min-h-40 bg-background">
          <Story />
        </div>
      </CurrencyProvider>
    ),
  ],
  args: {
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
        {
          organization: { id: "org-2", name: "Giro Norte" },
          role: "admin",
        },
      ],
      systemRole: null,
      isActive: true,
    },
    onOpenMenu: fn(),
    onSignOut: fn(),
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
