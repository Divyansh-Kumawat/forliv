"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  newAnalysis,
  simulateResults,
  writeStoredAnalyses,
} from "@/lib/sperm-analyses";
import { spermAnalysesStore } from "@/lib/stores/analyses";
import type { AnalysisSource, SpermAnalysis } from "@/types/analysis";

const NONE: SpermAnalysis[] = [];

interface UseSpermAnalysesResult {
  /** Scoped to `patientId` when given, newest first. */
  analyses: SpermAnalysis[];
  ready: boolean;
  /** Queues a run and returns its id so the caller can track it. */
  startAnalysis: (
    patientId: string,
    sampleName: string,
    source: AnalysisSource,
    imageSrc: string | null,
  ) => string;
  /** Fills in results for a queued run. */
  completeAnalysis: (id: string) => void;
  removeAnalysis: (id: string) => void;
}

function commit(next: SpermAnalysis[]) {
  writeStoredAnalyses(next);
  spermAnalysesStore.refresh();
}

export function useSpermAnalyses(patientId?: string): UseSpermAnalysesResult {
  const snapshot = useSyncExternalStore(
    spermAnalysesStore.subscribe,
    spermAnalysesStore.getSnapshot,
    spermAnalysesStore.getServerSnapshot,
  );

  const all = snapshot.ready ? snapshot.value : NONE;

  const analyses = useMemo(() => {
    const scoped = patientId
      ? all.filter((entry) => entry.patientId === patientId)
      : all;
    return [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [all, patientId]);

  const startAnalysis = useCallback(
    (
      id: string,
      sampleName: string,
      source: AnalysisSource,
      imageSrc: string | null,
    ) => {
      const analysis = newAnalysis(id, sampleName, source, imageSrc);
      commit([analysis, ...spermAnalysesStore.peek()]);
      return analysis.id;
    },
    [],
  );

  // Runs on a timer after the queue call, so it reads the store rather than a
  // list captured at render time.
  const completeAnalysis = useCallback((id: string) => {
    commit(
      spermAnalysesStore
        .peek()
        .map((entry) =>
          entry.id === id
            ? { ...entry, status: "complete" as const, ...simulateResults() }
            : entry,
        ),
    );
  }, []);

  const removeAnalysis = useCallback((id: string) => {
    commit(spermAnalysesStore.peek().filter((entry) => entry.id !== id));
  }, []);

  return {
    analyses,
    ready: snapshot.ready,
    startAnalysis,
    completeAnalysis,
    removeAnalysis,
  };
}
