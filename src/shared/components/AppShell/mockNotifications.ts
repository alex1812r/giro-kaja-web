export type ShellNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

/** Placeholder hasta cablear GET /api/notifications. */
export const mockRecentNotifications: ShellNotification[] = [
  {
    id: "1",
    title: "Pago vencido",
    body: "María García tiene un cobro pendiente.",
    createdAt: "Hace 2 h",
    read: false,
  },
  {
    id: "2",
    title: "Pago recibido",
    body: "Juan Pérez — préstamo #1024.",
    createdAt: "Ayer",
    read: false,
  },
  {
    id: "3",
    title: "Nuevo préstamo",
    body: "Se registró un préstamo a Ana Torres.",
    createdAt: "Hace 2 días",
    read: true,
  },
];
