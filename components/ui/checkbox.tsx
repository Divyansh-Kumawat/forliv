import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={fieldId}
      className="inline-flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-soft select-none"
    >
      <span className="relative flex h-[18px] w-[18px] items-center justify-center">
        <input
          id={fieldId}
          type="checkbox"
          className={cn(
            "peer h-[18px] w-[18px] appearance-none rounded-[6px] border border-line-strong bg-surface",
            "transition-colors duration-150",
            "checked:border-brand-600 checked:bg-brand-600",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
            className,
          )}
          {...props}
        />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
          aria-hidden="true"
        >
          <path
            d="m3 8.5 3.2 3.2L13 5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </label>
  );
}
