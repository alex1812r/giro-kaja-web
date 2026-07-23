import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/shared/components/Button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

const meta = {
  title: "Shared/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Tema</CardTitle>
        <CardDescription>Apariencia y visualización</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary">
          Contenido de la tarjeta. Usa tokens de superficie y borde.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Preferencias</CardTitle>
        <CardDescription>Hay cambios sin guardar</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-main">Modo oscuro e idioma listos para guardar.</p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="secondary">Descartar</Button>
        <Button>Guardar cambios</Button>
      </CardFooter>
    </Card>
  ),
};
