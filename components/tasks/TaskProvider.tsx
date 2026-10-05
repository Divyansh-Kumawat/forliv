"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { createTaskId, writeStoredTasks } from "@/lib/tasks";
import { tasksStore } from "@/lib/stores/tasks";
import type { NewTaskInput, Task } from "@/types/task";

interface TaskContextValue {
  tasks: Task[];
  /** False during SSR and hydration, before storage has been read. */
  ready: boolean;
  addTask: (input: NewTaskInput) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  dialogOpen: boolean;
  openNewTask: () => void;
  closeNewTask: () => void;
  toast: string | null;
  dismissToast: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

const NONE: Task[] = [];

/**
 * Holds the task list for the whole app shell, so the dashboard's "New task"
 * button and the Task Manager page write to and read from the same place.
 * Persisted to localStorage until a tasks API exists.
 */
export function TaskProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    tasksStore.subscribe,
    tasksStore.getSnapshot,
    tasksStore.getServerSnapshot,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const tasks = snapshot.ready ? snapshot.value : NONE;

  const commit = useCallback((next: Task[]) => {
    writeStoredTasks(next);
    tasksStore.refresh();
  }, []);

  const addTask = useCallback(
    (input: NewTaskInput) => {
      const task: Task = {
        ...input,
        id: createTaskId(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      commit([task, ...tasks]);
      setToast(`“${task.title}” added to Task Manager.`);
    },
    [tasks, commit],
  );

  const toggleTask = useCallback(
    (id: string) => {
      commit(
        tasks.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      );
    },
    [tasks, commit],
  );

  const removeTask = useCallback(
    (id: string) => {
      commit(tasks.filter((task) => task.id !== id));
    },
    [tasks, commit],
  );

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      ready: snapshot.ready,
      addTask,
      toggleTask,
      removeTask,
      dialogOpen,
      openNewTask: () => setDialogOpen(true),
      closeNewTask: () => setDialogOpen(false),
      toast,
      dismissToast: () => setToast(null),
    }),
    [
      tasks,
      snapshot.ready,
      addTask,
      toggleTask,
      removeTask,
      dialogOpen,
      toast,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used inside a TaskProvider.");
  }
  return context;
}
