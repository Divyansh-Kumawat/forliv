"use client";

import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface StepperProps {
  steps: Step[];
  /** Zero-based index of the step being shown. */
  current: number;
  /** Lets the user jump back to a completed step. */
  onJump?: (index: number) => void;
}

export function Stepper({ steps, current, onJump }: StepperProps) {
  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const Icon = step.icon;
        const reachable = done && onJump;

        return (
          <li
            key={step.id}
            className={cn("flex flex-1 flex-col items-center", index === 0 && "items-start", index === steps.length - 1 && "items-end")}
          >
            <div className="flex w-full items-center">
              {/* Connector before the node, except on the first step. */}
              {index > 0 && (
                <span
                  className={cn(
                    "h-px flex-1",
                    done || active ? "bg-brand-500" : "bg-line-strong",
                  )}
                />
              )}

              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done && "border-brand-600 bg-brand-600 text-white",
                  active && "border-brand-600 bg-surface text-brand-600",
                  !done && !active && "border-line-strong bg-surface text-ink-muted",
                  reachable && "cursor-pointer hover:bg-brand-50",
                )}
              >
                {done ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                  </svg>
                ) : (
                  <Icon className="h-[18px] w-[18px]" />
                )}
              </button>

              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1",
                    done ? "bg-brand-500" : "bg-line-strong",
                  )}
                />
              )}
            </div>

            <span
              className={cn(
                "mt-2 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.1em]",
                active
                  ? "text-brand-700"
                  : done
                    ? "text-ink-soft"
                    : "text-ink-muted",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
