import type { DateRange, DateRangeFilterState, DateRangePreset } from "./types";

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getRangeForPreset(preset: Exclude<DateRangePreset, "custom">): DateRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  if (preset === "1m") {
    start.setDate(start.getDate() - 30);
  } else if (preset === "3m") {
    start.setDate(start.getDate() - 90);
  } else {
    start.setDate(start.getDate() - 180);
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

export function getRangeForCustom(startISO: string, endISO: string): DateRange {
  const start = new Date(startISO);
  const end = new Date(endISO);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return getRangeForPreset("1m");
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }

  return { start, end };
}

export function resolveDateRange(state: DateRangeFilterState): DateRange {
  if (state.preset === "custom" && state.customStart && state.customEnd) {
    return getRangeForCustom(state.customStart, state.customEnd);
  }

  if (state.preset === "1m" || state.preset === "3m" || state.preset === "6m") {
    return getRangeForPreset(state.preset);
  }

  return getRangeForPreset("1m");
}
