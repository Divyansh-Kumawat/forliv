"use client";

import { useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import {
  ChevronLeftIcon,
  EditIcon,
  EmbryoIcon,
  SpermIcon,
} from "@/components/ui/icons";
import { Tabs } from "@/components/ui/tabs";
import { DETAIL_TABS, FIELD_META } from "@/lib/patient-fields";
import {
  EMPTY_MARK,
  bmiCategory,
  calculateBmi,
  formatFieldValue,
} from "@/lib/patients";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patient";

export function PatientDetail({ patient }: { patient: Patient }) {
  const [active, setActive] = useState(DETAIL_TABS[0].id);
  const tab = DETAIL_TABS.find((entry) => entry.id === active) ?? DETAIL_TABS[0];

  const bmi = calculateBmi(patient.heightCm, patient.weightKg);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href="/patients"
          aria-label="Back to patients"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>

        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
            Patient details for{" "}
            <span className="font-mono text-brand-600">{patient.patientId}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {patient.name ?? "Name not recorded"} · Age {patient.age} ·{" "}
            {patient.location}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          {/* Which analysis workflow applies is decided by the recorded sex. */}
          {patient.sex === "male" && (
            <Link
              href={`/sperm-analysis/${encodeURIComponent(patient.patientId)}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-100"
            >
              <SpermIcon className="h-4 w-4" />
              Sperm analysis
            </Link>
          )}
          {patient.sex === "female" && (
            <Link
              href={`/embryo-tracking/${encodeURIComponent(patient.patientId)}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-100"
            >
              <EmbryoIcon className="h-4 w-4" />
              Embryo tracking
            </Link>
          )}

          <Link
            href={`/patients/${encodeURIComponent(patient.patientId)}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700"
          >
            <EditIcon className="h-4 w-4" />
            Edit patient
          </Link>
        </div>
      </div>

      {patient.sex === null && (
        <p className="rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-2.5 text-[0.8125rem] text-warning">
          Sex isn&apos;t recorded, so no analysis workflow is offered. Set it on
          the patient record to enable sperm analysis or embryo tracking.
        </p>
      )}

      {/* Vitals summary — BMI is derived, so it lives here rather than in a tab. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Blood group" value={patient.bloodGroup ?? EMPTY_MARK} />
        <SummaryTile
          label="Height"
          value={patient.heightCm ? `${patient.heightCm} cm` : EMPTY_MARK}
        />
        <SummaryTile
          label="Weight"
          value={patient.weightKg ? `${patient.weightKg} kg` : EMPTY_MARK}
        />
        <SummaryTile
          label="BMI"
          value={bmi === null ? EMPTY_MARK : String(bmi)}
          hint={bmi === null ? "Needs height and weight" : bmiCategory(bmi)}
        />
      </div>

      <Tabs
        tabs={DETAIL_TABS.map((entry) => ({ id: entry.id, title: entry.title }))}
        active={active}
        onChange={setActive}
        label="Patient record sections"
      />

      <Card className="p-5">
        <div
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
        >
          <dl className="grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
            {tab.fields.map((field) => {
              const value = formatFieldValue(patient, field);
              return (
                <div
                  key={field}
                  className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-3"
                >
                  <dt className="shrink-0 text-[0.8125rem] font-medium text-ink-soft">
                    {FIELD_META[field].label}
                  </dt>
                  <dd
                    className={cn(
                      "text-right text-[0.8125rem]",
                      value === EMPTY_MARK
                        ? "text-ink-muted/70"
                        : "font-medium text-ink",
                    )}
                  >
                    {value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </Card>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-[0.8125rem] font-medium text-ink-soft">{label}</p>
      <p className="mt-1.5 text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-ink">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </Card>
  );
}
