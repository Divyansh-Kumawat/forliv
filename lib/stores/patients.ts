"use client";

import { createLocalStore } from "@/lib/local-store";
import { PATIENTS_STORAGE_KEY, readStoredPatients } from "@/lib/patients";
import type { Patient } from "@/types/patient";

export const patientsStore = createLocalStore<Patient[]>(
  PATIENTS_STORAGE_KEY,
  readStoredPatients,
);
