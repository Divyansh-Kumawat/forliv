"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { createEmbryoId, writeStoredEmbryos } from "@/lib/embryos";
import { embryosStore } from "@/lib/stores/analyses";
import type { Embryo, NewEmbryoInput } from "@/types/analysis";

const NONE: Embryo[] = [];

interface UseEmbryosResult {
  /** Scoped to `patientId` when given, ordered by label. */
  embryos: Embryo[];
  ready: boolean;
  /** Saves a record completed by the analysis wizard. */
  addEmbryo: (input: NewEmbryoInput) => void;
  removeEmbryo: (id: string) => void;
  /** Embryo counts keyed by patient ID, across every patient. */
  countsByPatient: Record<string, number>;
}

function commit(next: Embryo[]) {
  writeStoredEmbryos(next);
  embryosStore.refresh();
}

export function useEmbryos(patientId?: string): UseEmbryosResult {
  const snapshot = useSyncExternalStore(
    embryosStore.subscribe,
    embryosStore.getSnapshot,
    embryosStore.getServerSnapshot,
  );

  const all = snapshot.ready ? snapshot.value : NONE;

  const embryos = useMemo(() => {
    const scoped = patientId
      ? all.filter((entry) => entry.patientId === patientId)
      : all;
    return [...scoped].sort((a, b) => a.label.localeCompare(b.label));
  }, [all, patientId]);

  const countsByPatient = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const embryo of all) {
      counts[embryo.patientId] = (counts[embryo.patientId] ?? 0) + 1;
    }
    return counts;
  }, [all]);

  // Mutations read the store rather than a render-time copy, so a wizard step
  // that resolves later can't write back a stale list.
  const addEmbryo = useCallback((input: NewEmbryoInput) => {
    const embryo: Embryo = {
      ...input,
      id: createEmbryoId(),
      createdAt: new Date().toISOString(),
    };
    commit([embryo, ...embryosStore.peek()]);
  }, []);

  const removeEmbryo = useCallback((id: string) => {
    commit(embryosStore.peek().filter((entry) => entry.id !== id));
  }, []);

  return {
    embryos,
    ready: snapshot.ready,
    addEmbryo,
    removeEmbryo,
    countsByPatient,
  };
}
