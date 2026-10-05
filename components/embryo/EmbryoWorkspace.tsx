"use client";

import Link from "next/link";

import { AnnotationBadges } from "@/components/embryo/AnnotationBadges";
import { Card } from "@/components/ui/card";
import { ChevronLeftIcon, EmbryoIcon, TrashIcon } from "@/components/ui/icons";
import { useEmbryos } from "@/hooks/useEmbryos";
import { usePatients } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";

export function EmbryoWorkspace({ patientId }: { patientId: string }) {
  const { patients, ready: patientsReady } = usePatients();
  const { embryos, ready, removeEmbryo } = useEmbryos(patientId);

  const patient = patients.find((entry) => entry.patientId === patientId);
  const newHref = `/embryo-tracking/${encodeURIComponent(patientId)}/new`;

  if (patientsReady && !patient) {
    return (
      <Card className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-sm font-medium text-ink">Patient not found</p>
        <p className="mt-1 text-[0.8125rem] text-ink-muted">
          No record matches{" "}
          <span className="font-mono text-ink-soft">{patientId}</span>.
        </p>
        <Link
          href="/embryo-tracking"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to embryo tracking
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href="/embryo-tracking"
          aria-label="Back to embryo tracking"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>

        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
            Embryos list for{" "}
            <span className="font-mono text-brand-600">{patientId}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {patient?.name ? `${patient.name} · ` : ""}
            {embryos.length} {embryos.length === 1 ? "embryo" : "embryos"}{" "}
            tracked
          </p>
        </div>

        {embryos.length > 0 && (
          <Link
            href={newHref}
            className="ml-auto mt-0.5 inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-3.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700"
          >
            Upload embryo
          </Link>
        )}
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="h-72 animate-pulse bg-surface-muted/60" />
          ))}
        </div>
      ) : embryos.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-brand-200 bg-brand-50 text-brand-500">
            <EmbryoIcon className="h-9 w-9" />
          </span>
          <p className="mt-4 text-[0.9375rem] font-semibold text-ink">
            No embryos for {patientId} yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[0.8125rem] text-ink-muted">
            Upload a microscopy image to begin AI-assisted tracking and grading.
          </p>
          <Link
            href={newHref}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Upload embryo
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {embryos.map((embryo) => (
            <Card key={embryo.id} className="overflow-hidden">
              <div className="relative aspect-square bg-ink/[0.06]">
                {embryo.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a runtime data URL, not a static asset
                  <img
                    src={embryo.imageSrc}
                    alt={`Micrograph of ${embryo.label}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-ink-muted">
                    <EmbryoIcon className="h-10 w-10" />
                  </span>
                )}
                <span className="absolute left-2.5 top-2.5 rounded-lg bg-surface/90 px-2 py-1 font-mono text-xs font-semibold text-ink backdrop-blur-sm">
                  {embryo.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeEmbryo(embryo.id)}
                  aria-label={`Delete ${embryo.label}`}
                  className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-ink-muted backdrop-blur-sm transition-colors hover:text-critical"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <AnnotationBadges annotations={embryo.annotations} />

                <dl className="mt-3 space-y-1.5 text-[0.8125rem]">
                  <Row label="Day" value={`Day ${embryo.day}`} />
                  <Row label="Stage" value={embryo.stage} />
                  <Row label="Manual grade" value={embryo.manualGrade ?? "—"} />
                  <Row label="AI grade" value={embryo.aiGrade ?? "—"} />
                  <Row
                    label="Viability"
                    value={
                      embryo.viability === null
                        ? "—"
                        : `${Math.round(embryo.viability * 100)}%`
                    }
                  />
                </dl>

                {embryo.viability !== null && (
                  <div
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"
                    role="img"
                    aria-label={`Predicted viability ${Math.round(embryo.viability * 100)} percent`}
                  >
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{
                        width: `${Math.round(embryo.viability * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 font-medium text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "truncate text-right",
          value === "—" ? "text-ink-muted/70" : "font-medium text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
