"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { SUCCESS_RATE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { SeriesPoint } from "@/types/dashboard";

const HEIGHT = 258;
/** Bottom padding reserves the x-axis band so labels are never clipped. */
const PAD = { top: 18, right: 52, bottom: 30, left: 36 };
const Y_MIN = 30;
const Y_MAX = 75;
const TICKS = [30, 40, 50, 60, 70];

/** One series, one hue — the brand violet. */
const SERIES_COLOR = "var(--color-brand-600)";

interface Coord {
  x: number;
  y: number;
}

/**
 * Fritsch–Carlson monotone cubic. Smooths the trend without the overshoot a
 * plain cardinal spline would invent between points.
 */
function monotonePath(points: Coord[]): string {
  const n = points.length;
  if (n < 2) return "";

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = points[i + 1].x - points[i].x;
    slope[i] = (points[i + 1].y - points[i].y) / dx[i];
  }

  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) {
    if (slope[i - 1] * slope[i] <= 0) {
      tangent[i] = 0;
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      tangent[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }
  tangent[n - 1] = slope[n - 2];

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;
    const c1x = points[i].x + h;
    const c1y = points[i].y + tangent[i] * h;
    const c2x = points[i + 1].x - h;
    const c2y = points[i + 1].y - tangent[i + 1] * h;
    d +=
      ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}` +
      ` ${c2x.toFixed(1)} ${c2y.toFixed(1)}` +
      ` ${points[i + 1].x.toFixed(1)} ${points[i + 1].y.toFixed(1)}`;
  }
  return d;
}

export function SuccessRateChart({ data = SUCCESS_RATE }: { data?: SeriesPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Measure so axis text keeps its real size instead of scaling with a viewBox.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const plotW = Math.max(width - PAD.left - PAD.right, 0);
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const points = useMemo<Coord[]>(() => {
    if (plotW <= 0) return [];
    return data.map((point, index) => ({
      x: PAD.left + (index / (data.length - 1)) * plotW,
      y:
        PAD.top +
        (1 - (point.value - Y_MIN) / (Y_MAX - Y_MIN)) * plotH,
    }));
  }, [data, plotW, plotH]);

  const linePath = useMemo(() => monotonePath(points), [points]);
  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return "";
    const baseline = PAD.top + plotH;
    const last = points[points.length - 1];
    return `${linePath} L ${last.x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(1)} ${baseline} Z`;
  }, [linePath, points, plotH]);

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const change = previous ? latest.value - previous.value : 0;
  const active = hovered === null ? null : { point: data[hovered], coord: points[hovered] };

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (plotW <= 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const relative = event.clientX - bounds.left - PAD.left;
    const step = plotW / (data.length - 1);
    const index = Math.round(relative / step);
    setHovered(Math.min(Math.max(index, 0), data.length - 1));
  }

  return (
    <Card className="flex flex-col">
      <header className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 pb-2">
        <div>
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
            Clinical pregnancy rate
          </h2>
          <p className="mt-0.5 text-[0.8125rem] text-ink-muted">
            Per transfer, monthly · this year
          </p>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-[2.125rem] font-semibold leading-none tracking-[-0.03em] text-ink">
              {latest.value}%
            </span>
            <span
              className={cn(
                "text-[0.8125rem] font-medium",
                change >= 0 ? "text-good" : "text-warning",
              )}
            >
              {change >= 0 ? "▲" : "▼"} {Math.abs(change)} pts vs {previous?.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          aria-pressed={showTable}
          className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-surface-muted hover:text-ink"
        >
          {showTable ? "Chart" : "Table"}
        </button>
      </header>

      {showTable ? (
        <div className="max-h-[258px] overflow-y-auto px-5 pb-5">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Clinical pregnancy rate per transfer, by month
            </caption>
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 font-medium text-ink-soft">
                  Month
                </th>
                <th scope="col" className="py-2 text-right font-medium text-ink-soft">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.label} className="border-b border-line/60">
                  <td className="py-2 text-ink-soft">{point.label}</td>
                  <td className="py-2 text-right tabular-nums text-ink">
                    {point.value}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={containerRef} className="relative px-2 pb-3">
          {width > 0 && (
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label={`Clinical pregnancy rate by month, ranging from ${Math.min(
                ...data.map((point) => point.value),
              )}% to ${Math.max(...data.map((point) => point.value))}%.`}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHovered(null)}
              className="touch-none"
            >
              <defs>
                <linearGradient id="successFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity="0.20" />
                  <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Solid hairline grid, one shade off the surface. */}
              {TICKS.map((tick) => {
                const y = PAD.top + (1 - (tick - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;
                return (
                  <g key={tick}>
                    <line
                      x1={PAD.left}
                      x2={PAD.left + plotW}
                      y1={y}
                      y2={y}
                      stroke="var(--color-line)"
                      strokeWidth="1"
                    />
                    <text
                      x={PAD.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-ink-muted text-[11px] tabular-nums"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              <path d={areaPath} fill="url(#successFill)" />
              <path
                d={linePath}
                fill="none"
                stroke={SERIES_COLOR}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {data.map((point, index) => (
                <text
                  key={point.label}
                  x={points[index]?.x}
                  y={HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-ink-muted text-[11px]"
                >
                  {point.label}
                </text>
              ))}

              {/* Selective direct label: the endpoint only. */}
              {!active && points.length > 0 && (
                <>
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="4.5"
                    fill={SERIES_COLOR}
                    stroke="var(--color-surface)"
                    strokeWidth="2"
                  />
                  <text
                    x={points[points.length - 1].x + 10}
                    y={points[points.length - 1].y + 4}
                    className="fill-ink text-[11px] font-medium tabular-nums"
                  >
                    {latest.value}%
                  </text>
                </>
              )}

              {active && active.coord && (
                <>
                  <line
                    x1={active.coord.x}
                    x2={active.coord.x}
                    y1={PAD.top}
                    y2={PAD.top + plotH}
                    stroke="var(--color-line-strong)"
                    strokeWidth="1"
                  />
                  <circle
                    cx={active.coord.x}
                    cy={active.coord.y}
                    r="5"
                    fill={SERIES_COLOR}
                    stroke="var(--color-surface)"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          )}

          {active && active.coord && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-line bg-surface px-3 py-2 shadow-[0_4px_16px_rgba(22,21,28,0.10)]"
              style={{
                left: Math.min(Math.max(active.coord.x + 8, 60), width - 52),
                top: active.coord.y - 4,
              }}
            >
              <p className="text-[0.6875rem] text-ink-muted">
                {active.point.label}
              </p>
              <p className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                {active.point.value}%
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
