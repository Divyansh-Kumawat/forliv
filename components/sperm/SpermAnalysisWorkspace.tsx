"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { UploadDropzone } from "@/components/common/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronDownIcon } from "@/components/ui/icons";
import { usePatients } from "@/hooks/usePatients";
import { useSpermAnalyses } from "@/hooks/useSpermAnalyses";
import { capturePreview } from "@/lib/image";
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_UPLOAD_MB,
  REFERENCE_LIMITS,
} from "@/lib/sperm-analyses";
import { cn } from "@/lib/utils";
import type { SpermAnalysis } from "@/types/analysis";

/** How long the stand-in inference call pretends to run. */
const SIMULATED_RUN_MS = 2200;

type Mode = "upload" | "live" | "history";

const MODES: { id: Mode; title: string; blurb: string }[] = [
  { id: "upload", title: "Upload video", blurb: "Drop a sample for AI analysis" },
  { id: "live", title: "Live microscope", blurb: "Capture in real time" },
  { id: "history", title: "Past analyses", blurb: "Review previous samples" },
];

export function SpermAnalysisWorkspace({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { patients, ready: patientsReady } = usePatients();
  const { analyses, ready, startAnalysis, completeAnalysis, removeAnalysis } =
    useSpermAnalyses(patientId);

  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const patient = patients.find((entry) => entry.patientId === patientId);
  const males = patients.filter((entry) => entry.sex === "male");

  async function run(sampleName: string, sample: File | null) {
    setPreparing(true);
    // A still from the sample, so the history has something to show. Returns
    // null for containers the browser can't decode (AVI and MKV, commonly).
    const preview = sample ? await capturePreview(sample) : null;
    setPreparing(false);

    const id = startAnalysis(
      patientId,
      sampleName,
      mode === "live" ? "live" : "upload",
      preview,
    );
    setRunningId(id);
    setFile(null);

    // Stand-in for the inference service returning.
    setTimeout(() => {
      completeAnalysis(id);
      setRunningId(null);
      setMode("history");
    }, SIMULATED_RUN_MS);
  }

  if (patientsReady && !patient) {
    return (
      <Card className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-sm font-medium text-ink">Patient not found</p>
        <p className="mt-1 text-[0.8125rem] text-ink-muted">
          No record matches{" "}
          <span className="font-mono text-ink-soft">{patientId}</span>.
        </p>
        <Link
          href="/sperm-analysis"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to sperm analysis
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href="/sperm-analysis"
          aria-label="Back to sperm analysis"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
              Sperm analysis
            </h1>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-brand-700">
              Pilot
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            AI-assisted semen analysis — upload a sample, capture live, or review
            history.
          </p>
        </div>

        <span className="ml-auto mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-good/25 bg-good/8 px-2.5 py-1.5 text-xs font-medium text-good">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          GPU service online
        </span>
      </div>

      {/* Patient switcher — mirrors the picker on the source design. */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <label
          htmlFor="workspace-patient"
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted"
        >
          Patient
        </label>
        <div className="relative min-w-0 flex-1">
          <select
            id="workspace-patient"
            value={patientId}
            onChange={(event) =>
              router.push(
                `/sperm-analysis/${encodeURIComponent(event.target.value)}`,
              )
            }
            className="h-11 w-full appearance-none rounded-xl border border-line bg-surface pl-3.5 pr-10 text-[0.9375rem] text-ink transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
          >
            {males.map((entry) => (
              <option key={entry.id} value={entry.patientId}>
                {entry.patientId}
                {entry.name ? ` — ${entry.name}` : ""}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {MODES.map((entry) => {
          const active = entry.id === mode;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setMode(entry.id)}
              aria-pressed={active}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "border-brand-600 bg-brand-50"
                  : "border-line bg-surface hover:border-line-strong hover:bg-surface-muted",
              )}
            >
              <p
                className={cn(
                  "text-[0.9375rem] font-semibold tracking-[-0.01em]",
                  active ? "text-brand-700" : "text-ink",
                )}
              >
                {entry.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{entry.blurb}</p>
            </button>
          );
        })}
      </div>

      {mode === "upload" && (
        <div className="space-y-4">
          <UploadDropzone
            accept={ACCEPTED_VIDEO_TYPES}
            maxSizeMb={MAX_UPLOAD_MB}
            hint={`MP4, AVI, MOV, MKV — max ${MAX_UPLOAD_MB} MB`}
            file={file}
            onFile={setFile}
            disabled={runningId !== null || preparing}
          />
          <Button
            size="lg"
            className="w-full"
            disabled={!file || runningId !== null || preparing}
            loading={runningId !== null || preparing}
            onClick={() => file && run(file.name, file)}
          >
            {preparing
              ? "Preparing sample…"
              : runningId
                ? "Analysing sample…"
                : "Start analysis"}
          </Button>
        </div>
      )}

      {mode === "live" && (
        <Card className="p-5">
          <div className="flex aspect-video items-center justify-center rounded-xl border border-line bg-ink/[0.04]">
            <div className="text-center">
              <p className="text-sm font-medium text-ink">
                Microscope feed not connected
              </p>
              <p className="mt-1 max-w-sm text-[0.8125rem] text-ink-muted">
                Live capture needs the on-site camera bridge. You can still queue
                a capture to see the downstream flow.
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="mt-4 w-full"
            disabled={runningId !== null}
            loading={runningId !== null}
            onClick={() => run(`live-capture-${Date.now()}`, null)}
          >
            {runningId ? "Analysing capture…" : "Capture & analyse"}
          </Button>
        </Card>
      )}

      {mode === "history" && (
        <AnalysisHistory
          analyses={analyses}
          ready={ready}
          onRemove={removeAnalysis}
        />
      )}
    </div>
  );
}

function AnalysisHistory({
  analyses,
  ready,
  onRemove,
}: {
  analyses: SpermAnalysis[];
  ready: boolean;
  onRemove: (id: string) => void;
}) {
  if (!ready) {
    return <Card className="h-40 animate-pulse bg-surface-muted/60" />;
  }

  if (analyses.length === 0) {
    return (
      <Card className="px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">No analyses yet</p>
        <p className="mt-1 text-[0.8125rem] text-ink-muted">
          Upload a sample or capture one live to see results here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <Card key={analysis.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {analysis.imageSrc && (
                // eslint-disable-next-line @next/next/no-img-element -- a runtime data URL, not a static asset
                <img
                  src={analysis.imageSrc}
                  alt={`Still from ${analysis.sampleName}`}
                  className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-[0.9375rem] font-medium text-ink">
                  {analysis.sampleName}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {analysis.source === "live" ? "Live capture" : "Uploaded sample"}{" "}
                  · {new Date(analysis.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {analysis.status === "processing" ? (
                <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[0.6875rem] font-medium text-warning">
                  Processing
                </span>
              ) : (
                <span className="rounded-md bg-good/10 px-2 py-0.5 text-[0.6875rem] font-medium text-good">
                  Complete
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(analysis.id)}
                aria-label={`Delete analysis ${analysis.sampleName}`}
                className="rounded-lg px-2 py-1 text-[0.6875rem] font-medium text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical"
              >
                Delete
              </button>
            </div>
          </div>

          {analysis.status === "complete" && (
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-4">
              <ResultTile
                label="Concentration"
                unit="M/mL"
                value={analysis.concentration}
                low={
                  analysis.concentration !== null &&
                  analysis.concentration < REFERENCE_LIMITS.concentration
                }
              />
              <ResultTile
                label="Progressive motility"
                unit="%"
                value={analysis.motility}
                low={
                  analysis.motility !== null &&
                  analysis.motility < REFERENCE_LIMITS.motility
                }
              />
              <ResultTile
                label="Normal morphology"
                unit="%"
                value={analysis.morphology}
                low={
                  analysis.morphology !== null &&
                  analysis.morphology < REFERENCE_LIMITS.morphology
                }
              />
              <ResultTile label="DFI" unit="%" value={analysis.dfi} />
            </div>
          )}

          {analysis.status === "complete" && analysis.confidence !== null && (
            <p className="mt-3 text-xs text-ink-muted">
              Model confidence {Math.round(analysis.confidence * 100)}% ·
              Reference limits are WHO 2021 lower bounds, shown for orientation
              only.
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

function ResultTile({
  label,
  unit,
  value,
  low = false,
}: {
  label: string;
  unit: string;
  value: number | null;
  low?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line px-3 py-2.5">
      <p className="text-[0.6875rem] font-medium text-ink-soft">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span
          className={cn(
            "text-[1.25rem] font-semibold leading-none tracking-[-0.02em]",
            low ? "text-warning" : "text-ink",
          )}
        >
          {value ?? "—"}
        </span>
        <span className="text-xs text-ink-muted">{unit}</span>
      </p>
      {low && (
        <p className="mt-1 text-[0.6875rem] font-medium text-warning">
          Below reference
        </p>
      )}
    </div>
  );
}
