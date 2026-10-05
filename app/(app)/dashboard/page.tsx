import type { Metadata } from "next";

import { CycleTable } from "@/components/dashboard/CycleTable";
import { ScheduleStrip } from "@/components/dashboard/ScheduleStrip";
import { StatCard } from "@/components/dashboard/StatCard";
import { SuccessRateChart } from "@/components/dashboard/SuccessRateChart";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { EmbryoIcon, EraIcon, PatientsIcon } from "@/components/ui/icons";
import { METRICS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

const METRIC_ICONS = [EmbryoIcon, PatientsIcon, EraIcon];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WelcomeHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric, index) => (
          <StatCard
            key={metric.id}
            metric={metric}
            icon={METRIC_ICONS[index] ?? EmbryoIcon}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ScheduleStrip />
        </div>
        <div className="lg:col-span-3">
          <SuccessRateChart />
        </div>
      </div>

      <CycleTable />
    </div>
  );
}
