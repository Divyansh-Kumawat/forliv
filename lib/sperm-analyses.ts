import type { AnalysisSource, SpermAnalysis } from "@/types/analysis";

export const SPERM_ANALYSES_STORAGE_KEY = "forlivf.sperm-analyses.v2";

/** Stills are accepted alongside video so a single frame can be analysed. */
export const ACCEPTED_VIDEO_TYPES = ".mp4,.avi,.mov,.mkv,.png,.jpg,.jpeg";
export const MAX_UPLOAD_MB = 500;

export function createAnalysisId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `analysis-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/**
 * Stand-in for the inference service. Values sit in clinically plausible ranges
 * so the UI can be reviewed; replace this call with the real API.
 */
export function simulateResults(): Pick<
  SpermAnalysis,
  "concentration" | "motility" | "morphology" | "dfi" | "confidence"
> {
  const pick = (min: number, max: number, decimals = 0) => {
    const value = min + Math.random() * (max - min);
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  };

  return {
    concentration: pick(12, 90, 1),
    motility: pick(28, 72),
    morphology: pick(2, 14),
    dfi: pick(5, 30),
    confidence: pick(0.78, 0.97, 2),
  };
}

export function newAnalysis(
  patientId: string,
  sampleName: string,
  source: AnalysisSource,
  imageSrc: string | null,
): SpermAnalysis {
  return {
    id: createAnalysisId(),
    patientId,
    sampleName,
    source,
    status: "processing",
    imageSrc,
    createdAt: new Date().toISOString(),
    concentration: null,
    motility: null,
    morphology: null,
    dfi: null,
    confidence: null,
  };
}

/** WHO 2021 lower reference limits, used only to tint the result tiles. */
export const REFERENCE_LIMITS = {
  concentration: 16,
  motility: 30,
  morphology: 4,
} as const;

export const SEED_ANALYSES: SpermAnalysis[] = [
  {
    id: "seed-a1",
    patientId: "1011B2L",
    sampleName: "sample-2026-08-09.mp4",
    source: "upload",
    status: "complete",
    imageSrc: null,
    createdAt: "2026-08-09T10:15:00.000Z",
    concentration: 55.2,
    motility: 61,
    morphology: 9,
    dfi: 12,
    confidence: 0.93,
  },
  {
    id: "seed-a2",
    patientId: "1011B2L",
    sampleName: "live-capture-01",
    source: "live",
    status: "complete",
    imageSrc: null,
    createdAt: "2026-07-28T09:05:00.000Z",
    concentration: 48.7,
    motility: 54,
    morphology: 7,
    dfi: 15,
    confidence: 0.88,
  },
  {
    id: "seed-a3",
    patientId: "1233",
    sampleName: "sample-2026-08-02.mov",
    source: "upload",
    status: "complete",
    imageSrc: null,
    createdAt: "2026-08-02T11:40:00.000Z",
    concentration: 22.4,
    motility: 33,
    morphology: 3,
    dfi: 26,
    confidence: 0.81,
  },
];

export function readStoredAnalyses(): SpermAnalysis[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(SPERM_ANALYSES_STORAGE_KEY);
  if (!raw) return SEED_ANALYSES;

  try {
    const parsed = JSON.parse(raw) as SpermAnalysis[];
    return Array.isArray(parsed) ? parsed : SEED_ANALYSES;
  } catch {
    return SEED_ANALYSES;
  }
}

export function writeStoredAnalyses(analyses: SpermAnalysis[]): void {
  try {
    window.localStorage.setItem(
      SPERM_ANALYSES_STORAGE_KEY,
      JSON.stringify(analyses),
    );
  } catch {
    // Quota exceeded — drop the stills rather than lose the results.
    window.localStorage.setItem(
      SPERM_ANALYSES_STORAGE_KEY,
      JSON.stringify(analyses.map((entry) => ({ ...entry, imageSrc: null }))),
    );
  }
}
