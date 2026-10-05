"use client";

import { useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EditIcon, TrashIcon, UserIcon } from "@/components/ui/icons";
import {
  CARD_CAPTION,
  CARD_FIELDS,
  FIELD_META,
} from "@/lib/patient-fields";
import { EMPTY_MARK, NO_DATA, formatFieldValue } from "@/lib/patients";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onDelete: (id: string) => void;
}

const SEX_LABEL = { male: "Male", female: "Female" } as const;

export function PatientCard({ patient, onDelete }: PatientCardProps) {
  const [confirming, setConfirming] = useState(false);
  const href = `/patients/${encodeURIComponent(patient.patientId)}`;

  const group = patient.sex ?? "unknown";
  const fields = CARD_FIELDS[group];

  return (
    <Card className="relative flex flex-col p-4 transition-colors hover:border-line-strong">
      {/* Overlay link so the whole card opens the record, while the action
          buttons sit above it on their own stacking level. */}
      <Link
        href={href}
        aria-label={`View details for patient ${patient.patientId}`}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <UserIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
              {patient.patientId}
            </p>
            <p className="truncate text-xs text-ink-muted">
              {patient.name ? `${patient.name} · ` : ""}Age {patient.age}
            </p>
          </div>
        </div>

        <div className="relative z-20 flex shrink-0 items-center gap-0.5">
          {confirming ? (
            <>
              <button
                type="button"
                onClick={() => onDelete(patient.id)}
                className="rounded-lg bg-critical/10 px-2 py-1 text-[0.6875rem] font-medium text-critical transition-colors hover:bg-critical/15"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg px-2 py-1 text-[0.6875rem] font-medium text-ink-soft transition-colors hover:bg-surface-muted"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link
                href={`${href}/edit`}
                aria-label={`Edit patient ${patient.patientId}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <EditIcon className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Delete patient ${patient.patientId}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="rounded-md bg-surface-muted px-2 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
          {patient.sex ? SEX_LABEL[patient.sex] : "Sex not set"}
        </span>
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-ink-muted">
          {CARD_CAPTION[group]}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 text-[0.8125rem]">
        {fields.map((field) => {
          const raw = formatFieldValue(patient, field);
          const value = raw === EMPTY_MARK ? NO_DATA : raw;

          return (
            <div
              key={field}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="shrink-0 font-medium text-ink-soft">
                {FIELD_META[field].label}
              </dt>
              <dd
                className={cn(
                  "truncate text-right",
                  value === NO_DATA
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
    </Card>
  );
}
