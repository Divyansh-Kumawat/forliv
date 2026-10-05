"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AnnotatedImage } from "@/components/embryo/RegionShapes";
import { Card } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronDownIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useEmbryos } from "@/hooks/useEmbryos";
import { usePatients } from "@/hooks/usePatients";
import { useSpermAnalyses } from "@/hooks/useSpermAnalyses";
import { DEMO_CENTER_ID, DEMO_CENTER_NAME } from "@/lib/constants";
import { formatFieldValue } from "@/lib/patients";
import {
  DECISION_LABEL,
  DECISION_STYLE,
  GRADING_MODES,
  REPORT_SECTIONS,
  byScoreDesc,
  embryoDecision,
  embryoScore,
  gradeRemark,
  type GradingMode,
  type ReportSection,
} from "@/lib/reports";
import { cn } from "@/lib/utils";

export function PatientReport({ patientId }: { patientId: string }) {
  const { patients, ready } = usePatients();
  const { embryos } = useEmbryos(patientId);
  const { analyses } = useSpermAnalyses(patientId);
  const { session } = useAuth();

  const [mode, setMode] = useState<GradingMode>("both");
  const [sections, setSections] = useState<ReportSection[]>(
    REPORT_SECTIONS.map((section) => section.id),
  );
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const patient = patients.find((entry) => entry.patientId === patientId);
  const ranked = useMemo(() => [...embryos].sort(byScoreDesc), [embryos]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-9 w-72 animate-pulse rounded-xl bg-surface-muted" />
        <Card className="h-80 animate-pulse bg-surface-muted/60" />
      </div>
    );
  }

  if (!patient) {
    return (
      <Card className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-sm font-medium text-ink">Patient not found</p>
        <p className="mt-1 text-[0.8125rem] text-ink-muted">
          No record matches{" "}
          <span className="font-mono text-ink-soft">{patientId}</span>.
        </p>
        <Link
          href="/reports"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to reports
        </Link>
      </Card>
    );
  }

  const shows = (id: ReportSection) => sections.includes(id);
  const showAi = mode !== "manual";
  const showManual = mode !== "ai";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Link
          href="/reports"
          aria-label="Back to reports"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
          Report for{" "}
          <span className="font-mono text-brand-600">{patient.patientId}</span>
        </h1>
      </div>

      {/* One control row above everything it scopes. */}
      <Card className="flex flex-wrap items-center gap-3 p-3 print:hidden">
        <div>
          <p className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Grading mode
          </p>
          <div className="flex gap-1">
            {GRADING_MODES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setMode(entry.id)}
                aria-pressed={mode === entry.id}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                  mode === entry.id
                    ? "bg-brand-600 text-white"
                    : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative ml-auto flex items-end gap-2">
          <button
            type="button"
            onClick={() => setSectionsOpen((open) => !open)}
            aria-expanded={sectionsOpen}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            Sections
            <ChevronDownIcon
              className={cn("h-4 w-4 transition-transform", sectionsOpen && "rotate-180")}
            />
          </button>

          {sectionsOpen && (
            <div className="absolute right-[8.5rem] top-[calc(100%+0.5rem)] z-20 w-56 rounded-2xl border border-line bg-surface p-2 shadow-[0_8px_28px_rgba(22,21,28,0.10)]">
              {REPORT_SECTIONS.map((section) => (
                <label
                  key={section.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[0.8125rem] text-ink-soft hover:bg-surface-muted"
                >
                  <input
                    type="checkbox"
                    checked={shows(section.id)}
                    onChange={(event) =>
                      setSections((current) =>
                        event.target.checked
                          ? [...current, section.id]
                          : current.filter((id) => id !== section.id),
                      )
                    }
                    className="h-4 w-4 accent-brand-600"
                  />
                  {section.label}
                </label>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Download PDF
          </button>
        </div>
      </Card>

      {/* Print-only title, since the on-screen header is hidden on paper. */}
      <h1 className="hidden text-[1.25rem] font-semibold text-ink print:block">
        Report for {patient.patientId}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Patient">
          <Line label="ID" value={patient.patientId} mono />
          <Line label="Name" value={patient.name ?? "—"} />
          <Line label="Age" value={String(patient.age)} />
          <Line
            label="Spouse age"
            value={patient.spouseAge === null ? "—" : String(patient.spouseAge)}
          />
          <Line label="Location" value={patient.location} />
        </Panel>

        <Panel title="Clinic">
          <Line label="Center ID" value={session?.centerId ?? DEMO_CENTER_ID} mono />
          <Line label="Center" value={DEMO_CENTER_NAME} />
          <Line
            label="Reported by"
            value={session ? `${session.displayName} · ${session.roleLabel}` : "—"}
          />
        </Panel>
      </div>

      {shows("summary") && (
        <section className="space-y-3">
          <SectionTitle>Cycle summary</SectionTitle>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Evaluated embryos" value={String(embryos.length)} />
            <Tile
              label="IVF / ICSI"
              value={formatFieldValue(patient, "ivfOrIcsi")}
            />
            <Tile
              label="Collection"
              value={formatFieldValue(patient, "collectionMethod")}
            />
            <Tile
              label="Previous IVF failure"
              value={formatFieldValue(patient, "previousIvfFailure")}
            />
          </div>

          <Card className="p-4">
            <Line
              label="Patient concerns"
              value={formatFieldValue(patient, "patientConcerns")}
            />
            <Line
              label="Genetic disorders"
              value={formatFieldValue(patient, "geneticDisorders")}
            />
            <Line
              label="Pregnancy loss"
              value={formatFieldValue(patient, "pregnancyLoss")}
            />
          </Card>
        </section>
      )}

      {shows("embryos") && (
        <section className="space-y-3">
          <SectionTitle>Embryo analysis &amp; AI scores</SectionTitle>

          {ranked.length === 0 ? (
            <Card className="px-6 py-10 text-center text-[0.8125rem] text-ink-muted">
              No embryos recorded for this patient.
            </Card>
          ) : (
            ranked.map((embryo, index) => {
              const score = embryoScore(embryo);
              const decision = embryoDecision(score);

              return (
                <Card key={embryo.id} className="p-4">
                  <div className="flex flex-wrap items-start gap-5">
                    <AnnotatedImage
                      imageSrc={embryo.imageSrc}
                      annotations={embryo.annotations}
                      alt={`Segmentation of ${embryo.label}`}
                      className="relative h-44 w-44 shrink-0 overflow-hidden rounded-xl border border-line bg-ink/[0.06] sm:h-56 sm:w-56"
                    />

                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-700">
                        Rank #{index + 1}
                      </span>
                      {/* Label and value sit next to each other on a fixed
                          gutter, rather than pushed to opposite edges. */}
                      <dl className="mt-3 space-y-1.5">
                        <DetailRow label="Embryo ID" value={embryo.label} mono />
                        <DetailRow
                          label="Embryo age"
                          value={`${embryo.day} days`}
                        />
                        {showAi && (
                          <DetailRow
                            label="AI grade"
                            value={embryo.aiGrade ?? "—"}
                          />
                        )}
                        {showManual && (
                          <DetailRow
                            label="Manual grade"
                            value={embryo.manualGrade ?? "—"}
                          />
                        )}
                        <DetailRow label="Remarks" value={gradeRemark(embryo)} />
                      </dl>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[0.6875rem] font-medium text-ink-soft">
                        Score
                      </p>
                      <p className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink">
                        {score === null ? "—" : score.toFixed(1)}
                      </p>
                      <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
                        out of 10
                      </p>
                      <span
                        className={cn(
                          "mt-2 inline-block rounded-md px-2 py-0.5 text-[0.6875rem] font-medium",
                          DECISION_STYLE[decision],
                        )}
                      >
                        {DECISION_LABEL[decision]}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </section>
      )}

      {shows("sperm") && (
        <section className="space-y-3">
          <SectionTitle>Semen analysis</SectionTitle>

          {analyses.length === 0 ? (
            <Card className="px-6 py-10 text-center text-[0.8125rem] text-ink-muted">
              No semen analyses recorded for this patient.
            </Card>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[38rem] text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-muted/60 text-left">
                    <th scope="col" className="px-4 py-2.5 font-medium text-ink-muted">
                      Sample
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium text-ink-muted">
                      Conc. (M/mL)
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium text-ink-muted">
                      Motility (%)
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium text-ink-muted">
                      Morphology (%)
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium text-ink-muted">
                      DFI (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((analysis) => (
                    <tr key={analysis.id} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3">
                        <span className="block truncate font-medium text-ink">
                          {analysis.sampleName}
                        </span>
                        <span className="block text-xs text-ink-muted">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <Cell value={analysis.concentration} />
                      <Cell value={analysis.motility} />
                      <Cell value={analysis.morphology} />
                      <Cell value={analysis.dfi} last />
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      )}

      <p className="pb-2 text-xs text-ink-muted">
        Scores are derived from the recorded viability prediction. Model output is
        decision support, not a diagnosis, and does not replace the embryologist&apos;s
        grade.
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-line pb-2 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
      {children}
    </h2>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-l-4 border-l-brand-600 p-4">
      <p className="mb-2 text-[0.8125rem] font-semibold text-brand-700">
        {title}
      </p>
      <dl className="space-y-1">{children}</dl>
    </Card>
  );
}

function Line({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-[0.8125rem] text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "truncate text-right text-[0.8125rem]",
          value === "—" ? "text-ink-muted/70" : "font-medium text-ink",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Label beside its value on a fixed gutter — used in the embryo cards. */
function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-5">
      <dt className="w-28 shrink-0 text-[0.8125rem] text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate text-[0.8125rem]",
          value === "—" ? "text-ink-muted/70" : "font-medium text-ink",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-l-4 border-l-brand-600 px-4 py-3">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 truncate text-[0.9375rem] font-semibold text-ink">
        {value}
      </p>
    </Card>
  );
}

function Cell({ value, last = false }: { value: number | null; last?: boolean }) {
  return (
    <td
      className={cn(
        "py-3 text-right tabular-nums text-ink-soft",
        last ? "px-4" : "px-3",
      )}
    >
      {value ?? "—"}
    </td>
  );
}
