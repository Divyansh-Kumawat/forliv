import type { CycleRow, Metric, ScheduleEntry, SeriesPoint } from "@/types/dashboard";

/** Placeholder data. Replace each export with an API call as endpoints land. */

export const METRICS: Metric[] = [
  {
    id: "embryos",
    label: "Embryos under evaluation",
    value: 24,
    delta: 8.4,
    hint: "Across 6 active culture dishes",
  },
  {
    id: "patients",
    label: "Active patients in cycle",
    value: 15,
    delta: -2.1,
    hint: "4 in stimulation, 11 post-retrieval",
  },
  {
    id: "procedures",
    label: "Procedures scheduled today",
    value: 3,
    delta: 0,
    hint: "2 retrievals, 1 transfer",
  },
];

/** Clinical pregnancy rate by month, in percent. */
export const SUCCESS_RATE: SeriesPoint[] = [
  { label: "Jan", value: 41 },
  { label: "Feb", value: 44 },
  { label: "Mar", value: 43 },
  { label: "Apr", value: 52 },
  { label: "May", value: 49 },
  { label: "Jun", value: 55 },
  { label: "Jul", value: 58 },
  { label: "Aug", value: 54 },
  { label: "Sep", value: 61 },
  { label: "Oct", value: 64 },
  { label: "Nov", value: 62 },
  { label: "Dec", value: 68 },
];

/** Keyed by offset from today, so the strip always looks current. */
export const SCHEDULE_BY_DAY_OFFSET: Record<number, ScheduleEntry[]> = {
  0: [
    {
      id: "s1",
      time: "09:30",
      title: "Oocyte retrieval",
      patient: "Patient #A-2291",
      kind: "retrieval",
    },
    {
      id: "s2",
      time: "11:15",
      title: "Day 5 grading",
      patient: "Patient #A-2264",
      kind: "assessment",
    },
    {
      id: "s3",
      time: "15:00",
      title: "Frozen embryo transfer",
      patient: "Patient #A-2188",
      kind: "transfer",
    },
  ],
  1: [
    {
      id: "s4",
      time: "10:00",
      title: "Trophectoderm biopsy",
      patient: "Patient #A-2301",
      kind: "biopsy",
    },
  ],
  3: [
    {
      id: "s5",
      time: "08:45",
      title: "Oocyte retrieval",
      patient: "Patient #A-2312",
      kind: "retrieval",
    },
    {
      id: "s6",
      time: "13:30",
      title: "Fertilisation check",
      patient: "Patient #A-2312",
      kind: "assessment",
    },
  ],
};

export const ACTIVE_CYCLES: CycleRow[] = [
  {
    id: "c1",
    patient: "Patient #A-2291",
    protocol: "Antagonist",
    day: 12,
    embryos: 8,
    status: "on-track",
  },
  {
    id: "c2",
    patient: "Patient #A-2264",
    protocol: "Long agonist",
    day: 5,
    embryos: 5,
    status: "review",
  },
  {
    id: "c3",
    patient: "Patient #A-2312",
    protocol: "Antagonist",
    day: 9,
    embryos: 0,
    status: "stimulation",
  },
  {
    id: "c4",
    patient: "Patient #A-2188",
    protocol: "Natural FET",
    day: 18,
    embryos: 3,
    status: "cryo",
  },
  {
    id: "c5",
    patient: "Patient #A-2255",
    protocol: "Mild stimulation",
    day: 7,
    embryos: 6,
    status: "on-track",
  },
];

export const CYCLE_STATUS_LABEL: Record<CycleRow["status"], string> = {
  "on-track": "On track",
  review: "Needs review",
  stimulation: "Stimulation",
  cryo: "Cryopreserved",
};
