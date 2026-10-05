"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { signOut as clearSession } from "@/lib/auth";
import { sessionStore } from "@/lib/stores/session";
import type { Session } from "@/types/auth";

interface UseAuthResult {
  session: Session | null;
  /** False during SSR and hydration, before storage has been read. */
  ready: boolean;
  signOut: () => void;
}

/**
 * Reads the placeholder session from the browser-side store. Once auth moves to
 * an httpOnly cookie this becomes a server-side lookup.
 */
export function useAuth(): UseAuthResult {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );

  const signOut = useCallback(() => {
    clearSession();
    sessionStore.refresh();
    router.replace("/login");
  }, [router]);

  return {
    session: snapshot.ready ? snapshot.value : null,
    ready: snapshot.ready,
    signOut,
  };
}
