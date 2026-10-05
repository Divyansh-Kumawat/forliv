import type { Metadata } from "next";

import { EmbryoWizard } from "@/components/embryo/EmbryoWizard";

export const metadata: Metadata = {
  title: "Embryo analysis",
};

export default async function NewEmbryoPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <EmbryoWizard patientId={decodeURIComponent(patientId)} />;
}
