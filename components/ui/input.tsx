import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  invalid?: boolean;
  /** Rendered inside the field, on the right — e.g. a password reveal toggle. */
  trailing?: ReactNode;
}

export function Input({
  label,
  hint,
  invalid = false,
  trailing,
  className,
  id,
  ...props
}: InputProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-[0.8125rem] font-medium text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full rounded-xl border bg-surface px-3.5 text-[0.9375rem] text-ink",
            "placeholder:text-ink-muted/70",
            "transition-colors duration-150",
            "focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12",
            invalid ? "border-critical" : "border-line hover:border-line-strong",
            trailing ? "pr-11" : undefined,
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
