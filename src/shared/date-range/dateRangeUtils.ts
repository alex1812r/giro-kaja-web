import type {
  DateRange,
  DateRangeDirection,
  DateRangeFilterState,
  DateRangePreset,
} from "./types";

function presetDays(preset: Exclude<DateRangePreset, "custom">): number {
  if (preset === "1m") return 30;
  if (preset === "3m") return 90;
  return 180;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getRangeForPreset(
  preset: Exclude<DateRangePreset, "custom">,
  direction: DateRangeDirection = "past",
): DateRange {
  const days = presetDays(preset);

  if (direction === "future") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - days);
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

export function resolveDateRange(
  state: DateRangeFilterState,
  direction: DateRangeDirection = "past",
): DateRange {
  if (state.preset === "custom" && state.customStart && state.customEnd) {
    return getRangeForCustom(state.customStart, state.customEnd);
  }

  if (state.preset === "1m" || state.preset === "3m" || state.preset === "6m") {
    return getRangeForPreset(state.preset, direction);
  }

  return getRangeForPreset("1m", direction);
}
