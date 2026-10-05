"use client";

import { createLocalStore } from "@/lib/local-store";
import { TASKS_STORAGE_KEY, readStoredTasks } from "@/lib/tasks";
import type { Task } from "@/types/task";

export const tasksStore = createLocalStore<Task[]>(
  TASKS_STORAGE_KEY,
  readStoredTasks,
);
