export type AnalysisSource = "upload" | "live";
export type AnalysisStatus = "processing" | "complete";

export interface SpermAnalysis {
  id: string;
  /** Clinic-facing patient identifier this sample belongs to. */
  patientId: string;
  sampleName: string;
  source: AnalysisSource;
  status: AnalysisStatus;
  /**
   * A downscaled still from the sample — a frame grabbed from the video, or the
   * image itself. Null when the browser couldn't decode the container.
   */
  imageSrc: string | null;
  createdAt: string;

  // Results, populated once the run completes.
  concentration: number | null; // million/mL
  motility: number | null; // % progressive
  morphology: number | null; // % normal forms
  dfi: number | null; // % fragmentation
  /** Model confidence, 0–1. */
  confidence: number | null;
}

/** The blastocyst structures the annotation step segments. */
export type EmbryoStructure = "icm" | "te" | "zp" | "blastocoel";

/** A region, normalised to the annotation box so it survives any render size. */
export interface Region {
  cx: number;
  cy: number;
  r: number;
}

export type EmbryoAnnotations = Partial<Record<EmbryoStructure, Region>>;

export interface Embryo {
  id: string;
  patientId: string;
  /** Dish label, e.g. "EMB001". */
  label: string;
  imageName: string;
  /**
   * Either a `/assets/...` path (seed records) or a downscaled JPEG data URL
   * (uploads) — the original file is far too large to persist.
   */
  imageSrc: string | null;
  day: number;
  stage: string;
  gradingSystem: string;

  annotations: EmbryoAnnotations;

  /** Gardner components, when that system is used. */
  expansion: string | null;
  icmGrade: string | null;
  teGrade: string | null;
  /** The composed manual grade, e.g. "4AB". */
  manualGrade: string | null;

  aiGrade: string | null;
  /** Predicted viability, 0–1. */
  viability: number | null;
  /** Model confidence, 0–1. */
  confidence: number | null;

  createdAt: string;
}

export type NewEmbryoInput = Omit<Embryo, "id" | "createdAt">;
