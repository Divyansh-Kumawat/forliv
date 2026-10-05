import type { Metadata } from "next";

import { EmbryoTrackingBoard } from "@/components/embryo/EmbryoTrackingBoard";

export const metadata: Metadata = {
  title: "Embryo tracking",
};

export default function EmbryoTrackingPage() {
  return <EmbryoTrackingBoard />;
}
