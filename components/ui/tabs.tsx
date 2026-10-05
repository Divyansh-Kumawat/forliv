"use client";

import { cn } from "@/lib/utils";

interface TabsProps<T extends string> {
  tabs: { id: T; title: string }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex flex-wrap gap-1.5 rounded-2xl border border-line bg-surface p-1.5"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-150",
              selected
                ? "bg-brand-600 text-white"
                : "text-ink-soft hover:bg-surface-muted hover:text-ink",
            )}
          >
            {tab.title}
          </button>
        );
      })}
    </div>
  );
}
