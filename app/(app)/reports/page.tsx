import type { Metadata } from "next";

import { ReportsBoard } from "@/components/reports/ReportsBoard";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <ReportsBoard />;
}
