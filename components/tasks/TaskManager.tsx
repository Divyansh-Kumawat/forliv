"use client";

import { useMemo, useState } from "react";

import { useTasks } from "@/components/tasks/TaskProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, PlusIcon } from "@/components/ui/icons";
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  PRIORITY_STYLES,
  byScheduledDesc,
  formatTaskDateTime,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import type { PriorityFilter } from "@/types/task";

const PER_PAGE = 10;

const FILTERS: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function TaskManager() {
  const { tasks, ready, openNewTask, toggleTask, removeTask } = useTasks();
  const [filter, setFilter] = useState<PriorityFilter>("all");
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const filtered =
      filter === "all"
        ? tasks
        : tasks.filter((task) => task.priority === filter);
    return [...filtered].sort(byScheduledDesc);
  }, [tasks, filter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  // Clamp rather than reset, so removing the last row on page 3 lands on page 2.
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const rows = visible.slice(start, start + PER_PAGE);

  function changeFilter(value: PriorityFilter) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
            Task Manager
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Track clinical tasks, procedures and administrative activities.
          </p>
        </div>

        {/* One filter row above everything it scopes. */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={filter}
              onChange={(event) =>
                changeFilter(event.target.value as PriorityFilter)
              }
              className="h-10 appearance-none rounded-xl border border-line bg-surface pl-3.5 pr-9 text-sm text-ink transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
            >
              {FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </div>

          <Button size="sm" onClick={openNewTask}>
            <PlusIcon className="h-4 w-4" />
            New task
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-muted/60 text-left">
                <th scope="col" className="w-14 px-5 py-3 font-medium text-ink-muted">
                  Sl. no
                </th>
                <th scope="col" className="px-3 py-3 font-medium text-ink-muted">
                  Task title
                </th>
                <th scope="col" className="w-28 px-3 py-3 font-medium text-ink-muted">
                  Priority
                </th>
                <th scope="col" className="w-36 px-3 py-3 font-medium text-ink-muted">
                  Category
                </th>
                <th scope="col" className="w-48 px-3 py-3 font-medium text-ink-muted">
                  Date &amp; time
                </th>
                <th scope="col" className="w-24 px-5 py-3 text-right font-medium text-ink-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!ready ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-b border-line/60">
                    <td colSpan={6} className="px-5 py-3.5">
                      <div className="h-4 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <p className="text-sm font-medium text-ink">
                      {filter === "all"
                        ? "No tasks yet"
                        : `No ${filter}-priority tasks`}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-ink-muted">
                      {filter === "all"
                        ? "Create your first task to start tracking work."
                        : "Try a different priority filter."}
                    </p>
                    {filter === "all" && (
                      <Button size="sm" className="mt-4" onClick={openNewTask}>
                        <PlusIcon className="h-4 w-4" />
                        New task
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((task, index) => (
                  <tr
                    key={task.id}
                    className="group border-b border-line/60 last:border-0 hover:bg-surface-muted/50"
                  >
                    <td className="px-5 py-3.5 tabular-nums text-ink-muted">
                      {start + index + 1}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          "font-medium",
                          task.done
                            ? "text-ink-muted line-through"
                            : "text-ink",
                        )}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-0.5 text-[0.6875rem] font-medium",
                          PRIORITY_STYLES[task.priority],
                        )}
                      >
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-ink-soft">
                      {CATEGORY_LABEL[task.category]}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums text-ink-soft">
                      {formatTaskDateTime(task.date, task.time)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          aria-label={
                            task.done
                              ? `Mark "${task.title}" as not done`
                              : `Mark "${task.title}" as done`
                          }
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            task.done
                              ? "text-good hover:bg-good/10"
                              : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                          )}
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <circle cx="10" cy="10" r="7.5" />
                            <path d="m6.5 10 2.5 2.5 4.5-5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          aria-label={`Delete "${task.title}"`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {ready && visible.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <p className="text-[0.8125rem] text-ink-muted">
              Showing {start + 1} to {Math.min(start + PER_PAGE, visible.length)}{" "}
              of {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </p>

            {totalPages > 1 && (
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <PagerButton
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  Previous
                </PagerButton>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
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
        )}
      </Card>
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
