"use client";

import { readRememberedCenter, readRememberedUser, readSession } from "@/lib/auth";
import {
  REMEMBERED_CENTER_KEY,
  REMEMBERED_USER_KEY,
  SESSION_STORAGE_KEY,
} from "@/lib/constants";
import { createLocalStore } from "@/lib/local-store";
import type { Session } from "@/types/auth";

export const sessionStore = createLocalStore<Session | null>(
  SESSION_STORAGE_KEY,
  readSession,
);

export interface RememberedCredentials {
  username: string;
  centerId: string;
}

export const rememberedStore = createLocalStore<RememberedCredentials>(
  [REMEMBERED_USER_KEY, REMEMBERED_CENTER_KEY],
  () => ({
    username: readRememberedUser(),
    centerId: readRememberedCenter(),
  }),
);
