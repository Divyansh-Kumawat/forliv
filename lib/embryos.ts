import type { Embryo, EmbryoStructure } from "@/types/analysis";

export const EMBRYOS_STORAGE_KEY = "forlivf.embryos.v2";

/** The wizard takes a single still image, matching the source design. */
export const ACCEPTED_IMAGE_TYPES = ".png,.jpg,.jpeg,.gif";
export const MAX_EMBRYO_UPLOAD_MB = 10;

export const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
  value: String(day),
  label: `Day ${day}`,
}));

export const GRADING_SYSTEMS = [
  { value: "gardner", label: "Gardner's grading" },
  { value: "sart", label: "SART" },
  { value: "istanbul", label: "Istanbul consensus" },
];

/** Gardner components. */
export const EXPANSION_OPTIONS = [
  { value: "1", label: "1 — Early blastocyst" },
  { value: "2", label: "2 — Blastocyst" },
  { value: "3", label: "3 — Full blastocyst" },
  { value: "4", label: "4 — Expanded" },
  { value: "5", label: "5 — Hatching" },
  { value: "6", label: "6 — Hatched" },
];

export const ABC_OPTIONS = [
  { value: "A", label: "A — Good" },
  { value: "B", label: "B — Fair" },
  { value: "C", label: "C — Poor" },
];

/** Overall grade options for the non-Gardner systems. */
export const OVERALL_GRADE_OPTIONS: Record<
  string,
  { value: string; label: string }[]
> = {
  sart: [
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Poor", label: "Poor" },
  ],
  istanbul: [
    { value: "Grade 1", label: "Grade 1" },
    { value: "Grade 2", label: "Grade 2" },
    { value: "Grade 3", label: "Grade 3" },
    { value: "Grade 4", label: "Grade 4" },
  ],
};

export const EMBRYO_STAGES = [
  "2 Cell",
  "4 Cell",
  "8 Cell",
  "Morula",
  "Early blastocyst",
  "Blastocyst",
  "Expanded blastocyst",
];

/**
 * The four structures the annotation step segments.
 *
 * Colours are a validated categorical set (worst adjacent CVD ΔE 13.6, well
 * above the ΔE 8 floor), so the regions stay tellable apart for colour-blind
 * readers. Each region also carries its label, so colour is never the only cue.
 */
export const EMBRYO_STRUCTURES: {
  id: EmbryoStructure;
  label: string;
  full: string;
  color: string;
}[] = [
  { id: "icm", label: "ICM", full: "Inner cell mass", color: "#D97706" },
  { id: "te", label: "TE", full: "Trophectoderm", color: "#0891B2" },
  { id: "zp", label: "ZP", full: "Zona pellucida", color: "#9333EA" },
  {
    id: "blastocoel",
    label: "Blastocoel",
    full: "Blastocoel cavity",
    color: "#65A30D",
  },
];

export function createEmbryoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `embryo-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Next free EMB label for a patient, e.g. EMB003. */
export function nextEmbryoLabel(existing: Embryo[]): string {
  const numbers = existing
    .map((embryo) => Number(embryo.label.replace(/\D/g, "")))
    .filter((value) => !Number.isNaN(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `EMB${String(next).padStart(3, "0")}`;
}

export function stageForDay(day: number): string {
  if (day <= 2) return "4 Cell";
  if (day === 3) return "8 Cell";
  if (day === 4) return "Morula";
  if (day === 5) return "Blastocyst";
  return "Expanded blastocyst";
}

/**
 * Stand-in for the grading model. It reads the annotations only to stay
 * plausible — swap the whole function for the real inference call.
 */
export function simulateGrading(annotatedCount: number): {
  aiGrade: string;
  viability: number;
  confidence: number;
} {
  const grades = [
    "Blastocyst Grade A",
    "Blastocyst Grade B",
    "Blastocyst Grade C",
    "8 Cells Grade A",
  ];
  // More annotated structures → a more confident stand-in result.
  const confidence = Math.min(0.97, 0.62 + annotatedCount * 0.09);

  return {
    aiGrade: grades[Math.floor(Math.random() * grades.length)],
    viability: Math.round((0.55 + Math.random() * 0.42) * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
  };
}

function seedEmbryo(
  id: string,
  patientId: string,
  label: string,
  overrides: Partial<Embryo>,
): Embryo {
  return {
    id,
    patientId,
    label,
    imageName: "dish-day5.png",
    imageSrc: null,
    day: 5,
    stage: "Blastocyst",
    gradingSystem: "gardner",
    annotations: {},
    expansion: null,
    icmGrade: null,
    teGrade: null,
    manualGrade: null,
    aiGrade: null,
    viability: null,
    confidence: null,
    createdAt: "2026-08-06T08:30:00.000Z",
    ...overrides,
  };
}

/**
 * Placeholder artwork under `public/assets/embryos` — stylised illustrations,
 * not real micrographs. Swap for clinical imagery when it's available.
 */
export const SEED_EMBRYOS: Embryo[] = [
  seedEmbryo("seed-e1", "1010B2L", "EMB001", {
    imageName: "blastocyst-expanded.svg",
    imageSrc: "/assets/embryos/blastocyst-expanded.svg",
    day: 5,
    stage: "Expanded blastocyst",
    expansion: "4",
    icmGrade: "A",
    teGrade: "A",
    manualGrade: "4AA",
    aiGrade: "Blastocyst Grade A",
    viability: 0.92,
    confidence: 0.94,
    annotations: {
      zp: { cx: 50, cy: 50, r: 39 },
      te: { cx: 50, cy: 50, r: 34 },
      blastocoel: { cx: 47, cy: 45, r: 26 },
      icm: { cx: 48, cy: 55, r: 12 },
    },
  }),
  seedEmbryo("seed-e2", "1010B2L", "EMB002", {
    imageName: "blastocyst.svg",
    imageSrc: "/assets/embryos/blastocyst.svg",
    day: 5,
    stage: "Blastocyst",
    expansion: "3",
    icmGrade: "B",
    teGrade: "B",
    manualGrade: "3BB",
    aiGrade: "Blastocyst Grade A",
    viability: 0.78,
    confidence: 0.88,
    annotations: {
      zp: { cx: 50, cy: 50, r: 37 },
      te: { cx: 50, cy: 50, r: 30 },
      icm: { cx: 56, cy: 52, r: 13 },
    },
  }),
  seedEmbryo("seed-e3", "1010B2L", "EMB003", {
    imageName: "cleavage-8cell.svg",
    imageSrc: "/assets/embryos/cleavage-8cell.svg",
    day: 3,
    stage: "8 Cell",
    gradingSystem: "istanbul",
    manualGrade: "Grade 2",
    aiGrade: "8 Cells Grade A",
    viability: 0.64,
    confidence: 0.81,
    createdAt: "2026-08-04T09:10:00.000Z",
    annotations: {
      zp: { cx: 50, cy: 50, r: 37 },
    },
  }),
  seedEmbryo("seed-e4", "1012B2L", "EMB001", {
    imageName: "blastocyst-early.svg",
    imageSrc: "/assets/embryos/blastocyst-early.svg",
    day: 5,
    stage: "Blastocyst",
    expansion: "3",
    icmGrade: "B",
    teGrade: "C",
    manualGrade: "3BC",
    aiGrade: "Blastocyst Grade B",
    viability: 0.71,
    confidence: 0.85,
    createdAt: "2026-08-05T14:00:00.000Z",
    annotations: {
      zp: { cx: 50, cy: 50, r: 36 },
      blastocoel: { cx: 42, cy: 44, r: 14 },
    },
  }),
];

export function readStoredEmbryos(): Embryo[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(EMBRYOS_STORAGE_KEY);
  if (!raw) return SEED_EMBRYOS;

  try {
    const parsed = JSON.parse(raw) as Embryo[];
    return Array.isArray(parsed) ? parsed : SEED_EMBRYOS;
  } catch {
    return SEED_EMBRYOS;
  }
}

export function writeStoredEmbryos(embryos: Embryo[]): void {
  try {
    window.localStorage.setItem(EMBRYOS_STORAGE_KEY, JSON.stringify(embryos));
  } catch {
    // Quota exceeded — drop the thumbnails rather than lose the records.
    const withoutImages = embryos.map((embryo) => ({
      ...embryo,
      imageSrc: null,
    }));
    window.localStorage.setItem(
      EMBRYOS_STORAGE_KEY,
      JSON.stringify(withoutImages),
    );
  }
}
