"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useTasks } from "@/components/tasks/TaskProvider";

const DISMISS_AFTER_MS = 5000;

export function TaskToast() {
  const { toast, dismissToast } = useTasks();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-[0_8px_28px_rgba(22,21,28,0.14)] sm:left-auto sm:right-5 sm:translate-x-0"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good/12 text-good">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path d="m3 8.5 3.2 3.2L13 5" />
          </svg>
        </span>
        <p className="flex-1 text-[0.8125rem] text-ink">{toast}</p>
        <Link
          href="/tasks"
          onClick={dismissToast}
          className="shrink-0 text-[0.8125rem] font-medium text-brand-600 underline-offset-4 hover:underline"
        >
          View
        </Link>
      </div>
    </div>
  );
}
