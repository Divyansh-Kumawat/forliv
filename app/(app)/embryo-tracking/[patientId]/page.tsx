import type { Metadata } from "next";

import { EmbryoWorkspace } from "@/components/embryo/EmbryoWorkspace";

export const metadata: Metadata = {
  title: "Embryo tracking",
};

export default async function EmbryoTrackingPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <EmbryoWorkspace patientId={decodeURIComponent(patientId)} />;
}
