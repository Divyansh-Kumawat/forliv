export type TaskCategory =
  | "appointment"
  | "treatment"
  | "follow-up"
  | "administrative";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  /** ISO calendar date, `yyyy-mm-dd`. */
  date: string;
  /** 24-hour clock, `HH:mm`. */
  time: string;
  category: TaskCategory;
  priority: TaskPriority;
  done: boolean;
  /** ISO timestamp of creation. */
  createdAt: string;
}

export type NewTaskInput = Omit<Task, "id" | "done" | "createdAt">;

export type PriorityFilter = TaskPriority | "all";
