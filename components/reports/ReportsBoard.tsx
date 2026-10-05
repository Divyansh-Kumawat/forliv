"use client";

import { useMemo } from "react";

import { PatientSelectGrid } from "@/components/common/PatientSelectGrid";
import { useEmbryos } from "@/hooks/useEmbryos";
import { useSpermAnalyses } from "@/hooks/useSpermAnalyses";

export function ReportsBoard() {
  const { countsByPatient: embryoCounts } = useEmbryos();
  const { analyses } = useSpermAnalyses();

  // A patient's report covers everything uploaded for them, of either kind.
  const recordCounts = useMemo(() => {
    const counts: Record<string, number> = { ...embryoCounts };
    for (const analysis of analyses) {
      counts[analysis.patientId] = (counts[analysis.patientId] ?? 0) + 1;
    }
    return counts;
  }, [embryoCounts, analyses]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
          Reports
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Per-patient summaries of every embryo and semen sample analysed. Open a
          patient to view or export their report.
        </p>
      </div>

      <PatientSelectGrid
        basePath="/reports"
        countLabel="Records"
        counts={recordCounts}
        emptyMessage="Reports appear once a patient has an embryo or semen analysis on file."
      />
    </div>
  );
}
