import type { Metadata } from "next";

import { PatientCreateView } from "@/components/patients/PatientViews";

export const metadata: Metadata = {
  title: "Add patient",
};

export default function NewPatientPage() {
  return <PatientCreateView />;
}
