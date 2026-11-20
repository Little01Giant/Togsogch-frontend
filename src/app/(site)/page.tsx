'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Atom, BookOpen, Brain, Briefcase, ChevronDown, Compass, Globe2, GraduationCap, Languages, Lightbulb, ListChecks, Microscope, Palette, Pencil, Rocket, Sparkles, Star, Target, Trophy, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { byMongolianPriority, isMainCountry } from '@/lib/country-order';
import { t } from '@/i18n';
import { CardSkeleton, Flag, StateBoundary } from '@/components/common';
import { LogoMark } from '@/components/brand/logo-mark';
import { PageContainer, Section } from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/data-display';
import { SwipeRow } from '@/components/ui/swipe-row';
import { UniCard, UniversityCard } from '@/components/education/university-card';

const H = t.s.home;
/** Жижиг дэлгэц дээр хажуу тийш гүйлгэдэг мөр (scroll-snap), lg-ээс дээш 3 баганатай тор */
/** Hero-ийн чимэглэл: Lucide дүрсүүд (байрлал, эргэлт, хөвөх саатал) */
const HERO_DECOR = [
  { Icon: GraduationCap, cls: 'left-[4%] top-[12%] size-9 -rotate-12', delay: '0s' },
  { Icon: BookOpen, cls: 'left-[44%] top-[10%] size-8 rotate-6', delay: '-0.8s' },
  { Icon: Compass, cls: 'left-[62%] bottom-[14%] size-10 rotate-12', delay: '-1.6s' },
  { Icon: Lightbulb, cls: 'left-[30%] bottom-[8%] size-7 -rotate-6', delay: '-2.2s' },
  { Icon: Rocket, cls: 'right-[34%] top-[16%] size-9 rotate-12', delay: '-1.2s' },
  { Icon: Globe2, cls: 'right-[4%] bottom-[10%] size-9 -rotate-6', delay: '-0.4s' },
  { Icon: Star, cls: 'left-[52%] top-[48%] size-5 rotate-12', delay: '-2.6s' },
  { Icon: Star, cls: 'left-[8%] bottom-[16%] size-5 -rotate-12', delay: '-1.9s' },
  { Icon: Trophy, cls: 'left-[20%] top-[6%] size-8 rotate-6', delay: '-0.6s' },
  { Icon: Pencil, cls: 'left-[38%] bottom-[22%] size-7 rotate-45', delay: '-1.4s' },
  { Icon: Target, cls: 'left-[55%] top-[8%] size-8 -rotate-6', delay: '-2.1s' },
  { Icon: Atom, cls: 'right-[22%] bottom-[6%] size-9 rotate-12', delay: '-0.9s' },
  { Icon: Briefcase, cls: 'right-[18%] top-[8%] size-8 -rotate-12', delay: '-1.7s' },
  { Icon: Microscope, cls: 'left-[2%] top-[52%] size-8 rotate-6', delay: '-2.4s' },
  { Icon: Palette, cls: 'left-[70%] top-[44%] size-7 -rotate-12', delay: '-0.3s' },
  { Icon: Sparkles, cls: 'left-[25%] top-[42%] size-6 rotate-12', delay: '-1.1s' },
  { Icon: Sparkles, cls: 'right-[6%] top-[40%] size-6 -rotate-6', delay: '-2s' },
  { Icon: Star, cls: 'left-[46%] bottom-[6%] size-4 rotate-6', delay: '-0.7s' },
  { Icon: Star, cls: 'right-[40%] top-[6%] size-4 -rotate-12', delay: '-1.3s' },
] as const;
const RAIL ='-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0';
const RAIL_ITEM = 'w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-auto';
const N = t.assessments.names;
/** Хамгийн урд байх хоёр тест (дараалал тогтмол). Бусад тестүүд API-аас ирж, ард нь нэмэгдэнэ. */
const TESTS = [
  { key: 'career', href: '/assessments/career', icon: Compass, tone: 'bg-gold-soft text-gold-soft-foreground', title: N.career.title, desc: N.career.subtitle, available: true },
  { key: 'city', href: '/assessments/city', icon: Globe2, tone: 'bg-success-soft text-success-soft-foreground', title: N.city.title, desc: N.city.subtitle, available: true },
];
const EXTRA_ICONS: Record<string, LucideIcon> = { language: Languages, masters: GraduationCap, persona: Sparkles, thinking: Brain };
const EXTRA_TONE = 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary';

export default function HomePage() {
  const featured = useQuery<UniCard[]>({ queryKey: ['unis-featured'], queryFn: () => api('/universities/featured'), staleTime: 300_000 });
  const assessments = useQuery<{ key: string; title: string; subtitle: string; available: boolean }[]>({ queryKey: ['assessments'], queryFn: () => api('/assessments') });
  const lead = new Set(TESTS.map((x) => x.key));
  const extra = (assessments.data ?? []).filter((a) => !lead.has(a.key)).map((a) => ({ key: a.key, href: `/assessments/${a.key}`, icon: EXTRA_ICONS[a.key] ?? ListChecks, tone: EXTRA_TONE, title: N[a.key]?.title ?? a.title, desc: N[a.key]?.subtitle ?? a.subtitle, available: a.available }));
  const tests = [...TESTS, ...extra];
  const countries = useQuery<{ items: { slug: string; code: string; nameMn: string; nameEn: string; publishedUniversities?: number }[] }>({ queryKey: ['countries-home'], queryFn: () => api('/countries', { query: { pageSize: 100 } }) });
  /** Итали хүртэлх улсыг анхнаасаа, үлдсэнийг «Бүгдийг харах» товчоор нээнэ */
  const [showAllCountries, setShowAllCountries] = useState(false);
  const sortedCountries = byMongolianPriority(countries.data?.items ?? []);
  const mainCountries = sortedCountries.filter((c) => isMainCountry(c.slug));
  const hiddenCount = sortedCountries.length - mainCountries.length;
  const shownCountries = showAllCountries ? sortedCountries : mainCountries;

  return (
    <>
      <section className="relative overflow-hidden bg-hero bg-dots text-hero-foreground">
        <div aria-hidden className="pointer-events-none absolute inset-0 text-white/30">
          <span className="absolute -right-16 -top-24 size-72 rounded-full bg-white/10" />
          <span className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-white/10" />
          <span className="absolute left-[14%] top-[30%] size-16 rounded-full border-4 border-white/15" />
          <span className="absolute bottom-[18%] right-[28%] size-12 rounded-full border-4 border-white/15" />
          <span className="absolute right-[12%] top-[62%] size-5 rounded-full bg-white/20" />
          <span className="absolute left-[34%] top-[26%] size-3 rounded-full bg-white/25" />
          {HERO_DECOR.map(({ Icon, cls, delay }) => (
            <Icon key={cls} className={`anim-float absolute ${cls}`} style={{ animationDelay: delay }} strokeWidth={2.25} />
          ))}
        </div>
        <PageContainer className="relative flex items-center justify-between gap-6 py-4 md:py-6">
          <div className="flex min-w-0 flex-col gap-2 md:gap-3">
            <h1 className="max-w-3xl text-h3 font-extrabold sm:text-h2 md:text-h1">{t.home.heroTitle}</h1>
            <p className="max-w-xl border-l-4 border-hero-foreground/40 pl-3 text-body-sm font-semibold italic md:text-body-lg">«{t.brand.slogan}»</p>
          </div>
          <LogoMark body className="anim-float hidden size-28 drop-shadow-xl md:block lg:size-36" />
        </PageContainer>
      </section>

      <Section title={H.testsTitle} href="/assessments" cta={<Button asChild variant="ghost"><Link href="/assessments">{H.viewAll}<ArrowRight /></Link></Button>}>
        <SwipeRow label={H.testsTitle}>
          {tests.map((x) => (
            <Card key={x.key} interactive={x.available} role="listitem" className={`relative flex w-[85%] shrink-0 snap-start flex-col gap-2 p-4 sm:w-[calc((100%-1rem)/2.4)] sm:p-5 lg:w-[calc((100%-2rem)/3.4)] ${x.available ? '' : 'opacity-70'}`}>
              <div className="flex items-start gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${x.tone}`}><x.icon className="size-6" aria-hidden /></span>
                <h2 className="min-w-0 pt-0.5 text-h4 leading-snug">{x.available ? <Link href={x.href} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{x.title}</Link> : x.title}</h2>
              </div>
              <p className="line-clamp-3 text-body-sm text-muted-foreground">{x.desc}</p>
              <div className="mt-auto flex justify-end pt-1">{x.available ? <span className={buttonVariants({ size: 'sm' })}>{H.takeTest}<ArrowRight aria-hidden /></span> : <Badge variant="muted">{t.assessments.comingSoon}</Badge>}</div>
            </Card>
          ))}
        </SwipeRow>
      </Section>

      <Section title={H.featuredTitle} href="/universities" cta={<Button asChild variant="ghost"><Link href="/universities">{H.viewAll}<ArrowRight /></Link></Button>}>
        <StateBoundary isLoading={featured.isLoading} error={featured.error} onRetry={featured.refetch} isEmpty={!featured.data?.length}
          skeleton={<div className={RAIL}>{[0, 1, 2].map((i) => <div key={i} className={RAIL_ITEM}><CardSkeleton /></div>)}</div>}>
          <div className={RAIL}>{featured.data?.map((u) => <div key={u.id} className={RAIL_ITEM}><UniversityCard u={u} /></div>)}</div>
        </StateBoundary>
      </Section>

      <Section title={H.countriesTitle} className="pb-8 md:pb-12">
        <StateBoundary isLoading={countries.isLoading} error={countries.error} onRetry={countries.refetch} isEmpty={!countries.data?.items.length}>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {shownCountries.map((c) => (
              <li key={c.slug}>
                <Card interactive className="relative flex h-full items-center gap-3 p-3.5">
                  <Flag code={c.code} size={32} />
                  <h3 className="min-w-0 flex-1 text-h4 [overflow-wrap:normal]"><Link href={`/universities?country=${c.slug}`} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{c.nameMn}</Link></h3>
                  <span className="shrink-0 whitespace-nowrap text-caption text-muted-foreground">{c.publishedUniversities ?? 0} {H.countryUnis}</span>
                </Card>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" aria-expanded={showAllCountries} onClick={() => setShowAllCountries((v) => !v)}>
                {showAllCountries ? H.showFewerCountries : `${H.showAllCountries} (+${hiddenCount})`}
                <ChevronDown className={`transition-transform ${showAllCountries ? 'rotate-180' : ''}`} aria-hidden />
              </Button>
            </div>
          )}
        </StateBoundary>
      </Section>
    </>
  );
}
