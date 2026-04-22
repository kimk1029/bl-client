"use client";

type ComposeState = {
  canSubmit: boolean;
  onSubmit: (() => void) | null;
};

let state: ComposeState = { canSubmit: false, onSubmit: null };
const listeners = new Set<() => void>();

export const composeBus = {
  get(): ComposeState {
    return state;
  },
  set(partial: Partial<ComposeState>) {
    state = { ...state, ...partial };
    listeners.forEach((l) => l());
  },
  reset() {
    state = { canSubmit: false, onSubmit: null };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export const composeServerSnapshot: ComposeState = {
  canSubmit: false,
  onSubmit: null,
};
