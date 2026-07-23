"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy route: create debt is a modal on `/debts`. */
export function NewDebtPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/debts?new=1");
  }, [router]);

  return null;
}
