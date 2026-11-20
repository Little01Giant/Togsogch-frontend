'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ExternalLink, GraduationCap, Lock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { useMe } from '@/lib/auth';
import { Flag, NoData, SourceBadge, StateBoundary } from '@/components/common';
import { MediaCredits } from '@/components/education/media-credits';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { Block, CollapsibleSource, ExpandableText, LockedPanel, PaidContent, RankingsBlock, TuitionEstimateBlock, latestRankings } from '@/features/universities/detail-sections';
import type { UniDetail } from '@/types/university';

const U = t.universities;
const S = t.s.uni;

export default function UniversityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: me } = useMe();
  const { data: u, isLoading, error, refetch } = useQuery<UniDetail>({ queryKey: ['university', slug, me?.id ?? null], queryFn: () => api(`/universities/${slug}`) });
  const ranks = latestRankings(u?.rankings);
  const lc = u?.country?.livingCostMonthlyUsd;
  const living = lc && (lc.min != null || lc.max != null) ? `${fmtNumber(lc.min ?? 0)} – ${fmtNumber(lc.max ?? 0)} USD` : null;

  return (
    <PageContainer className="px-2 py-4 md:py-8">
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        {u && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
            <Card className="overflow-hidden p-0">
              {u.images?.[0] && <img src={u.images[0]} alt="" className="h-40 w-full object-cover sm:h-64" />}
              <div className="p-2.5 sm:p-6">
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border sm:size-20 ${u.logoUrl ? 'bg-logo-surface' : 'bg-muted'}`}>
                    {u.logoUrl ? <img src={u.logoUrl} alt="" width={80} height={80} className="size-full object-contain p-1.5" /> : <GraduationCap className="size-8 text-muted-foreground" aria-hidden />}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base font-semibold leading-snug [overflow-wrap:anywhere]">{u.name}</h1>{u.nameMn && <p className="text-sm text-muted-foreground">{u.nameMn}</p>}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"><span className="flex items-center gap-1.5"><Flag code={u.country.code} size={18} />{u.country.nameMn}</span>{u.city && <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-4" aria-hidden />{u.city}</span>}</p>
                    {u.website && <a href={u.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-body-sm text-primary underline underline-offset-2 dark:text-secondary">{U.website}<ExternalLink className="size-3.5" aria-hidden /></a>}
                  </div>
                </div>
                <h2 className="mb-1 mt-5 text-h4">{S.intro}</h2>
                {u.description ? <ExpandableText text={u.description} /> : <p><NoData /></p>}
                <details className="group mt-3 text-caption">
                  <summary className="inline-flex cursor-pointer select-none items-center gap-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{S.credits.title}<ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden /></summary>
                  <MediaCredits media={u.media} />
                  <div className="mt-3"><SourceBadge source={u.source} hideStatus /></div>
                </details>
                {!u.access.unlocked && <div className="mt-4 flex justify-end"><Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><a href="#unlock"><Lock className="size-4" aria-hidden />{S.openInfo}</a></Button></div>}
              </div>
            </Card>

            {(u.images?.length ?? 0) > 1 && <Block title={S.gallery}><div className="flex flex-wrap gap-2">{u.images?.slice(1).map((src) => <img key={src} src={src} alt="" height={120} className="h-28 rounded-md object-cover" />)}</div></Block>}

            <RankingsBlock ranks={ranks} />

            {(u.country.tuitionEstimate?.items?.length ?? 0) > 0 && u.country.tuitionEstimate && <TuitionEstimateBlock estimate={u.country.tuitionEstimate} />}

            <Block title={S.livingCost}>
              <p className="text-h3">{living ?? <span className="text-body italic text-muted-foreground">{S.livingNone}</span>}{living && <span className="ml-1 text-body-sm font-normal text-muted-foreground">{S.perMonth}</span>}</p>
              {u.country.source?.sourceUrl && <CollapsibleSource name={u.country.source.sourceName} url={u.country.source.sourceUrl} />}
            </Block>

            {u.access.unlocked
              ? <PaidContent paid={u.paid} website={u.website} />
              : <LockedPanel uni={u} access={u.access} loggedIn={!!me} />}
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
