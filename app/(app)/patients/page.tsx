import type { Metadata } from "next";

import { PatientsBoard } from "@/components/patients/PatientsBoard";

export const metadata: Metadata = {
  title: "Patients",
};

export default function PatientsPage() {
  return <PatientsBoard />;
}
