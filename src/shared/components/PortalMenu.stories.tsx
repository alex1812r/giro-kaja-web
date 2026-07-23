"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bell } from "lucide-react";

import { Button } from "@/shared/components/Button";

import { PortalMenu } from "./PortalMenu";

const meta = {
  title: "Shared/PortalMenu",
  component: PortalMenu,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PortalMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: () => null,
    children: () => null,
  },
  render: () => (
    <div className="flex justify-end p-8">
      <PortalMenu
        widthClassName="w-64"
        trigger={({ open, toggle, triggerProps }) => (
          <Button
            {...triggerProps}
            variant={open ? "secondary" : "ghost"}
            onClick={toggle}
            aria-label="Notificaciones"
          >
            <Bell className="size-4" />
            Menú
          </Button>
        )}
      >
        {({ close }) => (
          <div className="py-2">
            <p className="border-b border-border px-4 py-2 text-sm font-semibold">
              Opciones
            </p>
            <button
              type="button"
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-surface-muted"
              onClick={close}
            >
              Ver perfil
            </button>
            <button
              type="button"
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-danger hover:bg-danger/10"
              onClick={close}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </PortalMenu>
    </div>
  ),
};
