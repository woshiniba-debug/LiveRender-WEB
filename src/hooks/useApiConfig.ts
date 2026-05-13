"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ApiConfig } from "@/lib/types";

const STORAGE_KEY = "aiwd_api_config";

function readStored(): ApiConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ApiConfig>;
    if (parsed.apiKey && parsed.provider && parsed.model) {
      return parsed as ApiConfig;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

// External store backed by localStorage. useSyncExternalStore handles SSR
// (via the server snapshot) and lets us avoid an effect-then-setState pattern.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
let cachedSnapshot: ApiConfig | null = null;
let cacheValid = false;

function subscribe(cb: () => void) {
  listeners.add(cb);
  const storageListener = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cacheValid = false;
      cb();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", storageListener);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", storageListener);
    }
  };
}

function getSnapshot(): ApiConfig | null {
  if (!cacheValid) {
    cachedSnapshot = readStored();
    cacheValid = true;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): ApiConfig | null {
  return null;
}

/**
 * Encapsulates localStorage I/O for the API config. Uses useSyncExternalStore
 * so the value is correct on both server (always null) and client without
 * a setState-in-effect step.
 */
export function useApiConfig() {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const save = useCallback((next: ApiConfig | null) => {
    if (!next || !next.apiKey) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      cachedSnapshot = null;
      cacheValid = true;
      notify();
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
    cachedSnapshot = next;
    cacheValid = true;
    notify();
  }, []);

  const clear = useCallback(() => save(null), [save]);

  return { config, save, clear };
}
