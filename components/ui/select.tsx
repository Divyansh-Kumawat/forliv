import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/ui/icons";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  /** Lets the placeholder be chosen again, for genuinely optional fields. */
  allowEmpty?: boolean;
}

/**
 * Native `<select>` behind brand styling — keeps mobile pickers and keyboard
 * behaviour for free, which a custom listbox would have to re-implement.
 */
export function Select({
  label,
  options,
  placeholder = "Choose an option",
  invalid = false,
  allowEmpty = false,
  className,
  id,
  ...props
}: SelectProps) {
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
        <select
          id={fieldId}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-surface pl-3.5 pr-10",
            "text-[0.9375rem] text-ink",
            "transition-colors duration-150",
            "focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12",
            invalid ? "border-critical" : "border-line hover:border-line-strong",
            !props.value && "text-ink-muted/80",
            className,
          )}
          {...props}
        >
          <option value="" disabled={!allowEmpty}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-ink">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </div>
    </div>
  );
}
