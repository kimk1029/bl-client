"use client";

import { useSyncExternalStore } from "react";

// Mirror of eventBookmarks for meetups. Client-only storage via localStorage.
const STORAGE_KEY = "blessing:meetupBookmarks:v1";

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
    /* ignore quota / privacy errors */
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

const EMPTY: BookmarkSet = new Set();

export const meetupBookmarks = {
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

export function useMeetupBookmarks(): BookmarkSet {
  return useSyncExternalStore(
    meetupBookmarks.subscribe,
    meetupBookmarks.get,
    meetupBookmarks.getServer,
  );
}

export function useMeetupBookmarked(id: number): boolean {
  const set = useMeetupBookmarks();
  return set.has(id);
}
