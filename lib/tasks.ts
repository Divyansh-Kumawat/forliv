import type { Task, TaskCategory, TaskPriority } from "@/types/task";

export const TASKS_STORAGE_KEY = "forlivf.tasks";

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "appointment", label: "Appointment" },
  { value: "treatment", label: "Treatment" },
  { value: "follow-up", label: "Follow-up" },
  { value: "administrative", label: "Administrative" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const CATEGORY_LABEL: Record<TaskCategory, string> = {
  appointment: "Appointment",
  treatment: "Treatment",
  "follow-up": "Follow-up",
  administrative: "Administrative",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/**
 * Priority reuses the reserved status tokens — it is a severity, not an identity.
 * Every badge also carries its label, so the colour is never the only signal.
 */
export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-critical/10 text-critical",
  medium: "bg-warning/10 text-warning",
  low: "bg-surface-muted text-ink-soft",
};

/** Sort newest-scheduled first, matching how the table reads. */
export function byScheduledDesc(a: Task, b: Task): number {
  return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
}

/**
 * Formats without constructing a Date — avoids timezone drift between the
 * server render and the browser.
 */
export function formatTaskDateTime(date: string, time: string): string {
  const [rawHour, rawMinute] = time.split(":");
  const hour = Number(rawHour);
  if (Number.isNaN(hour)) return date;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${date} ${hour12}:${rawMinute ?? "00"} ${suffix}`;
}

export function createTaskId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Seeded on first run so the table isn't empty before anything is created. */
export const SEED_TASKS: Task[] = [
  {
    id: "seed-1",
    title: "Day 5 blastocyst grading — batch 2291",
    date: "2026-08-14",
    time: "09:15",
    category: "treatment",
    priority: "high",
    done: false,
    createdAt: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "seed-2",
    title: "Consent review with patient #A-2264",
    date: "2026-08-14",
    time: "14:30",
    category: "appointment",
    priority: "medium",
    done: false,
    createdAt: "2026-08-10T09:05:00.000Z",
  },
  {
    id: "seed-3",
    title: "Incubator CO₂ calibration log",
    date: "2026-08-13",
    time: "08:00",
    category: "administrative",
    priority: "medium",
    done: true,
    createdAt: "2026-08-09T11:20:00.000Z",
  },
  {
    id: "seed-4",
    title: "Post-transfer follow-up call — #A-2188",
    date: "2026-08-12",
    time: "16:45",
    category: "follow-up",
    priority: "low",
    done: false,
    createdAt: "2026-08-08T15:00:00.000Z",
  },
  {
    id: "seed-5",
    title: "Witness sign-off on cryo inventory",
    date: "2026-08-11",
    time: "10:00",
    category: "administrative",
    priority: "high",
    done: false,
    createdAt: "2026-08-07T10:00:00.000Z",
  },
];

export function readStoredTasks(): Task[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) return SEED_TASKS;

  try {
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : SEED_TASKS;
  } catch {
    return SEED_TASKS;
  }
}

export function writeStoredTasks(tasks: Task[]): void {
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
