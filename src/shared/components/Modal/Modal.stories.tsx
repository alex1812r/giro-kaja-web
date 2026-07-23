"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "@/shared/components/Button";

import { Modal } from "./Modal";

const meta = {
  title: "Shared/Modal",
  component: Modal,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmar acción"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setOpen(false)}>Confirmar</Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Este es un diálogo reutilizable con portal, overlay y cierre con Escape.
        </p>
      </Modal>
    </>
  );
}

export const Default: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    title: "Modal",
    children: null,
  },
  render: () => <ModalDemo />,
};
