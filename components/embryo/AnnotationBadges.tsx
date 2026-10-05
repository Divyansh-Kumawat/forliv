import { EMBRYO_STRUCTURES } from "@/lib/embryos";
import { cn } from "@/lib/utils";
import type { EmbryoAnnotations } from "@/types/analysis";

/** Which of the four structures were segmented, as labelled chips. */
export function AnnotationBadges({
  annotations,
}: {
  annotations: EmbryoAnnotations;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {EMBRYO_STRUCTURES.map((structure) => {
        const marked = Boolean(annotations?.[structure.id]);

        return (
          <span
            key={structure.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.625rem] font-medium",
              marked ? "text-ink" : "text-ink-muted/70",
            )}
            style={
              marked
                ? { backgroundColor: `${structure.color}1F` }
                : { backgroundColor: "var(--color-surface-muted)" }
            }
            title={`${structure.full}${marked ? "" : " — not annotated"}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: marked
                  ? structure.color
                  : "var(--color-line-strong)",
              }}
              aria-hidden="true"
            />
            {structure.label}
          </span>
        );
      })}
    </div>
  );
}
