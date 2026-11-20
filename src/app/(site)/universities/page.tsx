'use client';
import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { useUrlState } from '@/lib/urlState';
import { cn } from '@/lib/utils';
import { CardSkeleton, StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Pagination } from '@/components/ui/misc';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/overlays';
import { SimpleSelect } from '@/components/ui/select';
import { UniCard, UniversityCard } from '@/components/education/university-card';
import { UniversityFilters } from '@/components/education/university-filters';

const PAGE_SIZE = 12;
const U = t.universities;
const SORTS = [['name', U.sortName], ['qsWorld', U.sortQsWorld], ['qsAsia', U.sortQsAsia], ['newest', U.sortNewest]].map(([value, label]) => ({ value, label }));
/** Харагдаж буй шүүлтүүрүүд: улс, сургуулийн төрөл, рейтинг */
const FILTER_KEYS = ['country', 'type', 'ranking'];

function UniversitiesInner() {
  const f = useUrlState();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(f.values.q ?? '');
  useEffect(() => { setQ(f.values.q ?? ''); }, [f.values.q]);
  useEffect(() => { const h = setTimeout(() => { if ((f.values.q ?? '') !== q) f.set({ q: q || undefined }); }, 350); return () => clearTimeout(h); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const page = Math.max(1, Number(f.values.page) || 1);
  const query = { ...f.values, page, pageSize: PAGE_SIZE };
  const { data, isLoading, isFetching, error, refetch } = useQuery<{ items: UniCard[]; total: number }>({ queryKey: ['universities', query], queryFn: () => api('/universities', { query }), placeholderData: (p) => p, staleTime: 120_000 });
  const activeFilters = FILTER_KEYS.filter((k) => f.values[k]).length;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const sortSelect = (cls: string) => <SimpleSelect className={cls} options={SORTS} value={f.values.sort ?? 'name'} onValueChange={(v) => f.set({ sort: v === 'name' ? undefined : v })} aria-label={t.common.sort} />;
  const filters = (
    <div className="grid gap-5">
      <UniversityFilters f={f} />
      <div className="flex items-center justify-between border-t pt-3"><p className="text-h4">{t.common.filters}</p><Button variant="ghost" size="sm" onClick={f.reset} disabled={!activeFilters && !f.values.q}>{t.common.clear}</Button></div>
    </div>
  );

  return (
    <PageContainer className="py-8 md:py-12">
      <div className="flex items-start gap-8">
        <aside aria-label={t.common.filters} className="hidden w-72 shrink-0 rounded-lg border bg-card p-4 lg:block">{filters}</aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-[1_1_260px]"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={U.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.common.search} /></div>
            {/* Томоор: дээд самбарт. Утсан дээр: шүүлтүүрийн drawer дотор */}
            <div className="hidden lg:block">{sortSelect('lg:w-60')}</div>
          </div>
          {/* Утсан дээр: баруун доор (доод цэсний дээр) тогтмол дугуй дүрс товч; идэвхтэй шүүлтүүрийн тоо жижиг тэмдэгтэй.
              Дээд самбарын (backdrop-blur) ГАДНА байрлуулна: blur нь fixed элементийн байрлалын суурийг өөрчилдөг. */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label={`${U.showFilters}${activeFilters ? ` (${activeFilters})` : ''}`} className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-sticky grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden">
                <SlidersHorizontal className="size-6" aria-hidden />
                {activeFilters > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent text-caption font-bold text-accent-foreground">{activeFilters}</span>}
              </button>
            </SheetTrigger>
            <SheetContent side="right"><SheetTitle className="sr-only">{t.common.filters}</SheetTitle>
              <div className="grid gap-1.5"><p className="text-label">{t.common.sort}</p>{sortSelect('w-full')}</div>
              {filters}
              {/* Хайх товч drawer-ийн хамгийн доор тогтмол */}
              <div className="sticky bottom-0 -mx-6 -mb-6 mt-auto border-t bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><Button fullWidth onClick={() => setOpen(false)}><Search />{t.common.search}</Button></div>
            </SheetContent>
          </Sheet>
          <p className="mb-3 text-body-sm text-muted-foreground" aria-live="polite">{data ? `${data.total} ${t.common.results}` : ' '}</p>

          <StateBoundary isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.items.length === 0} emptyHint={U.noResultsHint}
            skeleton={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>}>
            <div className={cn('grid gap-5 sm:grid-cols-2 xl:grid-cols-3', isFetching && 'opacity-60 transition-opacity')}>{data?.items.map((u) => <UniversityCard key={u.id} u={u} />)}</div>
            <Pagination className="mt-8" page={page} total={totalPages} onChange={(p) => { f.set({ page: p === 1 ? undefined : p }, true); window.scrollTo({ top: 0 }); }} />
          </StateBoundary>
        </div>
      </div>
    </PageContainer>
  );
}

export default function UniversitiesPage() {
  return <Suspense><UniversitiesInner /></Suspense>;
}
