export type DateRangePreset = "1m" | "3m" | "6m" | "custom";

export type DateRange = {
  start: Date;
  end: Date;
};

export type DateRangeFilterState = {
  preset: DateRangePreset;
  customStart?: string;
  customEnd?: string;
};
