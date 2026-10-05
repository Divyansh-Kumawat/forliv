import type { Metadata } from "next";

import { TaskManager } from "@/components/tasks/TaskManager";

export const metadata: Metadata = {
  title: "Task Manager",
};

export default function TasksPage() {
  return <TaskManager />;
}
