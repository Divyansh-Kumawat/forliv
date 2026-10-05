import type { Metadata } from "next";

import { SpermAnalysisWorkspace } from "@/components/sperm/SpermAnalysisWorkspace";

export const metadata: Metadata = {
  title: "Sperm analysis",
};

export default async function SpermAnalysisPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <SpermAnalysisWorkspace patientId={decodeURIComponent(patientId)} />;
}
