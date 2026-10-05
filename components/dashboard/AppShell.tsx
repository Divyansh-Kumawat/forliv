"use client";

import { useState, type ReactNode } from "react";

import { AuthGate } from "@/components/common/AuthGate";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { NewTaskDialog } from "@/components/tasks/NewTaskDialog";
import { TaskProvider } from "@/components/tasks/TaskProvider";
import { TaskToast } from "@/components/tasks/TaskToast";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGate>
      {/* Tasks live at shell level so any page can open the form and every
          page sees the same list. */}
      <TaskProvider>
        <div className="flex min-h-dvh bg-canvas">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          </div>
        </div>

        <NewTaskDialog />
        <TaskToast />
      </TaskProvider>
    </AuthGate>
  );
}
