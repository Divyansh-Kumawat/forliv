import { FIELD_META } from "@/lib/patient-fields";
import { SEED_PATIENTS } from "@/lib/patient-seeds";
import type { Patient, PatientField } from "@/types/patient";

/**
 * Versioned: the demo records gained a sex and a full set of clinical values,
 * and a stored list from an earlier version would mask them. Bumping the key
 * loads the newer seeds instead of silently keeping sparse records.
 */
export const PATIENTS_STORAGE_KEY = "forlivf.patients.v2";

export { SEED_PATIENTS };

/** Used on the patient card, matching the source design. */
export const NO_DATA = "No Data";
/** Used in the detail view, matching the source design. */
export const EMPTY_MARK = "—";

export function createPatientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `patient-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function orNoData(value: string | null | undefined): string {
  return value && value.trim() ? value : NO_DATA;
}

/**
 * A 0–1 confidence renders as a percentage. The source design showed "0.90%",
 * which reads as nine-tenths of one percent — 0.90 is 90%.
 */
export function formatConfidence(score: number | null): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return NO_DATA;
  }
  return `${Math.round(score * 100)}%`;
}

/** Derived, never stored — height and weight are the source of truth. */
export function calculateBmi(
  heightCm: number | null,
  weightKg: number | null,
): number | null {
  if (!heightCm || !weightKg) return null;
  const metres = heightCm / 100;
  return Math.round((weightKg / (metres * metres)) * 10) / 10;
}

export function bmiCategory(value: number): string {
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Normal";
  if (value < 30) return "Overweight";
  return "Obese";
}

/** Renders any field for the read-only views, using its metadata. */
export function formatFieldValue(
  patient: Patient,
  field: PatientField,
): string {
  const meta = FIELD_META[field];
  const value = patient[field];

  if (meta.kind === "multiselect") {
    const list = Array.isArray(value) ? value : [];
    return list.length ? list.join(", ") : EMPTY_MARK;
  }

  if (meta.kind === "boolean") {
    if (value === null || value === undefined) return EMPTY_MARK;
    return value ? "Yes" : "No";
  }

  if (meta.kind === "percent") {
    if (typeof value !== "number") return EMPTY_MARK;
    return `${Math.round(value * 100)}%`;
  }

  if (value === null || value === undefined || value === "") return EMPTY_MARK;

  if (meta.kind === "select") {
    // Stored values can differ from their labels (e.g. "male" → "Male").
    const option = meta.options?.find((entry) => entry.value === value);
    return option?.label ?? String(value);
  }

  return meta.unit ? `${value} ${meta.unit}` : String(value);
}

/** Blank record used by the create form. */
export function emptyPatient(): Omit<Patient, "id" | "createdAt"> {
  return {
    patientId: "",
    name: null,
    sex: null,
    age: 0,
    spouseAge: null,
    contact: null,
    location: "",
    patientConcerns: [],
    heightCm: null,
    weightKg: null,
    bloodGroup: null,
    pregnancyLoss: null,
    geneticDisorders: [],
    previousIvfFailure: null,
    ivfOrIcsi: null,
    spermSource: null,
    collectionMethod: null,
    spermCount: null,
    spermMotility: null,
    dfi: null,
    spermMorphology: null,
    spermPrep: null,
    amhValue: null,
    m2Oocytes: null,
    triggerInjection: null,
    serumProgesterone: null,
    cultureMedia: null,
    etThickness: null,
    embryoCount: null,
    day3Embryos: null,
    day5Embryos: null,
    stageGrade: null,
    activeEmbryos: 0,
    selectedImplant: null,
    manualGrade: null,
    aiGrade: null,
    confidenceScore: null,
  };
}

/**
 * Fills in a sex for records saved without one, so they still get an analysis
 * workflow.
 *
 * Derived from the patient ID rather than drawn at random: this runs on every
 * read, so `Math.random()` here would flip a patient between sperm analysis and
 * embryo tracking on each refresh. Hashing the ID spreads patients across both
 * while keeping each one stable. An explicitly saved value always wins.
 */
function deriveSex(patientId: string): Patient["sex"] {
  if (!patientId) return null;

  let hash = 0;
  for (let index = 0; index < patientId.length; index += 1) {
    hash = (Math.imul(hash, 31) + patientId.charCodeAt(index)) >>> 0;
  }
  return hash % 2 === 0 ? "female" : "male";
}

/**
 * Records saved before the model grew are missing the newer keys. Merging over
 * a blank record keeps them readable instead of crashing the detail view.
 */
export function normalizePatient(raw: Partial<Patient>): Patient {
  const patientId = raw.patientId ?? "";

  return {
    ...emptyPatient(),
    ...raw,
    id: raw.id ?? createPatientId(),
    patientId,
    sex: raw.sex ?? deriveSex(patientId),
    createdAt: raw.createdAt ?? new Date(0).toISOString(),
    patientConcerns: Array.isArray(raw.patientConcerns)
      ? raw.patientConcerns
      : [],
    geneticDisorders: Array.isArray(raw.geneticDisorders)
      ? raw.geneticDisorders
      : [],
  };
}

export function readStoredPatients(): Patient[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
  if (!raw) return SEED_PATIENTS;

  try {
    const parsed = JSON.parse(raw) as Partial<Patient>[];
    if (!Array.isArray(parsed)) return SEED_PATIENTS;
    return parsed.map(normalizePatient);
  } catch {
    return SEED_PATIENTS;
  }
}

export function writeStoredPatients(patients: Patient[]): void {
  window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
}
