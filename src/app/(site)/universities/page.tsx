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
const FILTER_KEYS = ['country', 'degree', 'type', 'subject', 'ranking', 'scholarship', 'intake', 'city', 'language', 'mode', 'international'];

function UniversitiesInner() {
  const f = useUrlState();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(f.values.q ?? '');
  useEffect(() => { setQ(f.values.q ?? ''); }, [f.values.q]);
  useEffect(() => { const h = setTimeout(() => { if ((f.values.q ?? '') !== q) f.set({ q: q || undefined }); }, 350); return () => clearTimeout(h); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const page = Math.max(1, Number(f.values.page) || 1);
  const query = { ...f.values, page, pageSize: PAGE_SIZE };
  const { data, isLoading, isFetching, error, refetch } = useQuery<{ items: UniCard[]; total: number }>({ queryKey: ['universities', query], queryFn: () => api('/universities', { query }), placeholderData: (p) => p });
  const activeFilters = FILTER_KEYS.filter((k) => f.values[k]).length;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const filters = (
    <div className="grid gap-5">
      <div className="flex items-center justify-between"><p className="text-h4">{t.common.filters}</p><Button variant="ghost" size="sm" onClick={f.reset} disabled={!activeFilters && !f.values.q}>{t.common.clear}</Button></div>
      <UniversityFilters f={f} />
    </div>
  );

  return (
    <PageContainer className="py-8 md:py-12">
      <div className="flex items-start gap-8">
        <aside aria-label={t.common.filters} className="hidden w-72 shrink-0 rounded-lg border bg-card p-4 lg:block">{filters}</aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-16 z-sticky -mx-4 mb-4 flex flex-wrap items-center gap-2 bg-background/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0 lg:static lg:bg-transparent lg:p-0">
            <div className="relative min-w-52 flex-[1_1_260px]"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={U.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.common.search} /></div>
            <SimpleSelect className="w-full sm:w-60" options={SORTS} value={f.values.sort ?? 'name'} onValueChange={(v) => f.set({ sort: v === 'name' ? undefined : v })} aria-label={t.common.sort} />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontal />{U.showFilters}{activeFilters ? ` (${activeFilters})` : ''}</Button></SheetTrigger>
              <SheetContent side="left"><SheetTitle className="sr-only">{t.common.filters}</SheetTitle>{filters}<Button fullWidth className="sticky bottom-0 mt-2" onClick={() => setOpen(false)}>{t.common.apply}{data ? ` · ${data.total} ${t.common.results}` : ''}</Button></SheetContent>
            </Sheet>
          </div>
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
