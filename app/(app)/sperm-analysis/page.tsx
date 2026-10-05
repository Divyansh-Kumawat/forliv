import type { Metadata } from "next";

import { SpermAnalysisBoard } from "@/components/sperm/SpermAnalysisBoard";

export const metadata: Metadata = {
  title: "Sperm analysis",
};

export default function SpermAnalysisPage() {
  return <SpermAnalysisBoard />;
}
