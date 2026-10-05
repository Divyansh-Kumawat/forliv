import type { ComponentType, SVGProps } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Metric } from "@/types/dashboard";

interface StatCardProps {
  metric: Metric;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({ metric, icon: Icon }: StatCardProps) {
  const { delta } = metric;
  const trend = delta === undefined || delta === 0 ? "flat" : delta > 0 ? "up" : "down";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-ink-soft">
          {metric.label}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        {/* Proportional figures — tabular-nums makes display sizes look loose. */}
        <span className="text-[2.125rem] font-semibold leading-none tracking-[-0.03em] text-ink">
          {metric.value}
        </span>
        {trend !== "flat" && (
          <span
            className={cn(
              "text-[0.8125rem] font-medium",
              trend === "up" ? "text-good" : "text-warning",
            )}
          >
            {trend === "up" ? "▲" : "▼"} {Math.abs(delta ?? 0)}%
          </span>
        )}
      </div>

      {metric.hint && (
        <p className="mt-2 text-xs text-ink-muted">{metric.hint}</p>
      )}
    </Card>
  );
}
