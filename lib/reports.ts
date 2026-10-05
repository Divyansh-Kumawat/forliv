import type { Embryo } from "@/types/analysis";

export type GradingMode = "both" | "ai" | "manual";

export const GRADING_MODES: { id: GradingMode; label: string }[] = [
  { id: "both", label: "AI & manual" },
  { id: "ai", label: "AI only" },
  { id: "manual", label: "Manual only" },
];

export const REPORT_SECTIONS = [
  { id: "summary", label: "Cycle summary" },
  { id: "embryos", label: "Embryo analysis" },
  { id: "sperm", label: "Semen analysis" },
] as const;

export type ReportSection = (typeof REPORT_SECTIONS)[number]["id"];

/**
 * Score out of 10, derived from the stored viability rather than invented — a
 * separate "score" the model never produced would be a fabricated number.
 */
export function embryoScore(embryo: Embryo): number | null {
  if (embryo.viability === null) return null;
  return Math.round(embryo.viability * 100) / 10;
}

export type Decision = "accept" | "review" | "discard" | "pending";

export const DECISION_LABEL: Record<Decision, string> = {
  accept: "Accept",
  review: "Review",
  discard: "Discard",
  pending: "Not scored",
};

/** Status tokens, always paired with the label above — never colour alone. */
export const DECISION_STYLE: Record<Decision, string> = {
  accept: "bg-good/10 text-good",
  review: "bg-warning/10 text-warning",
  discard: "bg-critical/10 text-critical",
  pending: "bg-surface-muted text-ink-soft",
};

export function embryoDecision(score: number | null): Decision {
  if (score === null) return "pending";
  if (score >= 7) return "accept";
  if (score >= 5) return "review";
  return "discard";
}

/** Which grades a record actually carries, for the Remarks column. */
export function gradeRemark(embryo: Embryo): string {
  if (embryo.manualGrade && embryo.aiGrade) return "AI & manual";
  if (embryo.aiGrade) return "AI only";
  if (embryo.manualGrade) return "Manual only";
  return "Ungraded";
}

/** Highest score first; unscored records sink to the bottom. */
export function byScoreDesc(a: Embryo, b: Embryo): number {
  return (embryoScore(b) ?? -1) - (embryoScore(a) ?? -1);
}
