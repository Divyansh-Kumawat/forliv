"use client";

import { EMBRYOS_STORAGE_KEY, readStoredEmbryos } from "@/lib/embryos";
import { createLocalStore } from "@/lib/local-store";
import {
  SPERM_ANALYSES_STORAGE_KEY,
  readStoredAnalyses,
} from "@/lib/sperm-analyses";
import type { Embryo, SpermAnalysis } from "@/types/analysis";

export const spermAnalysesStore = createLocalStore<SpermAnalysis[]>(
  SPERM_ANALYSES_STORAGE_KEY,
  readStoredAnalyses,
);

export const embryosStore = createLocalStore<Embryo[]>(
  EMBRYOS_STORAGE_KEY,
  readStoredEmbryos,
);
