"use client";

import { useState } from "react";

import { useTasks } from "@/components/tasks/TaskProvider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/lib/tasks";
import { twoDigit } from "@/lib/utils";
import type { NewTaskInput, TaskCategory, TaskPriority } from "@/types/task";

interface FormState {
  title: string;
  date: string;
  time: string;
  category: TaskCategory | "";
  priority: TaskPriority | "";
}

/** Today, and the next half-hour slot — the usual intent when adding a task. */
function defaultSchedule(): { date: string; time: string } {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + (30 - (now.getMinutes() % 30)));

  return {
    date: `${now.getFullYear()}-${twoDigit(now.getMonth() + 1)}-${twoDigit(now.getDate())}`,
    time: `${twoDigit(now.getHours())}:${twoDigit(now.getMinutes())}`,
  };
}

export function NewTaskDialog() {
  const { dialogOpen, closeNewTask, addTask } = useTasks();

  return (
    <Dialog
      open={dialogOpen}
      onClose={closeNewTask}
      title="Add task"
      description="Track a procedure, appointment or admin item."
    >
      {/* Mounted only while the dialog is open, so the form starts fresh — and
          `new Date()` never runs during a server render. */}
      <NewTaskForm
        onCancel={closeNewTask}
        onCreate={(input) => {
          addTask(input);
          closeNewTask();
        }}
      />
    </Dialog>
  );
}

function NewTaskForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (input: NewTaskInput) => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    title: "",
    category: "",
    priority: "medium",
    ...defaultSchedule(),
  }));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) return setError("Give the task a title.");
    if (!form.date) return setError("Pick a date.");
    if (!form.time) return setError("Pick a time.");
    if (!form.category) return setError("Choose a category.");
    if (!form.priority) return setError("Choose a priority.");

    onCreate({
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      category: form.category,
      priority: form.priority,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Task title"
        name="title"
        autoFocus
        placeholder="e.g. Day 5 blastocyst grading"
        value={form.title}
        invalid={Boolean(error) && !form.title.trim()}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          name="date"
          type="date"
          value={form.date}
          invalid={Boolean(error) && !form.date}
          onChange={(event) => setForm({ ...form, date: event.target.value })}
        />
        <Input
          label="Time"
          name="time"
          type="time"
          value={form.time}
          invalid={Boolean(error) && !form.time}
          onChange={(event) => setForm({ ...form, time: event.target.value })}
        />
      </div>

      <Select
        label="Category"
        name="category"
        options={TASK_CATEGORIES}
        placeholder="Select category"
        value={form.category}
        invalid={Boolean(error) && !form.category}
        onChange={(event) =>
          setForm({ ...form, category: event.target.value as TaskCategory })
        }
      />

      <Select
        label="Priority"
        name="priority"
        options={TASK_PRIORITIES}
        placeholder="Select priority"
        value={form.priority}
        invalid={Boolean(error) && !form.priority}
        onChange={(event) =>
          setForm({ ...form, priority: event.target.value as TaskPriority })
        }
      />

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-critical/25 bg-critical/5 px-3.5 py-2.5 text-[0.8125rem] text-critical"
        >
          {error}
        </p>
      )}

      <div className="flex gap-2.5 pt-1">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Create task
        </Button>
      </div>
    </form>
  );
}
