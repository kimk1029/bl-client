"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "blessing:postBookmarks:v1";

type BookmarkSet = ReadonlySet<number>;
const EMPTY: BookmarkSet = new Set();

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
    /* ignore */
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

export const postBookmarks = {
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
};

export function usePostBookmarked(id: number): boolean {
  const set = useSyncExternalStore(
    postBookmarks.subscribe,
    postBookmarks.get,
    postBookmarks.getServer,
  );
  return set.has(id);
}
