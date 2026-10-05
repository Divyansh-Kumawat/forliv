"use client";

import { useTasks } from "@/components/tasks/TaskProvider";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";

export function WelcomeHeader() {
  const { session } = useAuth();
  const { openNewTask } = useTasks();

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
          Good to see you, {session?.displayName ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Here&apos;s what the lab looks like right now.
        </p>
      </div>
      <Button size="sm" onClick={openNewTask}>
        <PlusIcon className="h-4 w-4" />
        New task
      </Button>
    </div>
  );
}
