"use client";

import { useCallback, useMemo, useState } from "react";

import { resolveDateRange, toDateInputValue } from "./dateRangeUtils";
import type { DateRangeFilterState, DateRangePreset } from "./types";

export function useDateRangeFilter(initialPreset: DateRangePreset = "1m") {
  const [preset, setPresetState] = useState<DateRangePreset>(initialPreset);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const setPreset = useCallback((next: DateRangePreset) => {
    setPresetState(next);
  }, []);

  const setCustomRange = useCallback((start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setPresetState("custom");
  }, []);

  const state: DateRangeFilterState = useMemo(
    () => ({
      preset,
      customStart: customStart || undefined,
      customEnd: customEnd || undefined,
    }),
    [preset, customStart, customEnd],
  );

  const range = useMemo(() => resolveDateRange(state), [state]);

  return {
    preset,
    customStart,
    customEnd,
    setPreset,
    setCustomRange,
    range,
    from: toDateInputValue(range.start),
    to: toDateInputValue(range.end),
  };
}
