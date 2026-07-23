"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy route: create loan is a modal on `/loans`.
 */
export function NewLoanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/loans?new=1");
  }, [router]);

  return null;
}
