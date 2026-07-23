"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function formatClock(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}/${month}/${year} ${time}`;
}

export function HeaderClock() {
  const { t } = useTranslation();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time
      dateTime={now?.toISOString()}
      className="hidden rounded-full bg-primary-container px-3 py-1.5 font-headline text-sm font-medium tabular-nums text-on-primary-container md:inline-flex"
      aria-label={t("shell.currentDateTime")}
    >
      {now ? formatClock(now) : "——/——/—— ——:—— ——"}
    </time>
  );
}
