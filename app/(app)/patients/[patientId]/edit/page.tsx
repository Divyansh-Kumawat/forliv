import type { Metadata } from "next";

import { PatientEditView } from "@/components/patients/PatientViews";

export const metadata: Metadata = {
  title: "Edit patient",
};

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <PatientEditView patientId={decodeURIComponent(patientId)} />;
}
