/**
 * Select-backed fields are typed as plain strings rather than unions: the valid
 * values live in one place (`lib/patient-fields.ts`) and drive both the form and
 * the detail view, so duplicating them as types would be two sources of truth.
 */
export interface Patient {
  /** Internal record key. */
  id: string;
  /** Clinic-facing identifier, unique, used in the URL. */
  patientId: string;
  createdAt: string;

  // Demographics
  name: string | null;
  /** Decides which analysis workflow the record offers. */
  sex: "male" | "female" | null;
  age: number;
  spouseAge: number | null;
  contact: string | null;
  location: string;
  patientConcerns: string[];

  // Vitals — BMI is derived from height and weight, never stored.
  heightCm: number | null;
  weightKg: number | null;
  bloodGroup: string | null;

  // Reproductive history
  pregnancyLoss: number | null;
  geneticDisorders: string[];
  previousIvfFailure: boolean | null;
  ivfOrIcsi: string | null;

  // Andrology (sperm data)
  spermSource: string | null;
  collectionMethod: string | null;
  spermCount: number | null;
  spermMotility: number | null;
  dfi: number | null;
  spermMorphology: string | null;
  spermPrep: string | null;

  // Oocyte & stimulation
  amhValue: number | null;
  m2Oocytes: number | null;
  triggerInjection: string | null;
  serumProgesterone: number | null;

  // Embryology & transfer
  cultureMedia: string | null;
  etThickness: number | null;
  embryoCount: number | null;
  day3Embryos: number | null;
  day5Embryos: number | null;
  stageGrade: string | null;

  // Cycle summary, surfaced on the patient card
  activeEmbryos: number;
  selectedImplant: string | null;
  manualGrade: string | null;
  aiGrade: string | null;
  confidenceScore: number | null;
}

export type NewPatientInput = Omit<Patient, "id" | "createdAt">;

/** Every editable field name. */
export type PatientField = keyof NewPatientInput;
