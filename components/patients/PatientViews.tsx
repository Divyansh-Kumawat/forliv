"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PatientDetail } from "@/components/patients/PatientDetail";
import { PatientForm } from "@/components/patients/PatientForm";
import { Card } from "@/components/ui/card";
import { usePatients } from "@/hooks/usePatients";
import type { NewPatientInput, Patient } from "@/types/patient";

function LoadingState() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="h-9 w-64 animate-pulse rounded-xl bg-surface-muted" />
      <Card className="h-72 animate-pulse bg-surface-muted/60" />
    </div>
  );
}

function NotFound({ patientId }: { patientId: string }) {
  return (
    <Card className="mx-auto max-w-lg px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink">Patient not found</p>
      <p className="mt-1 text-[0.8125rem] text-ink-muted">
        No record matches{" "}
        <span className="font-mono text-ink-soft">{patientId}</span>.
      </p>
      <Link
        href="/patients"
        className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Back to patients
      </Link>
    </Card>
  );
}

function findByPatientId(patients: Patient[], patientId: string) {
  return patients.find((patient) => patient.patientId === patientId) ?? null;
}

export function PatientDetailView({ patientId }: { patientId: string }) {
  const { patients, ready } = usePatients();

  if (!ready) return <LoadingState />;

  const patient = findByPatientId(patients, patientId);
  if (!patient) return <NotFound patientId={patientId} />;

  return <PatientDetail patient={patient} />;
}

export function PatientEditView({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { patients, ready, updatePatient } = usePatients();

  if (!ready) return <LoadingState />;

  const patient = findByPatientId(patients, patientId);
  if (!patient) return <NotFound patientId={patientId} />;

  function handleSubmit(input: NewPatientInput) {
    if (!patient) return;
    updatePatient(patient.id, input);
    // The clinic ID is the route key, so a rename changes the destination.
    router.push(`/patients/${encodeURIComponent(input.patientId)}`);
  }

  return (
    <PatientForm
      patient={patient}
      takenIds={patients
        .filter((entry) => entry.id !== patient.id)
        .map((entry) => entry.patientId)}
      onSubmit={handleSubmit}
      backHref={`/patients/${encodeURIComponent(patient.patientId)}`}
    />
  );
}

export function PatientCreateView() {
  const router = useRouter();
  const { patients, ready, addPatient } = usePatients();

  if (!ready) return <LoadingState />;

  function handleSubmit(input: NewPatientInput) {
    addPatient(input);
    router.push(`/patients/${encodeURIComponent(input.patientId)}`);
  }

  return (
    <PatientForm
      patient={null}
      takenIds={patients.map((entry) => entry.patientId)}
      onSubmit={handleSubmit}
      backHref="/patients"
    />
  );
}
