"use client";

import { useRef, useState } from "react";

import { RegionShapes } from "@/components/embryo/RegionShapes";
import { EMBRYO_STRUCTURES } from "@/lib/embryos";
import { cn } from "@/lib/utils";
import type { EmbryoAnnotations, EmbryoStructure } from "@/types/analysis";

/** The overlay works in a 0–100 square space, so regions stay circular. */
const BOX = 100;

interface AnnotationCanvasProps {
  imageSrc: string;
  annotations: EmbryoAnnotations;
  onChange: (next: EmbryoAnnotations) => void;
  /** Read-only rendering for the review step. */
  readOnly?: boolean;
}

export function AnnotationCanvas({
  imageSrc,
  annotations,
  onChange,
  readOnly = false,
}: AnnotationCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<EmbryoStructure>("icm");
  const [draft, setDraft] = useState<{ cx: number; cy: number; r: number } | null>(
    null,
  );

  function toBox(event: React.PointerEvent) {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * BOX,
      y: ((event.clientY - bounds.top) / bounds.height) * BOX,
    };
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (readOnly) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = toBox(event);
    setDraft({ cx: x, cy: y, r: 0 });
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (readOnly || !draft) return;
    const { x, y } = toBox(event);
    const r = Math.hypot(x - draft.cx, y - draft.cy);
    setDraft({ ...draft, r });
  }

  function handlePointerUp() {
    if (readOnly || !draft) return;
    // Ignore stray taps that never became a circle.
    if (draft.r >= 2) {
      onChange({ ...annotations, [selected]: draft });
    }
    setDraft(null);
  }

  const annotatedCount = EMBRYO_STRUCTURES.filter(
    (structure) => annotations[structure.id],
  ).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-ink/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element -- a runtime data URL, not a static asset */}
        <img
          src={imageSrc}
          alt="Uploaded embryo micrograph"
          className="absolute inset-0 h-full w-full object-contain"
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${BOX} ${BOX}`}
          preserveAspectRatio="none"
          className={cn(
            "absolute inset-0 h-full w-full touch-none",
            !readOnly && "cursor-crosshair",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDraft(null)}
        >
          <RegionShapes annotations={annotations} />

          {draft && draft.r >= 2 && (
            <circle
              cx={draft.cx}
              cy={draft.cy}
              r={draft.r}
              fill="none"
              stroke={
                EMBRYO_STRUCTURES.find((s) => s.id === selected)?.color ??
                "#9333EA"
              }
              strokeWidth={1.4}
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>

      <div className="space-y-2">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Segmentation
        </p>

        {EMBRYO_STRUCTURES.map((structure) => {
          const region = annotations[structure.id];
          const active = structure.id === selected;

          return (
            <div
              key={structure.id}
              className={cn(
                "rounded-xl border p-3 transition-colors",
                active
                  ? "border-brand-600 bg-brand-50"
                  : "border-line bg-surface",
              )}
            >
              <button
                type="button"
                disabled={readOnly}
                onClick={() => setSelected(structure.id)}
                className="flex w-full items-center gap-2.5 text-left disabled:cursor-default"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-2 ring-surface"
                  style={{ backgroundColor: structure.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.8125rem] font-semibold text-ink">
                    {structure.label}
                  </span>
                  <span className="block truncate text-[0.6875rem] text-ink-muted">
                    {structure.full}
                  </span>
                </span>

                {region ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 text-good"
                    aria-label="Annotated"
                  >
                    <circle cx="10" cy="10" r="7.5" />
                    <path d="m6.5 10 2.5 2.5 4.5-5" />
                  </svg>
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-line-strong" />
                )}
              </button>

              {region && !readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...annotations };
                    delete next[structure.id];
                    onChange(next);
                  }}
                  className="mt-2 rounded-lg px-2 py-1 text-[0.6875rem] font-medium text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical"
                >
                  Clear
                </button>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <p className="pt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
            Pick a structure, then drag on the image from its centre outwards to
            mark it. {annotatedCount} of {EMBRYO_STRUCTURES.length} marked.
          </p>
        )}
      </div>
    </div>
  );
}
