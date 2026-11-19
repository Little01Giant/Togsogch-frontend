'use client';
import { MediaCredits } from '@/components/education/media-credits';
import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, GraduationCap, Lock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { useMe } from '@/lib/auth';
import { Flag, NoData, SourceBadge, StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Alert, Badge, Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { TuitionDisplay } from '@/components/education/tuition-display';
import { RankingBadge } from '@/components/education/ranking-badge';
import { UnlockButton, useProducts } from '@/features/paywall';

const U = t.universities;
const S = t.s.uni;
type Cat = 'tuition' | 'english' | 'exams' | 'procedure';

const Block = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => <Card className={`p-5 sm:p-6 ${className ?? ''}`}><h2 className="mb-3 text-h4">{title}</h2>{children}</Card>;
const Missing = () => <p className="italic text-muted-foreground">{S.notAvailable}</p>;
const Item = ({ children }: { children: React.ReactNode }) => <div className="rounded-md border bg-muted/40 p-3 text-body-sm">{children}</div>;

/** Төлбөртэй хэсэг: ЗӨВХӨН backend-ийн `paid` payload-оос зурагдана (нээгдээгүй бол энэ өгөгдөл хариунд байхгүй). */
function PaidContent({ paid }: { paid: any }) {
  /** Мэдээлэлгүй ангиллыг харуулахгүй (хоосон картууд хэрэглэгчид хэрэггүй); бүгд хоосон бол нэг л мэдэгдэл. */
  const sec = (k: Cat, body: React.ReactNode, has: boolean) => (has ? <Block key={k} title={S.cat[k]}>{body}</Block> : null);
  const hasAny = paid.tuition.length > 0 || paid.english.length > 0 || paid.languageRules.length > 0 || paid.exams.length > 0 || paid.procedure.steps.length > 0 || paid.procedure.links.length > 0;
  return (
    <div className="grid gap-4" data-testid="paid-content">
      {!hasAny && <Block title={S.paid}><Missing /></Block>}
      {sec('tuition', <div className="grid gap-3">{paid.tuition.map((x: any, i: number) => (
        <div key={i} className="rounded-md border bg-muted/40 p-4">
          <div className="mb-2 flex flex-wrap gap-1.5"><Badge variant="outline">{U.labelsDegree[x.level] ?? x.level}</Badge>{x.faculty && <Badge>{x.faculty}</Badge>}{x.feeType && <Badge variant="outline">{U.labelsFeeType[x.feeType]}</Badge>}</div>
          <TuitionDisplay tuition={x} />
          {x.otherFees && <p className="mt-2 text-body-sm"><span className="text-muted-foreground">{U.otherFees}: </span>{x.otherFees}</p>}
          {x.sourceUrl && <a href={x.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-caption text-primary underline dark:text-secondary">{t.source.label}</a>}
        </div>))}</div>, paid.tuition.length > 0)}
      {sec('english', (
        <div className="grid gap-4">
          {paid.english.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{paid.english.map((x: any, i: number) => <Item key={i}><b>{x.test}</b>{x.minScore && <> · {S.englishMin}: <b>{x.minScore}</b></>}{x.note && <p className="text-muted-foreground">{x.note}</p>}</Item>)}</div>}
          {paid.languageRules.length > 0 && (
            <div>
              <p className="mb-1 text-label">{S.rulesTitle}</p>
              <ul className="grid gap-2">{paid.languageRules.map((r: any, i: number) => <li key={i}><Item><p>{r.text}</p>{r.sourceUrl && <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-caption text-primary underline dark:text-secondary">{r.sourceName ?? t.source.label}{r.verifiedAt ? ` · ${r.verifiedAt}` : ''}</a>}</Item></li>)}</ul>
            </div>
          )}
        </div>
      ), paid.english.length > 0 || paid.languageRules.length > 0)}
      {sec('exams', <div className="grid gap-2 sm:grid-cols-2">{paid.exams.map((x: any, i: number) => <Item key={i}><b>{x.test}</b>{x.minScore && <> · {S.englishMin}: <b>{x.minScore}</b></>}{x.note && <p className="text-muted-foreground">{x.note}</p>}</Item>)}</div>, paid.exams.length > 0)}
      {sec('procedure', (
        <div className="grid gap-4">
          {paid.procedure.steps.length > 0 && <div><p className="mb-1 text-label">{S.procedureTitle}</p><ol className="list-decimal space-y-1 pl-5 text-body-sm">{paid.procedure.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}</ol></div>}
          {paid.procedure.links.length > 0 && <div><p className="mb-1 text-label">{S.linksTitle}</p><div className="flex flex-wrap gap-2">{paid.procedure.links.map((l: any) => <Button key={l.url} asChild variant="outline" size="sm"><a href={l.url} target="_blank" rel="noopener noreferrer">{l.title || S.applyLink}<ExternalLink /></a></Button>)}</div></div>}
        </div>
      ), paid.procedure.steps.length > 0 || paid.procedure.links.length > 0)}
    </div>
  );
}

/** Нээх сонголт: сургуулийг ганцаарчлан, эсвэл тухайн улсын бүх сургуулийг. Үнэ, эрхийг backend шийднэ. */
function BuyOption({ productKey, targetId, title, hint, flagCode }: { productKey: string; targetId: string; title: string; hint: string; flagCode?: string | null }) {
  const p = useProducts().data?.find((x) => x.key === productKey);
  if (!p) return null;
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex min-w-0 items-start gap-3">
        {flagCode && <span className="grid size-10 shrink-0 place-items-center rounded-md border bg-muted/50"><Flag code={flagCode} size={24} /></span>}
        <div className="min-w-0">
          <p className="text-body-sm font-semibold leading-snug">{title}</p>
          {hint && <p className="mt-0.5 text-caption text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <UnlockButton productKey={productKey} targetId={targetId} />
    </Card>
  );
}

function LockedPanel({ uni, access, me }: { uni: { id: string; name: string; country: { id: string; nameMn: string; code?: string | null; universityCount?: number } }; access: { categories: { key: Cat; available: boolean }[] }; me: any }) {
  return (
    <Card id="unlock" className="scroll-mt-20 border-accent/40 p-5 sm:p-6" data-testid="locked-panel">
      <h2 className="flex items-center gap-2 text-h3"><Lock className="size-5" aria-hidden />{S.lockedTitle}</h2>
      <p className="mt-1 hidden text-body-sm text-muted-foreground sm:block">{S.lockedText}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {access.categories.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2.5 text-body-sm" data-testid={`cat-${c.key}`}>
            <span className="flex items-center gap-2"><Lock className="size-3.5 text-muted-foreground" aria-hidden />{S.cat[c.key]}</span>
            {c.available && <Badge variant="secondary">{S.available}</Badge>}
          </li>
        ))}
      </ul>
      {me ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2" data-testid="buy-options">
          <BuyOption productKey="university_access" targetId={uni.id} title={uni.name} hint={S.uniHint} />
          <BuyOption productKey="country_access" targetId={uni.country.id} title={`${uni.country.nameMn} ${S.unlockCountrySuffix}`} flagCode={uni.country.code} hint={uni.country.universityCount != null ? `${S.countryHintTotal} ${fmtNumber(uni.country.universityCount)} ${S.countryHintUnits}` : ''} />
        </div>
      ) : <div className="mt-5"><Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link href="/login">{S.loginToUnlock}</Link></Button></div>}
    </Card>
  );
}

export default function UniversityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: me } = useMe();
  const { data: u, isLoading, error, refetch } = useQuery<any>({ queryKey: ['university', slug, me?.id ?? null], queryFn: () => api(`/universities/${slug}`) });
  /** Рейтингийн байгууллага бүрийн хамгийн сүүлийн ерөнхий (чиглэлийн биш) эрэмбэ */
  const ranks: any[] = Object.values(((u?.rankings ?? []) as any[]).filter((r) => !r.subject).reduce((m: Record<string, any>, r: any) => { if (!m[r.provider] || r.year > m[r.provider].year) m[r.provider] = r; return m; }, {}));
  const lc = u?.country?.livingCostMonthlyUsd;
  const living = lc && (lc.min != null || lc.max != null) ? `${fmtNumber(lc.min ?? 0)} – ${fmtNumber(lc.max ?? 0)} USD` : null;

  return (
    <PageContainer className="py-4 md:py-8">
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        {u && (
          <div className="grid gap-5">
            <Card className="overflow-hidden p-0">
              {u.images?.[0] && <img src={u.images[0]} alt="" className="h-48 w-full object-cover sm:h-64" />}
              <div className="p-5 sm:p-6">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted">
                    {u.logoUrl ? <img src={u.logoUrl} alt="" width={72} height={72} className="size-full object-contain" /> : <GraduationCap className="size-8 text-muted-foreground" aria-hidden />}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base font-semibold leading-snug [overflow-wrap:anywhere]">{u.name}</h1>{u.nameMn && <p className="text-sm text-muted-foreground">{u.nameMn}</p>}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"><span className="flex items-center gap-1.5"><Flag code={u.country.code} size={18} />{u.country.nameMn}</span>{u.city && <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-4" aria-hidden />{u.city}</span>}</p>
                    {u.website && <a href={u.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-body-sm text-primary underline underline-offset-2 dark:text-secondary">{U.website}<ExternalLink className="size-3.5" aria-hidden /></a>}
                  </div>
                </div>
                <h2 className="mb-1 mt-5 text-h4">{S.intro}</h2>
                <p>{u.description ?? <NoData />}</p>
                <MediaCredits media={u.media} />
                <div className="mt-3"><SourceBadge source={u.source} hideStatus /></div>
                {!u.access.unlocked && <div className="mt-4 flex justify-end"><Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><a href="#unlock"><Lock className="size-4" aria-hidden />{S.openInfo}</a></Button></div>}
              </div>
            </Card>

            {u.images?.length > 1 && <Block title={S.gallery}><div className="flex flex-wrap gap-2">{u.images.slice(1).map((src: string) => <img key={src} src={src} alt="" height={120} className="h-28 rounded-md object-cover" />)}</div></Block>}

            <Block title={U.rankings} className="min-w-0">
              {ranks.length
                ? <div className="grid gap-2" data-testid="uni-rankings">{ranks.map((r: any) => <RankingBadge key={`${r.provider}-${r.year}`} label={U.labelsRanking[r.provider] ?? r.provider} ranking={r} showSource className="[&>span:first-child]:w-20" />)}<p className="text-caption text-muted-foreground">{U.rankingNote}</p></div>
                : <p className="italic text-muted-foreground">{U.rankingNone}</p>}
            </Block>

            {u.country.tuitionEstimate?.items?.length > 0 && (
              <Block title={S.estTitle} className="min-w-0">
                <div className="grid gap-3" data-testid="tuition-estimate">
                  {u.country.tuitionEstimate.items.map((it: any) => (
                    <div key={it.currency} className="rounded-md border bg-muted/40 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="warning">{S.estBadge}</Badge><span className="text-caption text-muted-foreground">{it.n != null ? `${fmtNumber(it.n)} ${S.estSchools}` : S.estOfficial} · {it.currency} {S.estPerYear}</span></div>
                      <dl className="grid grid-cols-3 gap-2 text-center">
                        {([['estMin', it.min], ['estMedian', it.median], ['estMax', it.max]] as const).map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-caption text-muted-foreground">{S[k]}</dt><dd className="text-body-sm font-semibold [overflow-wrap:anywhere]">{fmtNumber(v)}</dd></div>)}
                      </dl>
                    </div>
                  ))}
                  <p className="text-caption text-muted-foreground">{S.estNote}</p>
                  {u.country.tuitionEstimate.sourceUrl && <a href={u.country.tuitionEstimate.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-caption text-primary underline dark:text-secondary">{u.country.tuitionEstimate.sourceName ?? t.source.label}</a>}
                </div>
              </Block>
            )}

            <Block title={S.livingCost}>
              <p className="text-h3">{living ?? <span className="text-body italic text-muted-foreground">{S.livingNone}</span>}{living && <span className="ml-1 text-body-sm font-normal text-muted-foreground">{S.perMonth}</span>}</p>
              {u.country.source?.sourceUrl && <a href={u.country.source.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-caption text-primary underline dark:text-secondary">{u.country.source.sourceName ?? t.source.label}</a>}
            </Block>

            {u.access.unlocked
              ? <><Alert variant="success" title={S.opened}><span className="flex items-center gap-2"><CheckCircle2 className="size-4" aria-hidden />{S.paid}</span></Alert><PaidContent paid={u.paid} /></>
              : <LockedPanel uni={u} access={u.access} me={me} />}
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
