import type { ReactNode } from "react";

import { AuthenticatedAppShell } from "@/shared/components/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}
