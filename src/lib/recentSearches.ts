"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "blessing:recentSearches:v1";
const MAX_ITEMS = 8;
const EMPTY: ReadonlyArray<string> = [];

let state: ReadonlyArray<string> = [];
let hydrated = false;
const listeners = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((s): s is string => typeof s === "string").slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function write(next: ReadonlyArray<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota/private errors */
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

export const recentSearches = {
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
  get(): ReadonlyArray<string> {
    ensureHydrated();
    return state;
  },
  getServer(): ReadonlyArray<string> {
    return EMPTY;
  },
  add(q: string) {
    const v = q.trim();
    if (!v) return;
    ensureHydrated();
    const next = [v, ...state.filter((x) => x !== v)].slice(0, MAX_ITEMS);
    state = next;
    write(next);
    emit();
  },
  remove(q: string) {
    ensureHydrated();
    const next = state.filter((x) => x !== q);
    state = next;
    write(next);
    emit();
  },
  clear() {
    state = [];
    write(state);
    emit();
  },
};

export function useRecentSearches(): ReadonlyArray<string> {
  return useSyncExternalStore(
    recentSearches.subscribe,
    recentSearches.get,
    recentSearches.getServer,
  );
}
