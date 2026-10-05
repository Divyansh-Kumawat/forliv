"use client";

import { useCallback, useSyncExternalStore } from "react";

import { createPatientId, writeStoredPatients } from "@/lib/patients";
import { patientsStore } from "@/lib/stores/patients";
import type { NewPatientInput, Patient } from "@/types/patient";

interface UsePatientsResult {
  patients: Patient[];
  /** False during SSR and hydration, before storage has been read. */
  ready: boolean;
  addPatient: (input: NewPatientInput) => void;
  updatePatient: (id: string, input: NewPatientInput) => void;
  removePatient: (id: string) => void;
}

const NONE: Patient[] = [];

/**
 * Patients are read per-page rather than held in a context — unlike tasks,
 * nothing outside the patients section needs them.
 *
 * Every mutation writes to storage synchronously and refreshes the store before
 * returning: the form navigates to the detail page right after saving, and a
 * deferred write would lose the race against the next page reading storage.
 */
export function usePatients(): UsePatientsResult {
  const snapshot = useSyncExternalStore(
    patientsStore.subscribe,
    patientsStore.getSnapshot,
    patientsStore.getServerSnapshot,
  );

  const patients = snapshot.ready ? snapshot.value : NONE;

  const commit = useCallback((next: Patient[]) => {
    writeStoredPatients(next);
    patientsStore.refresh();
  }, []);

  const addPatient = useCallback(
    (input: NewPatientInput) => {
      const patient: Patient = {
        ...input,
        id: createPatientId(),
        createdAt: new Date().toISOString(),
      };
      commit([patient, ...patients]);
    },
    [patients, commit],
  );

  const updatePatient = useCallback(
    (id: string, input: NewPatientInput) => {
      commit(
        patients.map((patient) =>
          patient.id === id ? { ...patient, ...input } : patient,
        ),
      );
    },
    [patients, commit],
  );

  const removePatient = useCallback(
    (id: string) => {
      commit(patients.filter((patient) => patient.id !== id));
    },
    [patients, commit],
  );

  return { patients, ready: snapshot.ready, addPatient, updatePatient, removePatient };
}
