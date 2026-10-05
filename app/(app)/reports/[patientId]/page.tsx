import type { Metadata } from "next";

import { PatientReport } from "@/components/reports/PatientReport";

export const metadata: Metadata = {
  title: "Patient report",
};

export default async function PatientReportPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <PatientReport patientId={decodeURIComponent(patientId)} />;
}
