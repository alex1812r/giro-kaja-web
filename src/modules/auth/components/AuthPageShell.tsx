import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

/** Layout centrado de pantallas de auth (login, recuperar, nueva clave). */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      {children}
    </main>
  );
}
