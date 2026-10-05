"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { PatientCard } from "@/components/patients/PatientCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import { usePatients } from "@/hooks/usePatients";

export function PatientsBoard() {
  const { patients, ready, removePatient } = usePatients();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter(
      (patient) =>
        patient.patientId.toLowerCase().includes(term) ||
        (patient.name ?? "").toLowerCase().includes(term),
    );
  }, [patients, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
            Patient information
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Track and manage IVF cycles — from sperm collection to embryo
            transfer.
          </p>
        </div>
        <Link
          href="/patients/new"
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-3.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add patient
        </Link>
      </div>

      {/* One filter row above everything it scopes. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-ink-muted">
          {ready
            ? `${visible.length} of ${patients.length} ${
                patients.length === 1 ? "patient" : "patients"
              }`
            : "Loading…"}
        </p>
        <div className="relative w-full sm:w-72">
          <label htmlFor="patient-search" className="sr-only">
            Search by patient ID or name
          </label>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="patient-search"
            type="search"
            placeholder="Search by patient ID or name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted/80 transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
          />
        </div>
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Card
              key={index}
              className="h-[16.5rem] animate-pulse bg-surface-muted/60"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-ink">
            {patients.length === 0 ? "No patients yet" : "No matching patients"}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            {patients.length === 0
              ? "Add your first patient to start tracking cycles."
              : `Nothing matches “${query}”.`}
          </p>
          {patients.length === 0 ? (
            <Link
              href="/patients/new"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add patient
            </Link>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onDelete={removePatient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
