'use client';
import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { useUrlState } from '@/lib/urlState';
import { cn } from '@/lib/utils';
import { CardSkeleton, StateBoundary } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { Input } from '@/components/ui/form-controls';
import { Pagination } from '@/components/ui/misc';
import { CareerMatchCard } from '@/components/assessment/career-match-card';

const SIZE = 12;
interface CareerCategoryOption { slug: string; nameMn: string }
interface CareerListItem { slug: string; nameMn: string; nameEn?: string; description?: string; categoryId?: { nameMn?: string } | null }

function Inner() {
  const f = useUrlState();
  const [q, setQ] = useState(f.values.q ?? '');
  useEffect(() => { const h = setTimeout(() => { if ((f.values.q ?? '') !== q) f.set({ q: q || undefined }); }, 350); return () => clearTimeout(h); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const page = Number(f.values.page) || 1;
  const cats = useQuery<CareerCategoryOption[]>({ queryKey: ['career-cats'], queryFn: () => api('/careers/categories') });
  const query = { q: f.values.q, category: f.values.category, page, pageSize: SIZE };
  const { data, isLoading, error, refetch } = useQuery<{ items: CareerListItem[]; total: number }>({ queryKey: ['careers', query], queryFn: () => api('/careers', { query }), placeholderData: (p) => p });
  const cur = f.values.category ?? '';
  const chips = [{ slug: '', nameMn: t.common.all }, ...(cats.data ?? [])];

  return (
    <PageContainer className="py-8 md:py-12">
      <PageHeader mascot="think" title={t.careers.title} description={t.careers.subtitle} />
      <div className="relative mb-4 max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={t.common.search} aria-label={t.common.search} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div role="group" aria-label={t.careers.category} className="mb-6 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button key={c.slug} type="button" aria-pressed={cur === c.slug} onClick={() => f.set({ category: c.slug || undefined })}
            className={cn('rounded-full border px-3.5 py-1.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', cur === c.slug ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}>{c.nameMn}</button>
        ))}
      </div>
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.items.length === 0}
        skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} className="h-48" />)}</div>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((c) => <CareerMatchCard key={c.slug} m={{ slug: c.slug, nameMn: c.nameMn, nameEn: c.nameEn ?? '', score: 0, category: c.categoryId?.nameMn, description: c.description }} className="[&_[role=img]]:hidden" />)}
        </div>
        <Pagination className="mt-8" page={page} total={Math.ceil((data?.total ?? 0) / SIZE)} onChange={(p) => f.set({ page: p === 1 ? undefined : p }, true)} />
      </StateBoundary>
      <p className="mt-6 text-caption text-muted-foreground">{t.careers.attribution}</p>
    </PageContainer>
  );
}
export default function CareersPage() { return <Suspense><Inner /></Suspense>; }
