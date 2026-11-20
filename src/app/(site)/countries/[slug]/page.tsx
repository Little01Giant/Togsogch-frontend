'use client';
import { use, useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, FileCheck, GraduationCap, Globe, Landmark, Languages, Lock, ThumbsDown, ThumbsUp, Wallet, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { useMe } from '@/lib/auth';
import { mnt, PayModal } from '@/features/paywall';
import { Flag, GlossText, glossTerms, NoData, SourceBadge, StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { SwipeRow } from '@/components/ui/swipe-row';
import { UniversityCard, type UniCard } from '@/components/education/university-card';
import { Badge, Card } from '@/components/ui/data-display';
import { Breadcrumb } from '@/components/ui/misc';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/overlays';

const C = t.countries;
const SLIDE = 'w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2.4)] lg:w-[calc((100%-2rem)/3.4)]';

/** Түгжээтэй талбар → картад жагсаах гарчиг. */
const LOCKED_TITLE: Record<string, string> = {
  educationSystem: C.education, tuitionRange: C.tuition, admissionGeneral: C.admission, languagePrepInfo: C.languagePrep,
  commonExams: C.exams, pros: C.pros, cons: C.cons,
};

const Stat = ({ Icon, label, children }: { Icon: LucideIcon; label: string; children?: React.ReactNode }) => (
  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
    <Icon className="mt-0.5 size-5 shrink-0 text-primary dark:text-secondary" aria-hidden />
    <div className="min-w-0"><p className="text-caption text-muted-foreground">{label}</p><p className="text-body-sm font-medium">{children || <NoData />}</p></div>
  </div>
);

/** Урт текстийг өгүүлбэр болгон салгаж, жагсаалтаар уншихад хялбар болгоно (нэг өгүүлбэр бол энгийн догол мөр). */
const splitSentences = (text: string) => text.split(/\n{2,}/).flatMap((p) => p.split(/(?<=\.)\s+(?=[А-ЯӨҮA-Z«(])/)).map((s) => s.trim()).filter(Boolean);

const Bullets = ({ items }: { items: string[] }) => {
  const skips = items.map((_, i) => new Set(items.slice(0, i).flatMap(glossTerms)));
  return (
    <ul className="space-y-2.5 text-body-sm leading-relaxed md:text-body">
      {items.map((s, i) => <li key={i} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/50 dark:bg-secondary/60" aria-hidden /><span className="min-w-0"><GlossText text={s} skip={skips[i]} /></span></li>)}
    </ul>
  );
};

/** Визийн албан ёсны холбоосууд: гарчиг дээр дарж доошоо дэлгэнэ / хураана. */
function VisaLinks({ links }: { links: { title: string; url: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-4 md:p-5">
      <h2 className="text-body-sm font-semibold md:text-h4">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span>{C.visa}{links.length > 0 && <span className="ml-2 font-normal text-muted-foreground">({links.length})</span>}</span>
          <ChevronDown className={cn('size-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </h2>
      {open && (links.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-body-sm md:text-body">{links.map((v) => <li key={v.url}><a href={v.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 dark:text-secondary">{v.title}</a></li>)}</ul> : <p className="mt-3"><NoData /></p>)}
    </Card>
  );
}

/** Төлбөртэй (нээгдсэн) мэдээллийн карт: шар хүрээтэй, гарчиг дээр дарж нээж / хаана. */
function PaidCard({ Icon, title, children, defaultOpen = false }: { Icon: LucideIcon; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-accent p-0 shadow-[0_2px_0_0_var(--accent)]" data-testid="country-paid-card">
      <h2 className="text-body-sm font-semibold md:text-h4">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5">
          <Icon className="size-5 shrink-0 text-accent" aria-hidden />
          <span className="min-w-0 flex-1">{title}</span>
          <ChevronDown className={cn('size-5 shrink-0 text-accent transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </h2>
      {open && <div className="border-t px-4 pb-4 pt-3 md:px-5 md:pb-5">{children}</div>}
    </Card>
  );
}

/** Нийтлэг шалгалтууд (нээгдсэн). */
function ExamsCard({ exams }: { exams: string[] }) {
  return (
    <PaidCard Icon={FileCheck} title={C.exams}>
      {exams.length ? <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">{exams.map((e) => <li key={e} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"><Badge variant="outline" className="shrink-0 bg-card text-body-sm">{e}</Badge>{t.glossary[e] && <span className="min-w-0 text-body-sm text-muted-foreground">{t.glossary[e]}</span>}</li>)}</ul> : <NoData />}
    </PaidCard>
  );
}

/** Нээгдсэн текст хэсэг: өгүүлбэр болгон жагсаана. */
const PaidSection = ({ Icon, title, text, defaultOpen }: { Icon: LucideIcon; title: string; text: string; defaultOpen?: boolean }) => {
  const items = splitSentences(text);
  return <PaidCard Icon={Icon} title={title} defaultOpen={defaultOpen}>{items.length > 1 ? <Bullets items={items} /> : <p className="text-body-sm leading-relaxed md:text-body"><GlossText text={text} /></p>}</PaidCard>;
};

/** Давуу / сул тал (нээгдсэн). */
const PaidList = ({ Icon, title, items }: { Icon: LucideIcon; title: string; items: string[] }) => (
  <PaidCard Icon={Icon} title={title}>
    {items.length ? <ul className="list-disc space-y-1 pl-5">{items.map((p, i) => <li key={p}><GlossText text={p} skip={new Set(items.slice(0, i).flatMap(glossTerms))} /></li>)}</ul> : <NoData />}
  </PaidCard>
);

/** Төлөөгүй үед: серверээс төлбөртэй мэдээлэл огт ирэхгүй тул нэг л карт — юу нээгдэхийг жагсааж, «Нээх» товч тавина. */
const LockedCard = ({ titles, onUnlock }: { titles: string[]; onUnlock: () => void }) => (
  <Card className="border-accent/40 p-2.5 sm:p-6" data-testid="country-locked-panel">
    <h2 className="flex items-center gap-2 text-h3"><Lock className="size-5" aria-hidden />{C.lockedTitle}</h2>
    <p className="mt-1 hidden text-body-sm text-muted-foreground sm:block">{C.lockedText}</p>
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">{titles.map((x) => <li key={x} className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2.5 text-body-sm"><Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />{x}</li>)}</ul>
    <Button className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={onUnlock}><Lock />{C.unlock}</Button>
  </Card>
);

/** Улсыг бүтнээр нь нээх: тайлбартай modal → «Үргэлжлүүлэх» дарахад QPay төлбөрийн цонх. */
function UnlockFlow({ open, onOpenChange, country }: { open: boolean; onOpenChange: (o: boolean) => void; country: { id: string; nameMn: string; price?: { schools: number; unitMnt: number; priceMnt: number } } }) {
  const { data: me } = useMe();
  const price = country.price?.priceMnt;
  const [paying, setPaying] = useState(false);
  const items = [C.tuition, C.admission, C.exams, C.pros, C.cons];
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{C.unlockTitle}</DialogTitle><DialogDescription>{C.unlockText.replace('{country}', country.nameMn)}</DialogDescription></DialogHeader>
          <ul className="grid gap-2 text-body-sm">{items.map((x) => <li key={x} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-success" aria-hidden />{x}</li>)}</ul>
          <p className="rounded-md bg-muted/50 p-3 text-body-sm">{C.unlockNote}</p>
          {price != null && <div><p className="text-h3">{mnt(price)}</p>{country.price && <p className="text-caption text-muted-foreground">{country.price.schools} {C.priceSchools} × {mnt(country.price.unitMnt)}</p>}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
            {me
              ? <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { onOpenChange(false); setPaying(true); }}>{C.unlockContinue}</Button>
              : <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link href="/login">{C.unlockLogin}</Link></Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PayModal productKey="country_access" targetId={country.id} opened={paying} onClose={() => setPaying(false)} />
    </>
  );
}

/** Мобайлд: дүрсгүй, жижиг гарчиг, зөвхөн эхний өгүүлбэр + «Дэлгэрэнгүй» (хажуугийн drawer-т бүгд). Том дэлгэцэд бүгдийг харуулна. */
const Section = ({ Icon, title, text }: { Icon: LucideIcon; title: string; text: string }) => {
  const items = splitSentences(text);
  const multi = items.length > 1;
  return (
    <Card className="p-4 md:p-5">
      <h2 className="mb-2 flex items-center gap-2 text-body-sm font-semibold md:mb-3 md:text-h4"><Icon className="hidden size-5 text-primary md:block dark:text-secondary" aria-hidden />{title}</h2>
      {(multi ? (
        <>
          <div className="hidden md:block"><Bullets items={items} /></div>
          <div className="md:hidden">
            <p className="text-body-sm leading-relaxed"><GlossText text={items[0]} /></p>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm" className="mt-3">{C.more}<ChevronRight aria-hidden /></Button></SheetTrigger>
              <SheetContent side="right" className="flex flex-col">
                <SheetHeader className="pr-8"><SheetTitle>{title}</SheetTitle><SheetDescription className="sr-only">{title}</SheetDescription></SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto"><Bullets items={items} /></div>
              </SheetContent>
            </Sheet>
          </div>
        </>
      ) : <p className="text-body-sm leading-relaxed md:text-body"><GlossText text={text} /></p>)}
    </Card>
  );
};

interface CountryDetailData {
  _id: string; slug: string; code: string; nameMn: string; nameEn: string; source?: ComponentProps<typeof SourceBadge>['source'];
  bachelorDuration?: string | null; masterDuration?: string | null; livingCostMonthlyUsd?: { min?: number | null; max?: number | null } | null;
  overview?: string | null; educationSystem?: string | null; tuitionRange?: string | null; admissionGeneral?: string | null; languagePrepInfo?: string | null;
  commonExams?: string[]; visaLinks?: { title: string; url: string }[]; pros?: string[]; cons?: string[];
  universities?: UniCard[]; universityCount?: number;
  access?: { unlocked?: boolean; lockedFields?: string[]; price?: { schools: number; unitMnt: number; priceMnt: number } };
}

export default function CountryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: me } = useMe();
  const { data: c, isLoading, error, refetch } = useQuery<CountryDetailData>({ queryKey: ['country', slug, me?.id ?? null], queryFn: () => api(`/countries/${slug}`) });
  const [unlockOpen, setUnlockOpen] = useState(false);
  const lockedFields = c?.access?.lockedFields ?? [];
  const lockedTitles = Object.entries(LOCKED_TITLE).filter(([f]) => lockedFields.includes(f)).map(([, title]) => title);
  const isUnlocked = !!c?.access?.unlocked;
  const living = c?.livingCostMonthlyUsd;
  const livingText = living?.min != null || living?.max != null ? `${living.min ?? '?'} – ${living.max ?? '?'} USD / ${C.perMonth}` : null;
  const sections: { key: string; Icon: LucideIcon; title: string; value?: string | null }[] = c ? [
    { key: 'education', Icon: Landmark, title: C.education, value: c.educationSystem },
    { key: 'tuition', Icon: Wallet, title: C.tuition, value: c.tuitionRange },
    { key: 'admission', Icon: FileCheck, title: C.admission, value: c.admissionGeneral },
    { key: 'languagePrep', Icon: Languages, title: C.languagePrep, value: c.languagePrepInfo },
  ] : [];
  const filled = sections.filter((s) => s.value);
  return (
    <PageContainer className="py-4 md:py-6">
      <Breadcrumb className="mb-4" items={[{ label: t.nav.home, href: '/' }, { label: C.title, href: '/countries' }, { label: c?.nameMn ?? '…' }]} />
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        {c && (
          <div className="grid grid-cols-1 gap-5">
            <Card className="p-5 md:p-6">
              <div className="flex items-center gap-4"><Flag code={c.code} size={56} /><div className="min-w-0"><h1 className="text-h1">{c.nameMn}</h1><p className="text-muted-foreground">{c.nameEn}</p></div></div>
              <div className="mt-4 min-w-0"><SourceBadge source={c.source} hideStatus /></div>
              <h2 className="mb-2 mt-5 text-caption font-medium uppercase tracking-wide text-muted-foreground">{C.quickFacts}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Stat Icon={GraduationCap} label={C.bachelor}>{c.bachelorDuration}</Stat>
                <Stat Icon={BookOpen} label={C.master}>{c.masterDuration}</Stat>
                <Stat Icon={Wallet} label={C.living}>{livingText ? <>{livingText}<span className="block text-caption font-normal text-muted-foreground">{C.livingIncludes}</span></> : null}</Stat>
              </div>
            </Card>
            {c.overview && <Section Icon={Globe} title={C.overview} text={c.overview} />}
            <VisaLinks links={c.visaLinks ?? []} />
            {isUnlocked ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {filled.map((s, i) => <PaidSection key={s.key} Icon={s.Icon} title={s.title} text={s.value ?? ''} defaultOpen={i === 0} />)}
                  <ExamsCard exams={c.commonExams ?? []} />
                  <PaidList Icon={ThumbsUp} title={C.pros} items={c.pros ?? []} />
                  <PaidList Icon={ThumbsDown} title={C.cons} items={c.cons ?? []} />
                </div>
              </>
            ) : lockedTitles.length > 0 && <LockedCard titles={lockedTitles} onUnlock={() => setUnlockOpen(true)} />}
            <section aria-label={C.universities}>
              <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-h4">{C.universities}</h2><Button asChild variant="outline" size="sm"><Link href={`/universities?country=${c.slug}`}>{t.home.allUniversities}{c.universityCount ? ` (${c.universityCount})` : ''}</Link></Button></div>
              {c.universities?.length ? (
                <SwipeRow label={C.universities}>
                  {c.universities.map((u) => <div key={u.id} role="listitem" className={SLIDE}><UniversityCard u={u} /></div>)}
                  <div role="listitem" className={SLIDE}>
                    <Card interactive className="relative grid h-full min-h-48 place-items-center p-4 text-center">
                      <div className="grid justify-items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-full bg-accent/15 text-accent"><ArrowRight className="size-6" aria-hidden /></span>
                        <Link href={`/universities?country=${c.slug}`} className="rounded-sm text-h4 after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.home.allUniversities}</Link>
                        {c.universityCount ? <p className="text-body-sm text-muted-foreground">{c.universityCount} {C.publishedUniversities}</p> : null}
                      </div>
                    </Card>
                  </div>
                </SwipeRow>
              ) : <Card className="p-5"><NoData /></Card>}
            </section>
            {!c.access?.unlocked && <UnlockFlow open={unlockOpen} onOpenChange={setUnlockOpen} country={{ id: c._id, nameMn: c.nameMn, price: c.access?.price }} />}
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
