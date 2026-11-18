'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** Шүүлтүүрийн төлөвийг URL query-тэй синхрон хадгална (хуваалцах боломжтой холбоос). Массив → "a,b". */
export function useUrlState() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const values = useMemo(() => Object.fromEntries(sp.entries()) as Record<string, string>, [sp]);
  const list = useCallback((k: string) => (values[k] ? values[k].split(',') : []), [values]);
  const set = useCallback((patch: Record<string, string | string[] | number | boolean | undefined>, keepPage = false) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      const s = Array.isArray(v) ? v.join(',') : v === undefined || v === false ? '' : String(v);
      if (s) p.set(k, s); else p.delete(k);
    }
    if (!keepPage && !('page' in patch)) p.delete('page');
    const qs = p.toString();
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [sp, router, path]);
  const reset = useCallback(() => router.replace(path, { scroll: false }), [router, path]);
  return { values, list, set, reset };
}
