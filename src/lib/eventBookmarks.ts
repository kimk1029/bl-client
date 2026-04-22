"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "blessing:eventBookmarks:v1";

type BookmarkSet = ReadonlySet<number>;

let state: BookmarkSet = new Set();
let hydrated = false;
const listeners = new Set<() => void>();

function read(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n): n is number => typeof n === "number"));
  } catch {
    return new Set();
  }
}

function write(next: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // ignore quota / privacy errors
  }
}

function ensureHydrated() {
  if (hydrated) return;
  state = read();
  hydrated = true;
}

function emit() {
  listeners.forEach((l) => l());
}

export const eventBookmarks = {
  subscribe(l: () => void) {
    ensureHydrated();
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        state = read();
        emit();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      listeners.delete(l);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  },
  get(): BookmarkSet {
    ensureHydrated();
    return state;
  },
  // Stable snapshot for SSR — always empty so SSR and first client render match.
  getServer(): BookmarkSet {
    return EMPTY;
  },
  toggle(id: number) {
    ensureHydrated();
    const next = new Set(state);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    state = next;
    write(next);
    emit();
  },
  has(id: number): boolean {
    ensureHydrated();
    return state.has(id);
  },
};

const EMPTY: BookmarkSet = new Set();

export function useEventBookmarks(): BookmarkSet {
  return useSyncExternalStore(
    eventBookmarks.subscribe,
    eventBookmarks.get,
    eventBookmarks.getServer,
  );
}

export function useEventBookmarked(id: number): boolean {
  const set = useEventBookmarks();
  return set.has(id);
}
