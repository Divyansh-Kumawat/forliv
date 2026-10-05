"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnnotationCanvas } from "@/components/embryo/AnnotationCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeftIcon,
  EditIcon,
  EmbryoIcon,
  ReportsIcon,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Stepper, type Step } from "@/components/ui/stepper";
import {
  ABC_OPTIONS,
  ACCEPTED_IMAGE_TYPES,
  DAY_OPTIONS,
  EMBRYO_STRUCTURES,
  EXPANSION_OPTIONS,
  GRADING_SYSTEMS,
  MAX_EMBRYO_UPLOAD_MB,
  OVERALL_GRADE_OPTIONS,
  nextEmbryoLabel,
  simulateGrading,
  stageForDay,
} from "@/lib/embryos";
import { downscaleImage } from "@/lib/image";
import { useEmbryos } from "@/hooks/useEmbryos";
import { cn } from "@/lib/utils";
import type { EmbryoAnnotations, NewEmbryoInput } from "@/types/analysis";

/** How long the stand-in grading model pretends to run. */
const SIMULATED_ANALYSIS_MS = 2000;

const STEPS: Step[] = [
  { id: "upload", label: "Upload", icon: UploadStepIcon },
  { id: "annotate", label: "Annotate", icon: EditIcon },
  { id: "analysis", label: "AI analysis", icon: EmbryoIcon },
  { id: "review", label: "Review & submit", icon: ReportsIcon },
];

const STEP_SUBTITLES = [
  "Image & basic info",
  "Image annotation & manual grading",
  "AI-assisted grading",
  "Confirm and save to the patient record",
];

function UploadStepIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 16V4.5M8 8l4-3.5L16 8" />
      <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

interface AiResult {
  aiGrade: string;
  viability: number;
  confidence: number;
}

export function EmbryoWizard({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { embryos, addEmbryo } = useEmbryos(patientId);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [embryoId, setEmbryoId] = useState(() => nextEmbryoLabel(embryos));
  const [day, setDay] = useState("");
  const [gradingSystem, setGradingSystem] = useState("gardner");
  const [imageName, setImageName] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);

  // Step 2
  const [annotations, setAnnotations] = useState<EmbryoAnnotations>({});
  const [expansion, setExpansion] = useState("");
  const [icmGrade, setIcmGrade] = useState("");
  const [teGrade, setTeGrade] = useState("");
  const [overallGrade, setOverallGrade] = useState("");

  // Step 3
  const [running, setRunning] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);

  const isGardner = gradingSystem === "gardner";
  const manualGrade = isGardner
    ? expansion && icmGrade && teGrade
      ? `${expansion}${icmGrade}${teGrade}`
      : null
    : overallGrade || null;

  async function handleFile(file: File) {
    if (file.size > MAX_EMBRYO_UPLOAD_MB * 1024 * 1024) {
      setError(`Image is larger than ${MAX_EMBRYO_UPLOAD_MB} MB.`);
      return;
    }

    setProcessingImage(true);
    setError(null);
    try {
      const dataUrl = await downscaleImage(file);
      setImageSrc(dataUrl);
      setImageName(file.name);
    } catch {
      setError("That image couldn't be read. Try a different file.");
    } finally {
      setProcessingImage(false);
    }
  }

  function goToAnalysis() {
    setStep(2);
    setRunning(true);
    setAi(null);
    // Stand-in for the inference service returning.
    setTimeout(() => {
      setAi(simulateGrading(Object.keys(annotations).length));
      setRunning(false);
    }, SIMULATED_ANALYSIS_MS);
  }

  function next() {
    if (step === 0) {
      if (!embryoId.trim()) return setError("Enter an embryo ID.");
      if (!day) return setError("Select the day of development.");
      if (!imageSrc) return setError("Upload an embryo image.");
      setError(null);
      return setStep(1);
    }

    if (step === 1) {
      setError(null);
      return goToAnalysis();
    }

    if (step === 2) {
      setError(null);
      return setStep(3);
    }
  }

  function submit() {
    if (!imageSrc) return;

    const input: NewEmbryoInput = {
      patientId,
      label: embryoId.trim(),
      imageName,
      imageSrc,
      day: Number(day),
      stage: stageForDay(Number(day)),
      gradingSystem,
      annotations,
      expansion: isGardner ? expansion || null : null,
      icmGrade: isGardner ? icmGrade || null : null,
      teGrade: isGardner ? teGrade || null : null,
      manualGrade,
      aiGrade: ai?.aiGrade ?? null,
      viability: ai?.viability ?? null,
      confidence: ai?.confidence ?? null,
    };

    addEmbryo(input);
    router.push(`/embryo-tracking/${encodeURIComponent(patientId)}`);
  }

  const backHref = `/embryo-tracking/${encodeURIComponent(patientId)}`;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href={backHref}
          aria-label="Back to embryos list"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
            Embryo analysis — step {step + 1} of {STEPS.length}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{STEP_SUBTITLES[step]}</p>
        </div>
      </div>

      <Card className="px-5 py-5">
        <Stepper
          steps={STEPS}
          current={step}
          onJump={(index) => {
            setError(null);
            setStep(index);
          }}
        />
      </Card>

      {step === 0 && (
        <Card className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Patient ID"
              name="patientId"
              value={patientId}
              readOnly
              className="font-mono"
              hint="Set by the record you came from."
            />
            <Input
              label="Embryo ID"
              name="embryoId"
              placeholder="e.g. EMB001"
              value={embryoId}
              invalid={Boolean(error) && !embryoId.trim()}
              onChange={(event) => setEmbryoId(event.target.value)}
              className="font-mono"
            />
            <Select
              label="Day of development"
              name="day"
              options={DAY_OPTIONS}
              placeholder="Select day"
              value={day}
              invalid={Boolean(error) && !day}
              onChange={(event) => setDay(event.target.value)}
            />
            <Select
              label="Grading system"
              name="gradingSystem"
              options={GRADING_SYSTEMS}
              value={gradingSystem}
              onChange={(event) => setGradingSystem(event.target.value)}
            />
          </div>

          <div>
            <p className="mb-2 text-[0.8125rem] font-medium text-ink-soft">
              Embryo image
            </p>
            <ImagePicker
              imageSrc={imageSrc}
              imageName={imageName}
              processing={processingImage}
              onFile={handleFile}
              onClear={() => {
                setImageSrc(null);
                setImageName("");
              }}
            />
          </div>

          {error && (
            <p role="alert" className="text-[0.8125rem] text-critical">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2.5 border-t border-line pt-4">
            <Link
              href={backHref}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
            >
              Cancel
            </Link>
            <Button onClick={next} disabled={processingImage}>
              Next — annotate
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && imageSrc && (
        <Card className="space-y-5 p-5">
          <AnnotationCanvas
            imageSrc={imageSrc}
            annotations={annotations}
            onChange={setAnnotations}
          />

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-[0.8125rem] font-medium text-ink-soft">
              Manual grading —{" "}
              {GRADING_SYSTEMS.find((s) => s.value === gradingSystem)?.label}
            </p>

            {isGardner ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Select
                  label="Expansion"
                  name="expansion"
                  options={EXPANSION_OPTIONS}
                  placeholder="Not graded"
                  allowEmpty
                  value={expansion}
                  onChange={(event) => setExpansion(event.target.value)}
                />
                <Select
                  label="ICM grade"
                  name="icmGrade"
                  options={ABC_OPTIONS}
                  placeholder="Not graded"
                  allowEmpty
                  value={icmGrade}
                  onChange={(event) => setIcmGrade(event.target.value)}
                />
                <Select
                  label="TE grade"
                  name="teGrade"
                  options={ABC_OPTIONS}
                  placeholder="Not graded"
                  allowEmpty
                  value={teGrade}
                  onChange={(event) => setTeGrade(event.target.value)}
                />
              </div>
            ) : (
              <Select
                label="Overall grade"
                name="overallGrade"
                options={OVERALL_GRADE_OPTIONS[gradingSystem] ?? []}
                placeholder="Not graded"
                allowEmpty
                value={overallGrade}
                onChange={(event) => setOverallGrade(event.target.value)}
              />
            )}

            {manualGrade && (
              <p className="mt-3 text-[0.8125rem] text-ink-soft">
                Manual grade:{" "}
                <span className="font-mono font-semibold text-ink">
                  {manualGrade}
                </span>
              </p>
            )}
          </div>

          <div className="flex justify-between gap-2.5 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={next}>Next — run AI analysis</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-5">
          {running || !ai ? (
            <div className="py-14 text-center">
              <span className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <EmbryoIcon className="h-7 w-7" />
              </span>
              <p className="mt-4 text-[0.9375rem] font-semibold text-ink">
                Analysing embryo…
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">
                Segmenting structures and predicting viability.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="AI grade" value={ai.aiGrade} />
                <Metric
                  label="Predicted viability"
                  value={`${Math.round(ai.viability * 100)}%`}
                />
                <Metric
                  label="Model confidence"
                  value={`${Math.round(ai.confidence * 100)}%`}
                />
              </div>

              <p className="mt-3 text-xs text-ink-muted">
                Model output is decision support, not a diagnosis. The manual
                grade is recorded alongside it and neither overwrites the other.
              </p>

              <div className="mt-5 flex justify-between gap-2.5 border-t border-line pt-4">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <div className="flex gap-2.5">
                  <Button variant="secondary" onClick={goToAnalysis}>
                    Re-run
                  </Button>
                  <Button onClick={next}>Next — review</Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {step === 3 && imageSrc && (
        <Card className="space-y-5 p-5">
          <AnnotationCanvas
            imageSrc={imageSrc}
            annotations={annotations}
            onChange={() => {}}
            readOnly
          />

          <dl className="grid gap-x-10 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
            <Row label="Patient ID" value={patientId} mono />
            <Row label="Embryo ID" value={embryoId} mono />
            <Row label="Day of development" value={`Day ${day}`} />
            <Row label="Stage" value={stageForDay(Number(day))} />
            <Row
              label="Grading system"
              value={
                GRADING_SYSTEMS.find((s) => s.value === gradingSystem)?.label ??
                gradingSystem
              }
            />
            <Row label="Manual grade" value={manualGrade ?? "—"} />
            <Row label="AI grade" value={ai?.aiGrade ?? "—"} />
            <Row
              label="Predicted viability"
              value={ai ? `${Math.round(ai.viability * 100)}%` : "—"}
            />
            <Row
              label="Structures annotated"
              value={`${Object.keys(annotations).length} of ${EMBRYO_STRUCTURES.length}`}
            />
            <Row label="Source image" value={imageName} />
          </dl>

          <div className="flex justify-between gap-2.5 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={submit}>Save to patient record</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function ImagePicker({
  imageSrc,
  imageName,
  processing,
  onFile,
  onClear,
}: {
  imageSrc: string | null;
  imageName: string;
  processing: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  if (imageSrc) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- a runtime data URL, not a static asset */}
        <img
          src={imageSrc}
          alt="Selected embryo"
          className="h-24 w-24 rounded-xl border border-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{imageName}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Stored as a downscaled copy.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-2 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            Choose a different image
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const dropped = event.dataTransfer.files?.[0];
        if (dropped) onFile(dropped);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragging
          ? "border-brand-500 bg-brand-50"
          : "border-line-strong bg-surface hover:border-brand-300 hover:bg-brand-50/30",
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (picked) onFile(picked);
          event.target.value = "";
        }}
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <UploadStepIcon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm text-ink-soft">
        {processing
          ? "Preparing image…"
          : "Drop the embryo image here, or click to browse"}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        JPG, PNG or GIF up to {MAX_EMBRYO_UPLOAD_MB} MB — one image
      </p>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line px-3.5 py-3">
      <p className="text-[0.6875rem] font-medium text-ink-soft">{label}</p>
      <p className="mt-1 text-[1.125rem] font-semibold tracking-[-0.02em] text-ink">
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2.5">
      <dt className="shrink-0 text-[0.8125rem] font-medium text-ink-soft">
        {label}
      </dt>
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
