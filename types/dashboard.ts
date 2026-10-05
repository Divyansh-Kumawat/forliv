export interface Metric {
  id: string;
  label: string;
  value: number;
  /** Percentage-point change vs. the previous period. */
  delta?: number;
  hint?: string;
}

export interface ScheduleDay {
  /** ISO date, e.g. "2026-08-14". */
  date: string;
  entries: ScheduleEntry[];
}

export interface ScheduleEntry {
  id: string;
  time: string;
  title: string;
  patient: string;
  kind: "retrieval" | "transfer" | "biopsy" | "assessment";
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface CycleRow {
  id: string;
  patient: string;
  protocol: string;
  day: number;
  embryos: number;
  status: "on-track" | "review" | "stimulation" | "cryo";
}
