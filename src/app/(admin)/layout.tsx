import type { ReactNode } from "react";

import { AdminAppShell } from "@/shared/components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
