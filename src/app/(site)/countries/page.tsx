'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { useDebounce } from '@/lib/hooks';
import { CardSkeleton, StateBoundary } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { Input } from '@/components/ui/form-controls';
import { CountryCard } from '@/components/education/country-card';

export default function CountriesPage() {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const { data, isLoading, error, refetch } = useQuery<{ items: any[] }>({ queryKey: ['countries', dq], queryFn: () => api('/countries', { query: { q: dq, pageSize: 100 } }) });
  return (
    <PageContainer className="py-4 md:py-6">
      <PageHeader mascot="happy" title={t.countries.title} />
      <div className="relative mb-6 max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={t.countries.search} aria-label={t.countries.search} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data?.items.length === 0}
        skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} className="h-44" />)}</div>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data?.items.map((c) => <CountryCard key={c.slug} c={c} />)}</div>
      </StateBoundary>
    </PageContainer>
  );
}
