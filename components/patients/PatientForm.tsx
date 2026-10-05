"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AccordionSection } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/ui/chip-select";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FIELD_META, FORM_SECTIONS } from "@/lib/patient-fields";
import { emptyPatient } from "@/lib/patients";
import { cn } from "@/lib/utils";
import type { NewPatientInput, Patient, PatientField } from "@/types/patient";

/** Multiselect fields hold arrays; everything else is held as a string. */
type FormState = Record<PatientField, string | string[]>;

const ALL_FIELDS = Object.keys(FIELD_META) as PatientField[];

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const text = (form: FormState, field: PatientField) =>
  typeof form[field] === "string" ? (form[field] as string) : "";

const list = (form: FormState, field: PatientField) =>
  Array.isArray(form[field]) ? (form[field] as string[]) : [];

function toFormState(patient: NewPatientInput): FormState {
  const state: FormState = {} as FormState;

  for (const field of ALL_FIELDS) {
    const meta = FIELD_META[field];
    const value = patient[field];

    if (meta.kind === "multiselect") {
      state[field] = Array.isArray(value) ? [...value] : [];
    } else if (meta.kind === "percent") {
      state[field] =
        typeof value === "number" ? String(Math.round(value * 100)) : "";
    } else if (value === null || value === undefined) {
      state[field] = "";
    } else {
      state[field] = String(value);
    }
  }

  return state;
}

function toPatientInput(form: FormState): NewPatientInput {
  const draft: Record<string, unknown> = {};

  for (const field of ALL_FIELDS) {
    const meta = FIELD_META[field];

    if (meta.kind === "multiselect") {
      draft[field] = list(form, field);
      continue;
    }

    const raw = text(form, field).trim();

    if (meta.kind === "boolean") {
      draft[field] = raw === "" ? null : raw === "true";
    } else if (meta.kind === "percent") {
      draft[field] = raw === "" ? null : Number(raw) / 100;
    } else if (meta.kind === "number") {
      draft[field] = raw === "" ? null : Number(raw);
    } else {
      draft[field] = raw === "" ? null : raw;
    }
  }

  return {
    ...(draft as NewPatientInput),
    // The non-nullable fields, re-applied with their guaranteed types.
    patientId: text(form, "patientId").trim(),
    location: text(form, "location").trim(),
    age: Number(text(form, "age")),
    activeEmbryos: Number(text(form, "activeEmbryos").trim() || 0),
  };
}

interface FieldError {
  field: PatientField;
  message: string;
  sectionId: string;
}

function validate(form: FormState, takenIds: string[]): FieldError | null {
  for (const section of FORM_SECTIONS) {
    for (const field of section.fields) {
      const meta = FIELD_META[field];
      const raw = meta.kind === "multiselect" ? "" : text(form, field).trim();

      if (meta.required && !raw) {
        return {
          field,
          message: `${meta.label} is required.`,
          sectionId: section.id,
        };
      }

      if ((meta.kind === "number" || meta.kind === "percent") && raw) {
        const value = Number(raw);
        if (Number.isNaN(value)) {
          return {
            field,
            message: `${meta.label} must be a number.`,
            sectionId: section.id,
          };
        }
        if (meta.min !== undefined && value < meta.min) {
          return {
            field,
            message: `${meta.label} must be at least ${meta.min}.`,
            sectionId: section.id,
          };
        }
        if (meta.max !== undefined && value > meta.max) {
          return {
            field,
            message: `${meta.label} must be at most ${meta.max}.`,
            sectionId: section.id,
          };
        }
      }
    }
  }

  const id = text(form, "patientId").trim().toLowerCase();
  if (takenIds.some((taken) => taken.toLowerCase() === id)) {
    return {
      field: "patientId",
      message: "That patient ID is already in use.",
      sectionId: "demographics",
    };
  }

  return null;
}

interface PatientFormProps {
  /** The record being edited, or null when creating. */
  patient: Patient | null;
  /** Patient IDs already in use, excluding the record being edited. */
  takenIds: string[];
  onSubmit: (input: NewPatientInput) => void;
  backHref: string;
}

export function PatientForm({
  patient,
  takenIds,
  onSubmit,
  backHref,
}: PatientFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    toFormState(patient ?? emptyPatient()),
  );
  const [error, setError] = useState<FieldError | null>(null);
  const [open, setOpen] = useState<string[]>([FORM_SECTIONS[0].id]);

  const allOpen = open.length === FORM_SECTIONS.length;

  const filledCounts = useMemo(() => {
    const counts: Record<string, string> = {};
    for (const section of FORM_SECTIONS) {
      const filled = section.fields.filter((field) =>
        FIELD_META[field].kind === "multiselect"
          ? list(form, field).length > 0
          : text(form, field).trim() !== "",
      ).length;
      counts[section.id] = `${filled}/${section.fields.length}`;
    }
    return counts;
  }, [form]);

  function setField(field: PatientField, value: string | string[]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleSection(id: string) {
    setOpen((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problem = validate(form, takenIds);
    if (problem) {
      setError(problem);
      // Reveal the section holding the problem, or the message points nowhere.
      setOpen((current) =>
        current.includes(problem.sectionId)
          ? current
          : [...current, problem.sectionId],
      );
      return;
    }

    setError(null);
    onSubmit(toPatientInput(form));
  }

  function renderField(field: PatientField) {
    const meta = FIELD_META[field];
    const label = meta.unit ? `${meta.label} (${meta.unit})` : meta.label;
    const invalid = error?.field === field;

    if (meta.kind === "multiselect") {
      return (
        <ChipSelect
          key={field}
          label={label}
          options={meta.options ?? []}
          value={list(form, field)}
          onChange={(next) => setField(field, next)}
        />
      );
    }

    if (meta.kind === "select" || meta.kind === "boolean") {
      return (
        <Select
          key={field}
          name={field}
          label={label}
          options={meta.kind === "boolean" ? BOOLEAN_OPTIONS : meta.options ?? []}
          placeholder={meta.required ? `Select ${meta.label.toLowerCase()}` : "No data"}
          allowEmpty={!meta.required}
          invalid={invalid}
          value={text(form, field)}
          onChange={(event) => setField(field, event.target.value)}
        />
      );
    }

    const numeric = meta.kind === "number" || meta.kind === "percent";

    return (
      <Input
        key={field}
        name={field}
        label={label}
        type={numeric ? "number" : "text"}
        min={meta.min}
        max={meta.max}
        step={meta.step}
        placeholder={meta.placeholder}
        invalid={invalid}
        value={text(form, field)}
        onChange={(event) => setField(field, event.target.value)}
        className={field === "patientId" ? "font-mono" : undefined}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-5xl pb-24">
      <div className="flex items-start gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
            {patient ? "Edit patient" : "Add patient"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {patient
              ? `Update the record for ${patient.patientId}.`
              : "Register a patient and their cycle data."}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(allOpen ? [] : FORM_SECTIONS.map((section) => section.id))
          }
          className="ml-auto mt-0.5 shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {FORM_SECTIONS.map((section) => (
          <AccordionSection
            key={section.id}
            id={section.id}
            title={section.title}
            meta={filledCounts[section.id]}
            open={open.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field}
                  className={cn(FIELD_META[field].full && "sm:col-span-2")}
                >
                  {renderField(field)}
                </div>
              ))}
            </div>
          </AccordionSection>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          {error && (
            <p role="alert" className="mr-auto text-[0.8125rem] text-critical">
              {error.message}
            </p>
          )}
          <Link
            href={backHref}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
          >
            Cancel
          </Link>
          <Button type="submit">
            {patient ? "Save changes" : "Add patient"}
          </Button>
        </div>
      </div>
    </form>
  );
}
