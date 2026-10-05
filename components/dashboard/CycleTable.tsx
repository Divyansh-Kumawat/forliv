import { Card, CardHeader } from "@/components/ui/card";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { ACTIVE_CYCLES, CYCLE_STATUS_LABEL } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CycleRow } from "@/types/dashboard";

/** Status colours are reserved tokens, paired with a text label — never colour alone. */
const STATUS_STYLES: Record<CycleRow["status"], string> = {
  "on-track": "bg-good/10 text-good",
  review: "bg-warning/10 text-warning",
  stimulation: "bg-brand-50 text-brand-700",
  cryo: "bg-surface-muted text-ink-soft",
};

export function CycleTable() {
  return (
    <Card>
      <CardHeader
        title="Active cycles"
        subtitle="Patients currently in treatment"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            View all
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </button>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-y border-line text-left">
              <th scope="col" className="px-5 py-2.5 font-medium text-ink-muted">
                Patient
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium text-ink-muted">
                Protocol
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium text-ink-muted">
                Day
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium text-ink-muted">
                Embryos
              </th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium text-ink-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {ACTIVE_CYCLES.map((cycle) => (
              <tr
                key={cycle.id}
                className="border-b border-line/60 last:border-0 hover:bg-surface-muted/60"
              >
                <td className="px-5 py-3 font-medium text-ink">{cycle.patient}</td>
                <td className="px-3 py-3 text-ink-soft">{cycle.protocol}</td>
                <td className="px-3 py-3 text-right tabular-nums text-ink-soft">
                  {cycle.day}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-ink-soft">
                  {cycle.embryos}
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 py-0.5 text-[0.6875rem] font-medium",
                      STATUS_STYLES[cycle.status],
                    )}
                  >
                    {CYCLE_STATUS_LABEL[cycle.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
