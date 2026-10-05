import type { Metadata } from "next";

import { PatientDetailView } from "@/components/patients/PatientViews";

export const metadata: Metadata = {
  title: "Patient details",
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <PatientDetailView patientId={decodeURIComponent(patientId)} />;
}
