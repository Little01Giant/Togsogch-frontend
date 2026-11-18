'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Atom, BookOpen, Briefcase, Compass, Globe2, GraduationCap, Lightbulb, Microscope, Palette, Pencil, Rocket, Sparkles, Star, Target, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { CardSkeleton, Flag, StateBoundary } from '@/components/common';
import { LogoMark } from '@/components/brand/logo-mark';
import { PageContainer, Section } from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/data-display';
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
const RAIL ='-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0';
const RAIL_ITEM = 'w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-auto';
const N = t.assessments.names;
const TESTS = [
  { key: 'career', href: '/assessments/career', icon: Compass, tone: 'bg-gold-soft text-gold-soft-foreground', title: N.career.title, desc: N.career.subtitle },
  { key: 'study', href: '/assessments/city', icon: Globe2, tone: 'bg-success-soft text-success-soft-foreground', title: N.city.title, desc: N.city.subtitle },
];

export default function HomePage() {
  const featured = useQuery<UniCard[]>({ queryKey: ['unis-featured'], queryFn: () => api('/universities/featured') });
  const countries = useQuery<{ items: { slug: string; code: string; nameMn: string; nameEn: string; publishedUniversities?: number }[] }>({ queryKey: ['countries-home'], queryFn: () => api('/countries', { query: { pageSize: 100 } }) });

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
        <PageContainer className="relative flex items-center justify-between gap-8 py-10 md:py-16">
          <div className="flex min-w-0 flex-col gap-5">
            <h1 className="max-w-3xl text-display font-extrabold">{t.home.heroTitle}</h1>
            <p className="max-w-xl border-l-4 border-hero-foreground/40 pl-3 text-body-lg font-semibold italic">«{t.brand.slogan}»</p>
          </div>
          <LogoMark body className="anim-float hidden size-48 drop-shadow-xl md:block lg:size-60" />
        </PageContainer>
      </section>

      <Section title={H.testsTitle} href="/assessments" cta={<Button asChild variant="ghost"><Link href="/assessments">{H.viewAll}<ArrowRight /></Link></Button>}>
        <div className="grid gap-4 md:grid-cols-2">
          {TESTS.map((x) => (
            <Card key={x.key} interactive className="relative flex flex-col gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${x.tone}`}><x.icon className="size-7" aria-hidden /></span>
                <h2 className="min-w-0 text-h3"><Link href={x.href} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{x.title}</Link></h2>
              </div>
              <p className="text-body-sm text-muted-foreground">{x.desc}</p>
              <div className="mt-auto flex justify-end pt-2"><span className={buttonVariants({ size: 'default' })}>{H.takeTest}<ArrowRight aria-hidden /></span></div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={H.featuredTitle} href="/universities" cta={<Button asChild variant="ghost"><Link href="/universities">{H.viewAll}<ArrowRight /></Link></Button>}>
        <StateBoundary isLoading={featured.isLoading} error={featured.error} onRetry={featured.refetch} isEmpty={!featured.data?.length}
          skeleton={<div className={RAIL}>{[0, 1, 2].map((i) => <div key={i} className={RAIL_ITEM}><CardSkeleton /></div>)}</div>}>
          <div className={RAIL}>{featured.data?.map((u) => <div key={u.id} className={RAIL_ITEM}><UniversityCard u={u} /></div>)}</div>
        </StateBoundary>
      </Section>

      <Section title={H.countriesTitle} href="/countries" cta={<Button asChild variant="ghost"><Link href="/countries">{H.viewAll}<ArrowRight /></Link></Button>} className="pb-8 md:pb-12">
        <StateBoundary isLoading={countries.isLoading} error={countries.error} onRetry={countries.refetch} isEmpty={!countries.data?.items.length}>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {countries.data?.items.map((c) => (
              <li key={c.slug}>
                <Card interactive className="relative flex h-full items-center gap-3 p-3.5">
                  <Flag code={c.code} size={32} />
                  <h3 className="min-w-0 flex-1 text-h4 [overflow-wrap:normal]"><Link href={`/universities?country=${c.slug}`} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{c.nameMn}</Link></h3>
                  <span className="shrink-0 whitespace-nowrap text-caption text-muted-foreground">{c.publishedUniversities ?? 0} {H.countryUnis}</span>
                </Card>
              </li>
            ))}
          </ul>
        </StateBoundary>
      </Section>
    </>
  );
}
