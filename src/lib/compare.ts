'use client';
import { useSyncExternalStore } from 'react';

const KEY = 'compare-universities';
const MAX = 4;
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { cache = []; }
  return cache!;
}
function write(ids: string[]) {
  cache = ids;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* хувийн горим */ }
  listeners.forEach((l) => l());
}
const EMPTY: string[] = [];

export function useCompare() {
  const ids = useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, read, () => EMPTY);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    /** false → дээд хязгаарт хүрсэн */
    toggle: (id: string) => { if (ids.includes(id)) { write(ids.filter((i) => i !== id)); return true; } if (ids.length >= MAX) return false; write([...ids, id]); return true; },
    remove: (id: string) => write(ids.filter((i) => i !== id)),
    clear: () => write([]),
  };
}
