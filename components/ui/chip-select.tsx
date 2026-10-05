"use client";

import type { FieldOption } from "@/lib/patient-fields";
import { cn } from "@/lib/utils";

interface ChipSelectProps {
  label: string;
  options: FieldOption[];
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Multi-select as toggle chips rather than a popover listbox — for short,
 * fixed option lists every choice stays visible and there's no menu to trap
 * focus in.
 */
export function ChipSelect({
  label,
  options,
  value,
  onChange,
}: ChipSelectProps) {
  function toggle(option: string) {
    onChange(
      value.includes(option)
        ? value.filter((entry) => entry !== option)
        : [...value, option],
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-[0.8125rem] font-medium text-ink-soft">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={selected}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[0.8125rem] transition-colors duration-150",
                selected
                  ? "border-brand-600 bg-brand-50 font-medium text-brand-700"
                  : "border-line text-ink-soft hover:border-line-strong hover:bg-surface-muted",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
