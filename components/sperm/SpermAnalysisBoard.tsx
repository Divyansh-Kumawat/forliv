"use client";

import { useMemo } from "react";

import { PatientSelectGrid } from "@/components/common/PatientSelectGrid";
import { useSpermAnalyses } from "@/hooks/useSpermAnalyses";

export function SpermAnalysisBoard() {
  const { analyses } = useSpermAnalyses();

  const countsByPatient = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const analysis of analyses) {
      counts[analysis.patientId] = (counts[analysis.patientId] ?? 0) + 1;
    }
    return counts;
  }, [analyses]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
              Sperm analysis
            </h1>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-brand-700">
              Pilot
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            AI-assisted semen analysis. Pick a patient to upload a sample,
            capture live, or review past results.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-good/25 bg-good/8 px-2.5 py-1.5 text-xs font-medium text-good">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          GPU service online
        </span>
      </div>

      <PatientSelectGrid
        basePath="/sperm-analysis"
        sex="male"
        countLabel="Analyses"
        counts={countsByPatient}
        emptyMessage="Sperm analysis is offered for patients recorded as male. Set a patient's sex on their record to list them here."
      />
    </div>
  );
}
