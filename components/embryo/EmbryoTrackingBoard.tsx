"use client";

import { PatientSelectGrid } from "@/components/common/PatientSelectGrid";
import { useEmbryos } from "@/hooks/useEmbryos";

export function EmbryoTrackingBoard() {
  const { countsByPatient } = useEmbryos();

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
          Embryo tracking
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Monitor embryo development stages, quality grades and viability scores.
          Pick a patient to view or upload their embryos.
        </p>
      </div>

      <PatientSelectGrid
        basePath="/embryo-tracking"
        sex="female"
        countLabel="Embryos"
        counts={countsByPatient}
        emptyMessage="Embryo tracking is offered for patients recorded as female. Set a patient's sex on their record to list them here."
      />
    </div>
  );
}
