"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchIcon, UserIcon } from "@/components/ui/icons";
import { usePatients } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patient";

const PER_PAGE = 9;

interface PatientSelectGridProps {
  /** Rows are linked to `${basePath}/${patientId}`. */
  basePath: string;
  /** Restricts the list to one sex; omit to show everyone. */
  sex?: Patient["sex"];
  /** Extra stat shown on each card, e.g. an embryo or sample count. */
  countLabel?: string;
  counts?: Record<string, number>;
  emptyMessage: string;
}

export function PatientSelectGrid({
  basePath,
  sex,
  countLabel,
  counts,
  emptyMessage,
}: PatientSelectGridProps) {
  const { patients, ready } = usePatients();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const eligible = useMemo(
    () => (sex ? patients.filter((patient) => patient.sex === sex) : patients),
    [patients, sex],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return eligible;
    return eligible.filter(
      (patient) =>
        patient.patientId.toLowerCase().includes(term) ||
        (patient.name ?? "").toLowerCase().includes(term),
    );
  }, [eligible, query]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const rows = visible.slice(start, start + PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
          Patients list
        </h2>
        <div className="relative w-full sm:w-72">
          <label htmlFor="analysis-patient-search" className="sr-only">
            Search by patient ID or name
          </label>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="analysis-patient-search"
            type="search"
            placeholder="Search by patient ID"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted/80 transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
          />
        </div>
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Card
              key={index}
              className="h-32 animate-pulse bg-surface-muted/60"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="text-sm font-medium text-ink">
            {visible.length === 0 && eligible.length > 0
              ? "No matching patients"
              : "No patients available"}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            {visible.length === 0 && eligible.length > 0
              ? `Nothing matches “${query}”.`
              : emptyMessage}
          </p>
          {visible.length === 0 && eligible.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          )}
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((patient) => (
              <Link
                key={patient.id}
                href={`${basePath}/${encodeURIComponent(patient.patientId)}`}
                className="group rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                      {patient.patientId}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {patient.name ? `${patient.name} · ` : ""}Age{" "}
                      {patient.age}
                    </p>
                  </div>
                </div>

                <dl className="mt-3.5 space-y-1.5 border-t border-line pt-3 text-[0.8125rem]">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-medium text-ink-soft">Location</dt>
                    <dd className="truncate font-medium text-ink">
                      {patient.location}
                    </dd>
                  </div>
                  {countLabel && (
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-medium text-ink-soft">{countLabel}</dt>
                      <dd className="font-medium tabular-nums text-ink">
                        {counts?.[patient.patientId] ?? 0}
                      </dd>
                    </div>
                  )}
                </dl>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.8125rem] text-ink-muted">
              {start + 1} to {Math.min(start + PER_PAGE, visible.length)} of{" "}
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </p>

            {totalPages > 1 && (
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <PagerButton
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  Previous
                </PagerButton>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setPage(number)}
                      aria-current={number === safePage ? "page" : undefined}
                      className={cn(
                        "h-8 min-w-8 rounded-lg px-2 text-[0.8125rem] font-medium tabular-nums transition-colors",
                        number === safePage
                          ? "bg-brand-600 text-white"
                          : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                      )}
                    >
                      {number}
                    </button>
                  ),
                )}
                <PagerButton
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  Next
                </PagerButton>
              </nav>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PagerButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-8 rounded-lg px-2.5 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
