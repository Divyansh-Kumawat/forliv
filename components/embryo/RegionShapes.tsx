import { EMBRYO_STRUCTURES } from "@/lib/embryos";
import type { EmbryoAnnotations } from "@/types/analysis";

/**
 * The segmented regions as SVG, in the shared 0–100 box. Used by the annotation
 * editor and by the read-only report, so the two can never drift apart.
 */
export function RegionShapes({
  annotations,
  showLabels = true,
}: {
  annotations: EmbryoAnnotations;
  showLabels?: boolean;
}) {
  return (
    <>
      {EMBRYO_STRUCTURES.map((structure) => {
        const region = annotations?.[structure.id];
        if (!region) return null;

        return (
          <g key={structure.id}>
            {/* White halo keeps the region readable over any micrograph. */}
            <circle
              cx={region.cx}
              cy={region.cy}
              r={region.r}
              fill={structure.color}
              fillOpacity={0.16}
              stroke="#ffffff"
              strokeOpacity={0.9}
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={region.cx}
              cy={region.cy}
              r={region.r}
              fill="none"
              stroke={structure.color}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            {showLabels && (
              // Label travels with the region — colour is never the only cue.
              <text
                x={region.cx}
                y={region.cy - region.r - 1.5}
                textAnchor="middle"
                className="text-[4px] font-semibold"
                fill={structure.color}
                stroke="#ffffff"
                strokeWidth={0.6}
                paintOrder="stroke"
              >
                {structure.label}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

/** Static image with its annotations drawn on top. */
export function AnnotatedImage({
  imageSrc,
  annotations,
  alt,
  className,
}: {
  imageSrc: string | null;
  annotations: EmbryoAnnotations;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-ink/[0.06]"
      }
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- a runtime data URL, not a static asset
        <img
          src={imageSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-ink-muted">
          No image
        </span>
      )}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <RegionShapes annotations={annotations} showLabels={false} />
      </svg>
    </div>
  );
}
