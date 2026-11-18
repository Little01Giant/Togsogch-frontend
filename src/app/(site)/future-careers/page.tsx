'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtDate, t } from '@/i18n';
import { cn } from '@/lib/utils';
import { EmptyState, NoData, StateBoundary } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { CareerIcon } from '@/components/education/career-icon';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Card, Progress } from '@/components/ui/data-display';

const P = t.p4;

/** Редакцийн 25 нэр дэвшигч: ангилалаар шүүж, дүрстэй картаар харуулна. */
function Candidates({ items }: { items: any[] }) {
  const [cat, setCat] = useState<string>('');
  const cats = Array.from(new Map(items.filter((c) => c.category).map((c) => [c.categorySlug ?? c.category, c.category])).entries());
  const shown = cat ? items.filter((c) => (c.categorySlug ?? c.category) === cat) : items;
  return (
    <Card className="p-4 md:p-5">
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t.s.future.categoryFilter}>
        {[['', t.common.all] as const, ...cats].map(([k, label]) => (
          <button key={k || 'all'} type="button" onClick={() => setCat(k)} aria-pressed={cat === k}
            className={cn('rounded-full border px-3 py-1 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', cat === k ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}>{label}</button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((c) => (
          <li key={c.slug}>
            <Link href={`/careers/${c.slug}`} className="group flex h-full items-center gap-3 rounded-lg border bg-card p-3 transition-[border-color,box-shadow] hover:border-ring/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <CareerIcon category={c.categorySlug} />
              <span className="min-w-0 flex-1">
                <span className="block text-body-sm font-semibold leading-snug">{c.nameMn}</span>
                <span className="mt-0.5 block text-caption text-muted-foreground">{c.category ?? c.nameEn}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function FutureCareers() {
  const { data, isLoading, error, refetch } = useQuery<any>({ queryKey: ['future'], queryFn: () => api('/future-careers') });
  const m = data?.methodology;
  return (
    <PageContainer className="py-4 md:py-6">
      <PageHeader mascot="cheer" title={P.futureTitle} />
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="grid gap-4 md:gap-5">
            {data.published && <Alert variant="warning" hideIcon>{data.disclaimer}</Alert>}
            {!data.published && data.candidates?.length > 0 && <Candidates items={data.candidates} />}
            {!data.published && !data.candidates?.length && <EmptyState title={P.notPublished} hint={P.notPublishedHint} action={<Button asChild variant="outline"><Link href="/careers">{t.nav.careers}</Link></Button>} />}
            {data.ranked.map((c: any) => (
              <Card key={c.slug} className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <CareerIcon category={c.categorySlug} />
                    <div className="min-w-0"><h2 className="text-body font-semibold md:text-h3"><span className="mr-2 text-muted-foreground">#{c.rank}</span>{c.nameMn}</h2><p className="text-body-sm text-muted-foreground">{c.nameEn}{c.category ? ` · ${c.category}` : ''}</p></div>
                  </div>
                  <div className="shrink-0 text-right"><p className="text-caption text-muted-foreground">{P.score}</p><p className="text-h2 text-primary dark:text-secondary">{c.score}</p></div>
                </div>
                <div className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">{Object.keys(m.weights).map((k) => <div key={k} className="flex items-center gap-2"><span className="w-36 shrink-0 text-caption md:w-44">{P.criteria[k]}</span><Progress value={c.scores[k]} className="h-1.5 flex-1" /><span className="w-7 text-right text-caption">{c.scores[k]}</span></div>)}</div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <p className="text-caption text-muted-foreground">{t.source.label}: {c.source.url ? <a href={c.source.url} target="_blank" rel="noopener noreferrer" className="text-primary underline dark:text-secondary">{c.source.name ?? c.source.url}</a> : <NoData />}{c.year ? ` · ${c.year}` : ''}{c.source.verifiedAt ? ` · ${t.source.verifiedAt}: ${fmtDate(c.source.verifiedAt)}` : ''}</p>
                  <Link href={`/careers/${c.slug}`} className="text-body-sm font-medium text-primary hover:underline dark:text-secondary">{P.viewCareer} →</Link>
                </div>
                <p className="mt-1 text-caption text-muted-foreground">{P.projection}</p>
              </Card>
            ))}
            <Card className="p-4 md:p-5">
              <h2 className="mb-3 text-body font-semibold md:text-h3">{P.methodology}</h2>
              <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-body-sm">
                <p><span className="text-muted-foreground">{P.researchYear}:</span> {m.year ? <Badge variant="outline">{m.year}</Badge> : <NoData />}</p>
                <p><span className="text-muted-foreground">{P.sources}:</span> {!m.sources?.length && <NoData />}</p>
              </div>
              {m.sources?.length > 0 && <ul className="-mt-3 mb-4 list-disc space-y-1 pl-5 text-body-sm">{m.sources.map((s: any) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline dark:text-secondary">{s.name}</a></li>)}</ul>}
              <h3 className="mb-2 text-label">{P.weights}</h3>
              <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {Object.entries(m.weights).map(([k, v]) => {
                  const pct = Math.round((v as number) * 100);
                  return <li key={k} className="grid gap-1"><div className="flex items-baseline justify-between gap-2 text-body-sm"><span>{P.criteria[k]}</span><span className="font-semibold tabular-nums">{pct}%</span></div><Progress value={pct} className="h-1.5" /></li>;
                })}
              </ul>
              {m.notes && <p className="mt-4 text-body-sm text-muted-foreground">{m.notes}</p>}
            </Card>
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
