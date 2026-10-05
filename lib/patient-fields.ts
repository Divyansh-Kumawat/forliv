import type { PatientField } from "@/types/patient";

export interface FieldOption {
  value: string;
  label: string;
}

export type FieldKind =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  /** Entered as a whole percentage, stored as a 0–1 fraction. */
  | "percent";

export interface FieldMeta {
  label: string;
  kind: FieldKind;
  /** Rendered after the label, e.g. "(ng/mL)". */
  unit?: string;
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** Spans both columns of the two-up form grid. */
  full?: boolean;
}

const toOptions = (values: string[]): FieldOption[] =>
  values.map((value) => ({ value, label: value }));

export const GRADE_OPTIONS = toOptions([
  "Blastocyst Grade A",
  "Blastocyst Grade B",
  "Blastocyst Grade C",
  "8 Cells Grade A",
  "8 Cells Grade B",
  "Morula",
]);

export const BLOOD_GROUPS = toOptions([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

export const PATIENT_CONCERNS = toOptions([
  "PCOS",
  "Endometriosis",
  "Male factor",
  "Unexplained infertility",
  "Tubal factor",
  "Low ovarian reserve",
  "Fibroids",
  "Thyroid disorder",
]);

export const GENETIC_DISORDERS = toOptions([
  "Thalassemia",
  "Cystic fibrosis",
  "Sickle cell",
  "Fragile X",
  "Chromosomal translocation",
  "BRCA carrier",
]);

/**
 * One definition per field, shared by the edit form and the detail view — the
 * label, unit and option list can never drift between the two.
 */
export const FIELD_META: Record<PatientField, FieldMeta> = {
  // Demographics
  patientId: {
    label: "Patient ID",
    kind: "text",
    placeholder: "1001B2L",
    required: true,
  },
  name: { label: "Name", kind: "text", placeholder: "Full name" },
  sex: {
    label: "Sex",
    kind: "select",
    options: [
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
    ],
  },
  age: {
    label: "Patient age",
    kind: "number",
    placeholder: "30",
    required: true,
    min: 1,
    max: 120,
  },
  spouseAge: {
    label: "Spouse age",
    kind: "number",
    placeholder: "35",
    min: 1,
    max: 120,
  },
  contact: {
    label: "Contact",
    kind: "text",
    placeholder: "+91 98765 43210",
  },
  location: {
    label: "Location",
    kind: "text",
    placeholder: "Hyderabad",
    required: true,
  },
  patientConcerns: {
    label: "Patient concerns",
    kind: "multiselect",
    options: PATIENT_CONCERNS,
    full: true,
  },

  // Vitals
  heightCm: {
    label: "Height",
    unit: "cm",
    kind: "number",
    placeholder: "162",
    min: 50,
    max: 250,
  },
  weightKg: {
    label: "Weight",
    unit: "kg",
    kind: "number",
    placeholder: "58",
    min: 20,
    max: 300,
    step: 0.1,
  },
  bloodGroup: {
    label: "Blood group",
    kind: "select",
    options: BLOOD_GROUPS,
  },

  // Reproductive history
  pregnancyLoss: {
    label: "Pregnancy loss",
    kind: "number",
    placeholder: "0",
    min: 0,
    max: 20,
  },
  geneticDisorders: {
    label: "Genetic disorders",
    kind: "multiselect",
    options: GENETIC_DISORDERS,
    full: true,
  },
  previousIvfFailure: { label: "Previous IVF failure", kind: "boolean" },
  ivfOrIcsi: {
    label: "IVF or ICSI",
    kind: "select",
    options: toOptions(["IVF", "ICSI", "IVF + ICSI"]),
  },

  // Andrology
  spermSource: {
    label: "Sperm source",
    kind: "select",
    options: toOptions(["Ejaculate", "TESA", "PESA", "TESE", "Donor"]),
  },
  collectionMethod: {
    label: "Collection method",
    kind: "select",
    options: toOptions([
      "Masturbation",
      "Surgical retrieval",
      "Electroejaculation",
      "Donor sample",
    ]),
  },
  spermCount: {
    label: "Sperm count",
    unit: "million/mL",
    kind: "number",
    placeholder: "42",
    min: 0,
    step: 0.1,
  },
  spermMotility: {
    label: "Progressive motility",
    unit: "%",
    kind: "number",
    placeholder: "48",
    min: 0,
    max: 100,
  },
  dfi: {
    label: "DFI",
    unit: "%",
    kind: "number",
    placeholder: "18",
    min: 0,
    max: 100,
    step: 0.1,
  },
  spermMorphology: {
    label: "Sperm morphology",
    kind: "select",
    options: toOptions([
      "Normal",
      "Mild teratozoospermia",
      "Moderate teratozoospermia",
      "Severe teratozoospermia",
    ]),
  },
  spermPrep: {
    label: "Sperm prep",
    kind: "select",
    options: toOptions([
      "Density gradient",
      "Swim-up",
      "Simple wash",
      "MACS",
      "PICSI",
    ]),
  },

  // Oocyte & stimulation
  amhValue: {
    label: "AMH value",
    unit: "ng/mL",
    kind: "number",
    placeholder: "2.4",
    min: 0,
    step: 0.01,
  },
  m2Oocytes: {
    label: "M2 oocytes",
    kind: "number",
    placeholder: "8",
    min: 0,
  },
  triggerInjection: {
    label: "Trigger injection",
    kind: "select",
    options: toOptions(["hCG", "GnRH agonist", "Dual trigger"]),
  },
  serumProgesterone: {
    label: "Serum progesterone",
    unit: "ng/mL",
    kind: "number",
    placeholder: "1.2",
    min: 0,
    step: 0.01,
  },

  // Embryology & transfer
  cultureMedia: {
    label: "Culture media",
    kind: "select",
    options: toOptions([
      "Single-step",
      "Sequential",
      "Time-lapse optimised",
    ]),
  },
  etThickness: {
    label: "ET thickness",
    unit: "mm",
    kind: "number",
    placeholder: "8.5",
    min: 0,
    step: 0.1,
  },
  embryoCount: {
    label: "Embryo count",
    kind: "number",
    placeholder: "6",
    min: 0,
  },
  day3Embryos: {
    label: "Day 3 embryos",
    kind: "number",
    placeholder: "5",
    min: 0,
  },
  day5Embryos: {
    label: "Day 5 embryos",
    kind: "number",
    placeholder: "3",
    min: 0,
  },
  stageGrade: {
    label: "Stage grade",
    kind: "select",
    options: GRADE_OPTIONS,
  },

  // Cycle summary
  activeEmbryos: {
    label: "Active embryos",
    kind: "number",
    placeholder: "0",
    min: 0,
    required: true,
  },
  selectedImplant: {
    label: "Selected implant",
    kind: "text",
    placeholder: "EMB001",
  },
  manualGrade: {
    label: "Manual grade",
    kind: "select",
    options: GRADE_OPTIONS,
  },
  aiGrade: { label: "AI grade", kind: "select", options: GRADE_OPTIONS },
  confidenceScore: {
    label: "Confidence score",
    unit: "%",
    kind: "percent",
    placeholder: "90",
    min: 0,
    max: 100,
  },
};

export interface FieldGroup {
  id: string;
  title: string;
  fields: PatientField[];
}

/** Collapsible sections of the add/edit form. */
export const FORM_SECTIONS: FieldGroup[] = [
  {
    id: "demographics",
    title: "Patient demographics",
    fields: [
      "patientId",
      "name",
      "sex",
      "age",
      "spouseAge",
      "contact",
      "location",
      "patientConcerns",
    ],
  },
  {
    id: "vitals",
    title: "Vitals",
    fields: ["heightCm", "weightKg", "bloodGroup"],
  },
  {
    id: "reproductive",
    title: "Reproductive history",
    fields: [
      "pregnancyLoss",
      "geneticDisorders",
      "previousIvfFailure",
      "ivfOrIcsi",
    ],
  },
  {
    id: "andrology",
    title: "Andrology (sperm data)",
    fields: [
      "spermSource",
      "collectionMethod",
      "spermCount",
      "spermMotility",
      "dfi",
      "spermMorphology",
      "spermPrep",
    ],
  },
  {
    id: "oocyte",
    title: "Oocyte & stimulation data",
    fields: ["amhValue", "m2Oocytes", "triggerInjection", "serumProgesterone"],
  },
  {
    id: "embryology",
    title: "Embryology & transfer",
    fields: [
      "cultureMedia",
      "etThickness",
      "embryoCount",
      "day3Embryos",
      "day5Embryos",
      "stageGrade",
    ],
  },
  {
    id: "cycle",
    title: "Cycle summary",
    fields: [
      "activeEmbryos",
      "selectedImplant",
      "manualGrade",
      "aiGrade",
      "confidenceScore",
    ],
  },
];

/**
 * What each patient card summarises. A male record leads with the andrology
 * numbers, a female record with the embryology ones — the same six-row shape
 * either way so the grid stays even.
 */
export const CARD_FIELDS: {
  male: PatientField[];
  female: PatientField[];
  unknown: PatientField[];
} = {
  male: [
    "location",
    "spermSource",
    "spermCount",
    "spermMotility",
    "dfi",
    "spermMorphology",
  ],
  female: [
    "location",
    "activeEmbryos",
    "day5Embryos",
    "stageGrade",
    "aiGrade",
    "confidenceScore",
  ],
  unknown: [
    "location",
    "activeEmbryos",
    "selectedImplant",
    "manualGrade",
    "aiGrade",
    "confidenceScore",
  ],
};

export const CARD_CAPTION = {
  male: "Andrology profile",
  female: "Embryology profile",
  unknown: "Cycle summary",
} as const;

/** Tabs of the read-only detail view. */
export const DETAIL_TABS: FieldGroup[] = [
  {
    id: "patient-medical",
    title: "Patient and medical",
    fields: [
      "patientId",
      "name",
      "sex",
      "age",
      "spouseAge",
      "contact",
      "location",
      "heightCm",
      "weightKg",
      "bloodGroup",
      "patientConcerns",
      "pregnancyLoss",
      "previousIvfFailure",
      "geneticDisorders",
      "ivfOrIcsi",
    ],
  },
  {
    id: "andrology-protocol",
    title: "Andrology & IVF protocol",
    fields: [
      "spermSource",
      "collectionMethod",
      "spermCount",
      "spermMotility",
      "dfi",
      "spermMorphology",
      "spermPrep",
      "amhValue",
      "m2Oocytes",
      "triggerInjection",
      "serumProgesterone",
    ],
  },
  {
    id: "embryology-transfer",
    title: "Embryology & embryo transfer",
    fields: [
      "cultureMedia",
      "etThickness",
      "embryoCount",
      "day3Embryos",
      "day5Embryos",
      "stageGrade",
      "activeEmbryos",
      "selectedImplant",
      "manualGrade",
      "aiGrade",
      "confidenceScore",
    ],
  },
];
