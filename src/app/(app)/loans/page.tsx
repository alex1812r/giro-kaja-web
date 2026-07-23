import { Suspense } from "react";

import { LoansPage } from "@/modules/loans/page";
import { LoansPageSkeleton } from "@/modules/loans/components/LoansPageSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<LoansPageSkeleton />}>
      <LoansPage />
    </Suspense>
  );
}
