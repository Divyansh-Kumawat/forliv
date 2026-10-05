"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { Card, CardHeader } from "@/components/ui/card";
import { SCHEDULE_BY_DAY_OFFSET } from "@/lib/mock-data";
import { cn, dayLabel, twoDigit } from "@/lib/utils";
import type { ScheduleEntry } from "@/types/dashboard";

const DAYS_SHOWN = 6;

const KIND_STYLES: Record<ScheduleEntry["kind"], string> = {
  retrieval: "bg-brand-100 text-brand-700",
  transfer: "bg-good/10 text-good",
  biopsy: "bg-warning/10 text-warning",
  assessment: "bg-surface-muted text-ink-soft",
};

interface DayCell {
  offset: number;
  label: string;
  date: string;
}

/** "Today" is a browser-only value; the server has no opinion on it. */
const subscribeToNothing = () => () => {};
const readToday = () => new Date().toDateString();
const noTodayOnServer = () => null;

export function ScheduleStrip() {
  // Resolves to null during SSR and hydration, then to the real date — so the
  // markup never disagrees with the server.
  const today = useSyncExternalStore(
    subscribeToNothing,
    readToday,
    noTodayOnServer,
  );
  const [selected, setSelected] = useState(0);

  const days = useMemo<DayCell[]>(() => {
    if (!today) return [];
    const start = new Date(today);

    return Array.from({ length: DAYS_SHOWN }, (_, offset) => {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      return {
        offset,
        label: dayLabel(date),
        date: twoDigit(date.getDate()),
      };
    });
  }, [today]);

  const entries = SCHEDULE_BY_DAY_OFFSET[selected] ?? [];

  return (
    <Card className="flex flex-col">
      <CardHeader title="Next schedule" subtitle="Procedures across the week" />

      <div className="flex gap-1.5 px-5">
        {days.length === 0
          ? Array.from({ length: DAYS_SHOWN }, (_, index) => (
              <div
                key={index}
                className="h-[3.75rem] flex-1 animate-pulse rounded-xl bg-surface-muted"
              />
            ))
          : days.map((day) => {
              const active = day.offset === selected;
              const count = (SCHEDULE_BY_DAY_OFFSET[day.offset] ?? []).length;

              return (
                <button
                  key={day.offset}
                  type="button"
                  onClick={() => setSelected(day.offset)}
                  aria-pressed={active}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2.5",
                    "transition-colors duration-150",
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line text-ink-soft hover:border-line-strong hover:bg-surface-muted",
                  )}
                >
                  <span className="text-[0.6875rem] uppercase tracking-wide">
                    {day.label}
                  </span>
                  <span className="text-[0.9375rem] font-semibold tabular-nums">
                    {day.date}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 h-1.5 w-1.5 rounded-full",
                      count > 0
                        ? active
                          ? "bg-brand-600"
                          : "bg-brand-300"
                        : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
      </div>

      <div className="flex-1 px-5 pb-5 pt-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.8125rem] text-ink-muted">
            Nothing scheduled for this day.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5"
              >
                <span className="font-mono text-xs tabular-nums text-ink-muted">
                  {entry.time}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-ink">
                    {entry.title}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {entry.patient}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium capitalize",
                    KIND_STYLES[entry.kind],
                  )}
                >
                  {entry.kind}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
