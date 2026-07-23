export type DateRangePreset = "1m" | "3m" | "6m" | "custom";

/** past = last N days (history); future = next N days (upcoming cutoffs). */
export type DateRangeDirection = "past" | "future";

export type DateRange = {
  start: Date;
  end: Date;
};

export type DateRangeFilterState = {
  preset: DateRangePreset;
  customStart?: string;
  customEnd?: string;
};
