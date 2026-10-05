"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Built on the native `<dialog>` element, which gives us the top layer, focus
 * trapping and Escape-to-close for free — all of which a div-based modal would
 * have to re-implement (and usually gets wrong).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        // Clicks on the backdrop are retargeted to the dialog itself.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0",
        "text-ink shadow-[0_12px_40px_rgba(22,21,28,0.18)]",
        "backdrop:bg-ink/35 backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      {open && (
        <>
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2
                id="dialog-title"
                className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-0.5 text-[0.8125rem] text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1.5 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>
          <div className="px-5 py-5">{children}</div>
        </>
      )}
    </dialog>
  );
}
