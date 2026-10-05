import { cn } from "@/lib/utils";

const SIZES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-[2.75rem] leading-none",
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
  /** Renders the wordmark only, without the accompanying descriptor. */
  bare?: boolean;
}

/**
 * The forlivf wordmark: "for" in ink, "livf" in brand violet, set tight and bold.
 * Text-based so it stays crisp at any size and inherits the app's font.
 */
export function Logo({ size = "md", className, bare = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-bold tracking-[-0.045em] text-ink select-none",
          SIZES[size],
        )}
      >
        for<span className="text-brand-600">livf</span>
      </span>
      {!bare && (
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Lab OS
        </span>
      )}
    </span>
  );
}

/** Compact square mark for tight spaces (collapsed sidebar, favicons, avatars). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-base font-bold tracking-[-0.04em] text-white select-none",
        className,
      )}
      aria-hidden="true"
    >
      f<span className="text-brand-300">l</span>
    </span>
  );
}
