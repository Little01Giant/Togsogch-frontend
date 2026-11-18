'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Check, ChevronDown, ChevronRight, FileCheck, GraduationCap, Globe, Landmark, Languages, Lock, Wallet, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { useMe } from '@/lib/auth';
import { mnt, PayModal, useProducts } from '@/features/paywall';
import { Flag, GlossText, glossTerms, NoData, SourceBadge, StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/data-display';
import { Breadcrumb } from '@/components/ui/misc';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/overlays';

const C = t.countries;

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

/** Нийтлэг шалгалтууд: эхний 2-ыг харуулж, үлдсийг «Бүгдийг харах»-аар доошоо дэлгэнэ. */
function ExamsCard({ exams, footer }: { exams: string[]; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const shown = open ? exams : exams.slice(0, 2);
  return (
    <Card className="p-4 md:p-5">
      <h2 className="mb-2 text-body-sm font-semibold md:mb-3 md:text-h4">{C.exams}</h2>
      {exams.length ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">{shown.map((e) => <li key={e} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"><Badge variant="outline" className="shrink-0 bg-card text-body-sm">{e}</Badge>{t.glossary[e] && <span className="min-w-0 text-body-sm text-muted-foreground">{t.glossary[e]}</span>}</li>)}</ul>
      ) : !footer && <NoData />}
      {exams.length > 2 && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mx-auto mt-3 flex items-center gap-1 rounded-sm text-body-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-secondary">
          {open ? t.source.showLess : `${t.source.showAll} (+${exams.length - 2})`}<ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      )}
      {footer}
    </Card>
  );
}

/** Нээгдээгүй мэдээллийн доор: эхний 2 мөр л ирсэн гэдгийг заасан «Нээх» товч. */
const LockFooter = ({ onUnlock, bare }: { onUnlock: () => void; bare?: boolean }) => (
  <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', !bare && 'mt-3 border-t pt-3')}>
    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onUnlock}><Lock />{C.unlock}</Button>
  </div>
);

/** Улсыг бүтнээр нь нээх: тайлбартай modal → «Үргэлжлүүлэх» дарахад QPay төлбөрийн цонх. */
function UnlockFlow({ open, onOpenChange, country }: { open: boolean; onOpenChange: (o: boolean) => void; country: { id: string; nameMn: string } }) {
  const { data: me } = useMe();
  const price = useProducts().data?.find((p) => p.key === 'country_access')?.priceMnt;
  const [paying, setPaying] = useState(false);
  const items = [C.tuition, C.admission, C.exams, C.pros, C.cons];
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{C.unlockTitle}</DialogTitle><DialogDescription>{C.unlockText.replace('{country}', country.nameMn)}</DialogDescription></DialogHeader>
          <ul className="grid gap-2 text-body-sm">{items.map((x) => <li key={x} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-success" aria-hidden />{x}</li>)}</ul>
          <p className="rounded-md bg-muted/50 p-3 text-body-sm">{C.unlockNote}</p>
          {price != null && <p className="text-h3">{mnt(price)}</p>}
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

/** Мобайлд: дүрсгүй, жижиг гарчиг, зөвхөн эхний өгүүлбэр + «Дэлгэрэнгүй» (хажуугийн drawer-т бүгд). Том дэлгэцэд бүгдийг харуулна.
 *  `locked` үед серверээс эхний 2 мөр л ирдэг тул бүгдийг харуулаад «Нээх» товч тавина. */
const Section = ({ Icon, title, text, locked, onUnlock }: { Icon: LucideIcon; title: string; text: string; locked?: boolean; onUnlock: () => void }) => {
  const items = splitSentences(text);
  const multi = items.length > 1 && !locked;
  return (
    <Card className="p-4 md:p-5">
      <h2 className="mb-2 flex items-center gap-2 text-body-sm font-semibold md:mb-3 md:text-h4"><Icon className="hidden size-5 text-primary md:block dark:text-secondary" aria-hidden />{title}</h2>
      {locked && <>{items.length > 0 && <Bullets items={items} />}<LockFooter onUnlock={onUnlock} bare={items.length === 0} /></>}
      {!locked && (multi ? (
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

export default function CountryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: me } = useMe();
  const { data: c, isLoading, error, refetch } = useQuery<any>({ queryKey: ['country', slug, me?.id ?? null], queryFn: () => api(`/countries/${slug}`) });
  const [unlockOpen, setUnlockOpen] = useState(false);
  const truncated: string[] = c?.access?.truncated ?? [];
  const isLocked = (field: string) => truncated.includes(field);
  const living = c?.livingCostMonthlyUsd;
  const livingText = living?.min != null || living?.max != null ? `${living.min ?? '?'} – ${living.max ?? '?'} USD / ${C.perMonth}` : null;
  const sections: { key: string; Icon: LucideIcon; title: string; value?: string | null; locked?: boolean }[] = c ? [
    { key: 'overview', Icon: Globe, title: C.overview, value: c.overview },
    { key: 'education', Icon: Landmark, title: C.education, value: c.educationSystem, locked: isLocked('educationSystem') },
    { key: 'tuition', Icon: Wallet, title: C.tuition, value: c.tuitionRange, locked: isLocked('tuitionRange') },
    { key: 'admission', Icon: FileCheck, title: C.admission, value: c.admissionGeneral, locked: isLocked('admissionGeneral') },
    { key: 'languagePrep', Icon: Languages, title: C.languagePrep, value: c.languagePrepInfo, locked: isLocked('languagePrepInfo') },
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
                <Stat Icon={Wallet} label={C.living}>{livingText}</Stat>
              </div>
            </Card>
            <div className="grid grid-cols-1 gap-4">{filled.map((s) => <Section key={s.key} Icon={s.Icon} title={s.title} text={s.value ?? ''} locked={s.locked} onUnlock={() => setUnlockOpen(true)} />)}</div>
            <ExamsCard exams={c.commonExams ?? []} footer={isLocked('commonExams') ? <LockFooter onUnlock={() => setUnlockOpen(true)} /> : undefined} />
            <VisaLinks links={c.visaLinks ?? []} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="p-5"><h2 className="mb-2 text-h4">{C.pros}</h2>{c.pros?.length ? <ul className="list-disc space-y-1 pl-5">{c.pros.map((p: string, i: number) => <li key={p}><GlossText text={p} skip={new Set(c.pros.slice(0, i).flatMap(glossTerms))} /></li>)}</ul> : !isLocked('pros') && <NoData />}{isLocked('pros') && <LockFooter onUnlock={() => setUnlockOpen(true)} />}</Card>
              <Card className="p-5"><h2 className="mb-2 text-h4">{C.cons}</h2>{c.cons?.length ? <ul className="list-disc space-y-1 pl-5">{c.cons.map((p: string, i: number) => <li key={p}><GlossText text={p} skip={new Set(c.cons.slice(0, i).flatMap(glossTerms))} /></li>)}</ul> : !isLocked('cons') && <NoData />}{isLocked('cons') && <LockFooter onUnlock={() => setUnlockOpen(true)} />}</Card>
            </div>
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-h4">{C.universities}</h2><Button asChild variant="outline" size="sm"><Link href={`/universities?country=${c.slug}`}>{t.home.allUniversities}</Link></Button></div>
              {c.universities?.length ? <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">{c.universities.map((u: any) => <li key={u.slug}><Link href={`/universities/${u.slug}`} className="text-primary underline-offset-2 hover:underline dark:text-secondary">{u.name}{u.city ? `, ${u.city}` : ''}</Link></li>)}</ul> : <NoData />}
            </Card>
            {!c.access?.unlocked && <UnlockFlow open={unlockOpen} onOpenChange={setUnlockOpen} country={{ id: c._id, nameMn: c.nameMn }} />}
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
