"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "blessing:notifsLastReadAt:v1";

let state: string | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(v: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (v === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
}

function ensure() {
  if (hydrated) return;
  state = read();
  hydrated = true;
}

function emit() {
  listeners.forEach((l) => l());
}

export const notifsRead = {
  subscribe(l: () => void) {
    ensure();
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
  get(): string | null {
    ensure();
    return state;
  },
  getServer(): string | null {
    return null;
  },
  markAllRead() {
    const now = new Date().toISOString();
    state = now;
    write(now);
    emit();
  },
};

export function useNotifsLastReadAt(): string | null {
  return useSyncExternalStore(
    notifsRead.subscribe,
    notifsRead.get,
    notifsRead.getServer,
  );
}

export function isUnread(createdAtIso: string, lastReadIso: string | null): boolean {
  if (!lastReadIso) return true;
  return new Date(createdAtIso).getTime() > new Date(lastReadIso).getTime();
}
