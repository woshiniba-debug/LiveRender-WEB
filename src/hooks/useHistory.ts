"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { GenerateResult, HistoryEntry } from "@/lib/types";

const HISTORY_KEY = "aiwd_history";

/**
 * Internal store: `Map<prompt, HistoryEntry>` for O(1) dedup by prompt,
 * plus an `order` array for newest-first iteration. We expose a derived
 * frozen array to React via useSyncExternalStore (no SSR/effect mismatch).
 */
interface Store {
  entries: Map<string, HistoryEntry>;
  order: string[];
}

let store: Store = { entries: new Map(), order: [] };
let materialized: HistoryEntry[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function rematerialize() {
  materialized = store.order
    .map((p) => store.entries.get(p))
    .filter((e): e is HistoryEntry => !!e);
}

function notify() {
  rematerialize();
  listeners.forEach((l) => l());
}

function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return;
    const entries = new Map<string, HistoryEntry>();
    const order: string[] = [];
    for (const e of parsed) {
      if (!entries.has(e.prompt)) {
        entries.set(e.prompt, e);
        order.push(e.prompt);
      }
    }
    store = { entries, order };
    rematerialize();
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(materialized));
  } catch {
    /* ignore quota */
  }
}

function pushEntry(prompt: string, result: GenerateResult, max: number) {
  const entry: HistoryEntry = {
    id: String(Date.now()),
    prompt,
    result,
    createdAt: Date.now(),
  };
  const entries = new Map(store.entries);
  entries.set(prompt, entry);
  const order = [prompt, ...store.order.filter((p) => p !== prompt)].slice(0, max);
  for (const key of entries.keys()) {
    if (!order.includes(key)) entries.delete(key);
  }
  store = { entries, order };
  notify();
  persist();
}

function clearAll() {
  store = { entries: new Map(), order: [] };
  notify();
  persist();
}

function subscribe(cb: () => void) {
  hydrateOnce();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  hydrateOnce();
  return materialized;
}

const EMPTY: HistoryEntry[] = [];
function getServerSnapshot() {
  return EMPTY;
}

export function useHistory(maxSize = 5) {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const push = useCallback(
    (prompt: string, result: GenerateResult) => pushEntry(prompt, result, maxSize),
    [maxSize]
  );

  const clear = useCallback(() => clearAll(), []);

  return useMemo(() => ({ entries, push, clear }), [entries, push, clear]);
}
