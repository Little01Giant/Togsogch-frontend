'use client';
import { useEffect, useState } from 'react';

/** Хайлтын оролтыг хойшлуулах (debounce) */
export function useDebounce<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => { const h = setTimeout(() => setV(value), ms); return () => clearTimeout(h); }, [value, ms]);
  return v;
}

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  return [open, { open: () => setOpen(true), close: () => setOpen(false), toggle: () => setOpen((o) => !o), set: setOpen }] as const;
}
