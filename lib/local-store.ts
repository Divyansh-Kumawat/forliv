"use client";

type Listener = () => void;

export type StoreSnapshot<T> =
  /** Server render and the hydration pass, before storage has been read. */
  | { ready: false; value: null }
  | { ready: true; value: T };

/** Stable reference — a new object here would loop `useSyncExternalStore`. */
const PENDING: StoreSnapshot<never> = { ready: false, value: null };

export interface LocalStore<T> {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => StoreSnapshot<T>;
  getServerSnapshot: () => StoreSnapshot<T>;
  /** Re-read from storage and notify subscribers. Call after every write. */
  refresh: () => void;
  /**
   * The current value, without subscribing. Mutations should build their next
   * state from this rather than from a render-time copy — a handler that runs
   * later (a timeout, an await) would otherwise write back a stale list.
   */
  peek: () => T;
}

/**
 * Wraps localStorage as an external store for `useSyncExternalStore`.
 *
 * Reading storage in an effect and calling setState works, but triggers a
 * cascading render on every mount and trips `react-hooks/set-state-in-effect`.
 * This gives the same hydration-safe behaviour — a "pending" snapshot during
 * SSR and hydration, real data immediately after — with no effect at all, plus
 * cross-tab sync for free via the `storage` event.
 *
 * Writes stay with the domain helpers that own each storage format; callers
 * write, then call `refresh()`.
 */
export function createLocalStore<T>(
  keys: string | string[],
  read: () => T,
): LocalStore<T> {
  const watched = Array.isArray(keys) ? keys : [keys];
  const listeners = new Set<Listener>();

  // Cached so repeated getSnapshot calls return an identical reference.
  let snapshot: StoreSnapshot<T> | null = null;

  function reload() {
    snapshot = { ready: true, value: read() };
  }

  function current(): T {
    if (!snapshot) reload();
    return (snapshot as { ready: true; value: T }).value;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);

      const onStorage = (event: StorageEvent) => {
        // A null key means the whole store was cleared.
        if (event.key !== null && !watched.includes(event.key)) return;
        reload();
        emit();
      };

      window.addEventListener("storage", onStorage);

      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },

    getSnapshot() {
      if (!snapshot) reload();
      return snapshot as StoreSnapshot<T>;
    },

    getServerSnapshot() {
      return PENDING;
    },

    refresh() {
      reload();
      emit();
    },

    peek: current,
  };
}
