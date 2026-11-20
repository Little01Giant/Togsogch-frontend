'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Info, Lock } from 'lucide-react';
import { fmtNumber, t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Flag } from '@/components/common';
import { Badge, Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { TuitionDisplay } from '@/components/education/tuition-display';
import { mnt, UnlockButton, useProducts } from '@/features/paywall';
import type { UniAccess, UniCategory, UniCountry, UniEnglishTest, UniPaid, UniRule, UniRanking, UniTuitionEstimate } from '@/types/university';

const U = t.universities;
const S = t.s.uni;

const LINK_CLS = 'text-primary underline dark:text-secondary';

/** Гадны холбоос: нэг газар `target/rel` ба өнгө. */
function ExtLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`${LINK_CLS} ${className ?? ''}`}>{children}</a>;
}

export const Block = ({ title, children, className, hideTitle }: { title: string; children: React.ReactNode; className?: string; hideTitle?: boolean }) => <Card className={`p-2.5 sm:p-6 ${className ?? ''}`}><h2 className={hideTitle ? 'sr-only' : 'mb-3 px-1 text-h4 sm:px-0'}>{title}</h2>{children}</Card>;
const Missing = () => <p className="italic text-muted-foreground">{S.notAvailable}</p>;
const Item = ({ children }: { children: React.ReactNode }) => <div className="min-w-0 rounded-md bg-muted/40 p-3 text-body-sm [overflow-wrap:anywhere] sm:border">{children}</div>;

/** Эх сурвалж: «Эх сурвалж» товчоор нээж хаана (урт жагсаалт зайг эзлэхгүй). */
export function CollapsibleSource({ name, url }: { name?: string | null; url: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 rounded-sm text-caption font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-secondary">
        {t.source.label}<ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <p className="mt-1 text-caption [overflow-wrap:anywhere]"><ExtLink href={url}>{name ?? t.source.label}</ExtLink></p>}
    </div>
  );
}

/** URL-ийн домэйн (харуулахад); буруу URL бол хоосон. */
function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

/** Тэмдэглэлээс эх сурвалжийн URL-ийг салгаж, үлдсэн текстийг цэвэрлэнэ (URL-ийг тусдаа холбоос болгож харуулна). */
function splitNote(note?: string | null): { text: string; url: string | null } {
  if (!note) return { text: '', url: null };
  const m = note.match(/https?:\/\/[^\s)]+/);
  if (!m) return { text: note.trim(), url: null };
  const url = m[0].replace(/[.,;:]+$/, '');
  const text = note.replace(m[0], '').replace(/\s*Эх сурвалж:\s*(?=[.(]|$)/g, ' ').replace(/\(\s*\)/g, '').replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/[:\s]+$/, '').trim();
  return { text, url };
}

/** Шалгалт тус бүр: гарчиг + оноо харагдаж, дарахад тайлбар ба эх сурвалж нээгдэнэ (dropdown). */
function SourceButton({ href, children }: { href: string; children: React.ReactNode }) {
  return <div><Button asChild variant="outline" size="sm" className="h-auto max-w-full whitespace-normal py-2 text-left"><a href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink /></a></Button></div>;
}

/** Гарчиг (+ дэд мөр) харагдаж, дарахад агуулга нээгдэх dropdown. Агуулгагүй бол энгийн мөр. */
function Dropdown({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const head = (
    <span className="min-w-0 flex-1">
      <span className="block text-body font-semibold leading-snug [overflow-wrap:anywhere]">{title}</span>
      {subtitle && <span className="mt-0.5 block text-body-sm text-muted-foreground">{subtitle}</span>}
    </span>
  );
  if (!children) return <Item><div className="flex items-start gap-2">{head}</div></Item>;
  return (
    <div className="min-w-0 rounded-md bg-muted/40 text-body-sm sm:border">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-start gap-2 rounded-md p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {head}
        <ChevronDown className={`mt-1 size-5 shrink-0 text-primary transition-transform dark:text-secondary ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="grid gap-2 border-t px-3 pb-3 pt-2">{children}</div>}
    </div>
  );
}

function ExamItem({ exam }: { exam: UniEnglishTest }) {
  const { text, url } = splitNote(exam.note);
  return (
    <Dropdown title={exam.test} subtitle={exam.minScore ? <>{S.englishMin}: <b className="text-foreground">{exam.minScore}</b></> : undefined}>
      {text || url ? <>{text && <p className="text-muted-foreground [overflow-wrap:anywhere]">{text}</p>}{url && <SourceButton href={url}>{t.source.label}</SourceButton>}</> : undefined}
    </Dropdown>
  );
}

/** Улсын дүрэм: «Гарчиг: агуулга» хэлбэртэй бол «:»-ээс өмнөх хэсэг нь гарчиг болно; үгүй бол эхний өгүүлбэр. */
function RuleItem({ rule }: { rule: UniRule }) {
  const colon = rule.text.indexOf(':');
  const hasPrefix = colon > 0 && colon <= 60;
  const prefix = hasPrefix ? rule.text.slice(0, colon).trim() : undefined;
  const body = hasPrefix ? rule.text.slice(colon + 1).trim() : rule.text;
  /** Гарчиг = агуулгын эхний өгүүлбэр (дүрэм бүр өөр өөр харагдана); «Улсын нийтлэг шаардлага» гэх мэт нийтлэг угтвар нь дэд мөр болно */
  const first = (body.split(/(?<=[.!?;])\s/)[0] ?? body).replace(/[.;]$/, '');
  const title = first.length > 90 ? `${first.slice(0, 87).trimEnd()}…` : first;
  const label = `${rule.sourceName ?? t.source.label}${rule.verifiedAt ? ` · ${rule.verifiedAt}` : ''}`;
  return (
    <Dropdown title={title} subtitle={prefix}>
      <p className="text-muted-foreground [overflow-wrap:anywhere]">{body}</p>
      {rule.sourceUrl && <SourceButton href={rule.sourceUrl}>{label}</SourceButton>}
    </Dropdown>
  );
}

/** Урт танилцуулгыг 4 мөрөөр таслаад «Дэлгэрэнгүй / Хураах» товчоор нээж хаана. Богино текст бол товчгүй. */
export function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 240;
  return (
    <div>
      <p className={!open && long ? 'line-clamp-4' : undefined}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-1 inline-flex items-center gap-1 rounded-sm text-body-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-secondary">
          {open ? S.readLess : S.readMore}<ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      )}
    </div>
  );
}

/** CEFR ↔ IELTS / TOEFL iBT: ielts.org болон ets.org-ийн албан ёсны харьцуулалт (код/оноо тул i18n-д биш) */
const LEVEL_ROWS = [
  { level: 'B1', ielts: '4.0–5.0', toefl: '42–71', toeflNew: '–' },
  { level: 'B2', ielts: '5.5–6.5', toefl: '72–94', toeflNew: '4–4.5' },
  { level: 'C1', ielts: '7.0–8.0', toefl: '95–113', toeflNew: '5–5.5' },
];

/** Хэлний түвшний тайлбар: албан ёсны IELTS болон ETS (TOEFL)-ийн CEFR харьцуулалт. */
function LevelGuide() {
  const G = S.levelGuide;
  return (
    <details className="group rounded-md border bg-muted/20 p-3 text-body-sm">
      <summary className="cursor-pointer select-none font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{G.title}</summary>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3">
        <p className="text-muted-foreground">{G.intro}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead><tr className="border-b text-muted-foreground"><th className="py-1.5 pr-3 font-medium">{G.colLevel}</th><th className="py-1.5 pr-3 font-medium">{G.colIelts}</th><th className="py-1.5 pr-3 font-medium">{G.colToefl}</th><th className="py-1.5 font-medium">{G.colToeflNew}</th></tr></thead>
            <tbody>{LEVEL_ROWS.map((r) => <tr key={r.level} className="border-b last:border-0"><td className="py-1.5 pr-3 font-semibold">{r.level}</td><td className="py-1.5 pr-3">{r.ielts}</td><td className="py-1.5 pr-3">{r.toefl}</td><td className="py-1.5">{r.toeflNew}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="text-muted-foreground">{G.note}</p>
        <p className="text-caption">{G.sources}: <ExtLink href="https://ielts.org/news-and-insights/everything-you-need-to-know-about-ielts-and-the-cefr">IELTS</ExtLink> · <ExtLink href="https://www.ets.org/toefl/institutions/ibt/score-scale-update.html">ETS TOEFL</ExtLink></p>
      </div>
    </details>
  );
}

/** Төлбөртэй хэсэг: ЗӨВХӨН backend-ийн `paid` payload-оос зурагдана (нээгдээгүй бол энэ өгөгдөл хариунд байхгүй). */
export function PaidContent({ paid, website }: { paid: UniPaid; website?: string | null }) {
  /** Мэдээлэлгүй ангиллыг харуулахгүй (хоосон картууд хэрэглэгчид хэрэггүй); бүгд хоосон бол нэг л мэдэгдэл. */
  const sec = (k: UniCategory, body: React.ReactNode, has: boolean) => (has ? <Block key={k} title={S.cat[k]} className="border-accent shadow-[0_2px_0_0_var(--accent)]">{body}</Block> : null);
  const hasEnglish = paid.english.length > 0;
  const hasProcedure = paid.procedure.steps.length > 0 || paid.procedure.links.length > 0;
  const hasAny = paid.tuition.length > 0 || hasEnglish || paid.languageRules.length > 0 || hasProcedure;
  const englishHref = paid.englishUrl ?? website;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4" data-testid="paid-content">
      {!hasAny && <Block title={S.paid}><Missing /></Block>}
      {sec('tuition', <div className="grid grid-cols-[minmax(0,1fr)] gap-3">{paid.tuition.map((x, i) => (
        <div key={i} className="rounded-lg bg-muted/40 p-3 sm:border sm:p-4">
          <div className="mb-2 flex flex-wrap gap-1.5 text-caption"><Badge variant="outline">{U.labelsDegree[x.level] ?? x.level}</Badge>{x.faculty && <Badge>{x.faculty}</Badge>}{x.feeType && <Badge variant="outline">{U.labelsFeeType[x.feeType]}</Badge>}</div>
          <TuitionDisplay tuition={x} clean />
          {x.otherFees && <p className="mt-3 rounded-md bg-background/40 p-2 text-caption leading-snug text-muted-foreground [overflow-wrap:anywhere]"><span className="font-semibold text-foreground">{U.otherFees}:</span> {x.otherFees}</p>}
          {x.sourceUrl && <ExtLink href={x.sourceUrl} className="mt-2 inline-block text-caption">{t.source.label}</ExtLink>}
        </div>))}
        <p className="flex items-start gap-2 rounded-md bg-accent/10 p-2.5 text-caption leading-snug"><Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden /><span>{S.tuitionVaries}</span></p>
      </div>, paid.tuition.length > 0)}
      {sec('english', (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {hasEnglish && <div className="grid items-start gap-2 sm:grid-cols-2">{paid.english.map((x, i) => <ExamItem key={i} exam={x} />)}</div>}
          {hasEnglish && <LevelGuide />}
          {englishHref && <div><Button asChild variant="outline" size="sm" className="h-auto max-w-full whitespace-normal py-2 text-left"><a href={englishHref} target="_blank" rel="noopener noreferrer">{paid.englishUrl ? S.englishPage : S.officialSite}<ExternalLink /></a></Button></div>}
          {paid.languageRules.length > 0 && (
            <div>
              <ul className="grid items-start gap-2">{paid.languageRules.map((r, i) => <li key={i} className="min-w-0"><RuleItem rule={r} /></li>)}</ul>
            </div>
          )}
        </div>
      ), hasEnglish || paid.languageRules.length > 0)}
      {sec('procedure', (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {paid.procedure.steps.length > 0 && (
            <ol className="grid gap-2">{paid.procedure.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-md bg-muted/40 p-3 text-body-sm sm:border">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-caption font-bold text-accent">{i + 1}</span>
                <span className="min-w-0 pt-0.5 [overflow-wrap:anywhere]">{s}</span>
              </li>))}
            </ol>
          )}
          {paid.procedure.links.length > 0 && (
            <ul className="grid gap-2">{paid.procedure.links.map((l) => (
              <li key={l.url} className="min-w-0">
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:border">
                  <span className="min-w-0">
                    <span className="block text-body font-semibold leading-snug [overflow-wrap:anywhere]">{l.title || S.applyLink}</span>
                    <span className="mt-0.5 block text-caption text-muted-foreground [overflow-wrap:anywhere]">{hostOf(l.url)}</span>
                  </span>
                  <ExternalLink className="size-5 shrink-0 text-accent" aria-hidden />
                </a>
              </li>))}
            </ul>
          )}
        </div>
      ), hasProcedure)}
    </div>
  );
}

/** Нээх сонголт: сургуулийг ганцаарчлан, эсвэл тухайн улсын бүх сургуулийг. Үнэ, эрхийг backend шийднэ. */
function BuyOption({ productKey, targetId, title, hint, flagCode, priceMnt }: { productKey: string; targetId: string; title: string; hint: string; flagCode?: string | null; priceMnt?: number }) {
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
      <UnlockButton productKey={productKey} targetId={targetId} priceMnt={priceMnt} />
    </Card>
  );
}

export function LockedPanel({ uni, access, loggedIn }: { uni: { id: string; name: string; country: UniCountry }; access: UniAccess; loggedIn: boolean }) {
  return (
    <Card id="unlock" className="scroll-mt-20 border-accent/40 p-2.5 sm:p-6" data-testid="locked-panel">
      <h2 className="flex items-center gap-2 text-h3"><Lock className="size-5 text-accent" aria-hidden />{S.lockedTitle}</h2>
      <p className="mt-1 hidden text-body-sm text-muted-foreground sm:block">{S.lockedText}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {access.categories.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2.5 text-body-sm" data-testid={`cat-${c.key}`}>
            <span className="flex items-center gap-2"><Lock className="size-3.5 text-accent" aria-hidden />{S.cat[c.key]}</span>
            {c.available && <Badge variant="secondary">{S.available}</Badge>}
          </li>
        ))}
      </ul>
      {loggedIn ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2" data-testid="buy-options">
          <BuyOption productKey="university_access" targetId={uni.id} title={uni.name} hint={S.uniHint} />
          <BuyOption productKey="country_access" targetId={uni.country.id} title={`${uni.country.nameMn} ${S.unlockCountrySuffix}`} flagCode={uni.country.code} priceMnt={uni.country.unlockPrice?.priceMnt} hint={uni.country.unlockPrice ? `${fmtNumber(uni.country.unlockPrice.schools)} ${S.countryHintUnits} × ${mnt(uni.country.unlockPrice.unitMnt)}` : uni.country.universityCount != null ? `${S.countryHintTotal} ${fmtNumber(uni.country.universityCount)} ${S.countryHintUnits}` : ''} />
        </div>
      ) : <div className="mt-5"><Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link href="/login">{S.loginToUnlock}</Link></Button></div>}
    </Card>
  );
}

/** Рейтингийн байгууллага бүрийн хамгийн сүүлийн ерөнхий (чиглэлийн биш) эрэмбэ */
export function latestRankings(rankings: UniRanking[] | undefined): UniRanking[] {
  const latest: Record<string, UniRanking> = {};
  for (const r of rankings ?? []) {
    if (r.subject) continue;
    const prev = latest[r.provider];
    if (!prev || r.year > prev.year) latest[r.provider] = r;
  }
  return Object.values(latest);
}

export function RankingsBlock({ ranks }: { ranks: UniRanking[] }) {
  return (
    <Block title={U.rankings} className="min-w-0" hideTitle>
      {ranks.length
        ? (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3" data-testid="uni-rankings">
            {ranks.map((r) => {
              /** Тодорхой байр (#1) том тоогоор; хүрээ («761–770») тусдаа жижиг хэлбэрээр, нэг мөрөнд таслагдахгүй. Хүрээг доод мөрөнд давтахгүй. */
              const isRange = !r.rank && !!r.rankText;
              const pill = r.rank ? `#${r.rank}` : String(r.rankText ?? '').replace(/\s*[-–]\s*/, '–');
              const place = r.rank ? U.rankingPlace.replace('{n}', String(r.rank)) : null;
              return (
                <div key={`${r.provider}-${r.year}`} className="flex items-stretch gap-3 rounded-md bg-muted/40 p-2.5 sm:gap-4 sm:border sm:p-3">
                  <div className={cn('flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-primary/10 px-2 py-2 text-primary dark:text-secondary', isRange ? 'min-w-24 sm:min-w-28' : 'w-16 sm:w-20')}>
                    <span className={cn('whitespace-nowrap font-extrabold leading-none', isRange ? 'text-h3 sm:text-h3' : 'text-h2 sm:text-h3')}>{pill}</span>
                    {isRange && <span className="text-caption font-medium leading-none opacity-80">{U.rankingRangeCaption}</span>}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="text-body font-bold leading-tight [overflow-wrap:anywhere]">{U.labelsRanking[r.provider] ?? r.provider}</p>
                    {U.labelsRankingLong[r.provider] && <p className="mt-0.5 text-caption leading-snug text-muted-foreground [overflow-wrap:anywhere]">{U.labelsRankingLong[r.provider]}</p>}
                    <p className="mt-1 text-body-sm">{[place, U.rankingEdition.replace('{y}', String(r.year))].filter(Boolean).join(' · ')}</p>
                    {r.sourceUrl && <ExtLink href={r.sourceUrl} className="mt-1 inline-block text-caption">{U.rankingSource} ↗</ExtLink>}
                  </div>
                </div>
              );
            })}
          </div>
        )
        : <p className="italic text-muted-foreground">{U.rankingNone}</p>}
    </Block>
  );
}

/** Улсын төлбөрийн ойролцоо хүрээ: хураангуй (дундаж) нь үргэлж харагдана, дэлгэрэнгүй нь товшиход нээгдэнэ. */
export function TuitionEstimateBlock({ estimate }: { estimate: UniTuitionEstimate }) {
  const [open, setOpen] = useState(false);
  const first = estimate.items[0];
  return (
    <Card className="min-w-0 p-2.5 sm:p-6">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="tuition-estimate" className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-0">
        <span className="min-w-0">
          <span className="block text-body font-semibold leading-snug">{S.estTitle}</span>
          {first && <span className="mt-1 block text-h3 font-bold leading-tight [overflow-wrap:anywhere]">≈ {fmtNumber(first.median)} {first.currency} <span className="text-body-sm font-normal text-muted-foreground">{S.estPerYear}</span></span>}
          <span className="mt-1 block text-caption leading-snug text-muted-foreground">{S.estHint}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-body-sm font-semibold text-primary dark:text-secondary">
          <span className="hidden sm:inline">{open ? S.readLess : S.readMore}</span>
          <ChevronDown className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </span>
      </button>
      <div id="tuition-estimate" hidden={!open} className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3" data-testid="tuition-estimate">
        {estimate.items.map((it) => (
          <div key={it.currency} className="rounded-md bg-muted/40 p-3 sm:border sm:p-4">
            <p className="mb-2 text-caption text-muted-foreground">{it.n != null ? `${fmtNumber(it.n)} ${S.estSchools}` : S.estOfficial}</p>
            <p className="text-caption text-muted-foreground">{S.estTypical}</p>
            <p className="mb-3 text-h3 font-bold [overflow-wrap:anywhere]">≈ {fmtNumber(it.median)} {it.currency} <span className="text-body-sm font-normal text-muted-foreground">{S.estPerYear}</span></p>
            <div className="relative h-2 rounded-full bg-muted" role="img" aria-label={S.estRange}>
              <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-primary/30" />
              <div className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary" style={{ left: `${it.max > it.min ? Math.min(100, Math.max(0, ((it.median - it.min) / (it.max - it.min)) * 100)) : 50}%` }} />
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              {([['estMin', it.min, 'text-left'], ['estMedian', it.median, 'text-center'], ['estMax', it.max, 'text-right']] as const).map(([k, v, al]) => <div key={k} className={`min-w-0 ${al}`}><dt className="text-caption text-muted-foreground">{S[k]}</dt><dd className="text-body-sm font-semibold [overflow-wrap:anywhere]">{fmtNumber(v)}</dd></div>)}
            </dl>
          </div>
        ))}
        <p className="text-caption text-muted-foreground">{S.estNote}</p>
        {estimate.sourceUrl && <ExtLink href={estimate.sourceUrl} className="inline-block text-caption">{estimate.sourceName ?? t.source.label}</ExtLink>}
      </div>
    </Card>
  );
}
