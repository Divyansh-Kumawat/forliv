"use client";

import type { ReactNode } from "react";

import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  /** Shown on the right of the header, e.g. a filled-field count. */
  meta?: string;
  children: ReactNode;
}

export function AccordionSection({
  id,
  title,
  open,
  onToggle,
  meta,
  children,
}: AccordionSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className={cn(
            "flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left",
            "transition-colors duration-150",
            open ? "bg-brand-50" : "bg-surface hover:bg-surface-muted",
          )}
        >
          <span
            className={cn(
              "text-[0.9375rem] font-semibold tracking-[-0.01em]",
              open ? "text-brand-700" : "text-ink",
            )}
          >
            {title}
          </span>
          <span className="flex items-center gap-3">
            {meta && (
              <span className="text-xs tabular-nums text-ink-muted">{meta}</span>
            )}
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                open ? "rotate-180 text-brand-600" : "text-ink-muted",
              )}
            />
          </span>
        </button>
      </h2>

      {open && (
        <div id={`${id}-panel`} className="border-t border-line px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}
