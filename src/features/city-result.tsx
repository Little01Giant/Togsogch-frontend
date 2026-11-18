'use client';
import { Check, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Flag, NoData } from '@/components/common';
import { Alert, Badge, Card, Progress } from '@/components/ui/data-display';
import { MatchRing } from '@/components/assessment/career-match-card';

const C = t.p2.city;
const range = (r?: [number, number]) => (r ? (r[0] === r[1] ? `${r[0]}` : `${r[0]} – ${r[1]}`) : null);

/** Үзүүлэлт бүр: нэр + оноо нэг мөрөнд, доор нь зурвас. 2 баганатай тул утсан дээр ч багтана. */
function Breakdown({ d }: { d: Record<string, number> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {Object.entries(d).map(([k, v]) => (
        <div key={k} className="min-w-0">
          <div className="flex items-baseline justify-between gap-2 text-caption"><dt className="min-w-0 text-muted-foreground [overflow-wrap:anywhere]">{C.dims[k] ?? k}</dt><dd className="shrink-0 font-semibold">{Math.round(v)}</dd></div>
          <Progress value={v} className="mt-1 h-1.5" />
        </div>
      ))}
    </dl>
  );
}

/** Тоон мэдээлэл (төсөв, банкны баталгаа) — жижиг хавтан */
function Fact({ label, value }: { label: string; value?: string | null }) {
  return <div className="px-3 py-2.5"><dt className="text-caption text-muted-foreground">{label}</dt><dd className="mt-0.5 text-body-sm font-medium">{value || <NoData />}</dd></div>;
}

type Gate = { career: boolean; masters: boolean; mode: 'master' | 'bachelor' | 'none' };

export function CityResult({ r }: { r: any }) {
  const gate: Gate | undefined = r.universityGate;
  return (
    <div className="grid min-w-0 grid-cols-1 gap-8 [&>*]:min-w-0">
      <section className="grid grid-cols-1 gap-4" data-testid="dream-cities">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h2">{C.matches}</h2>
        </header>
        {r.readiness?.priorMissing && <Alert hideIcon variant="warning"><p className="text-body-sm">{C.priorMissing}</p></Alert>}
        {r.readiness?.low && <Alert hideIcon variant="warning" title={C.readiness}><p className="text-body-sm">{C.readinessLow}</p></Alert>}

        {r.languagePrep && <p className="text-body-sm text-muted-foreground">{C.languagePrep}: <b className="font-semibold text-foreground">{r.languagePrep.languageMn} {C.langSuffix}</b>{r.languagePrep.durationMn ? ` · ${r.languagePrep.durationMn}` : ''}</p>}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          {r.dreamCities?.map((c: any, i: number) => (
            <Card key={c.id} className="flex flex-col gap-5 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-caption font-bold text-primary-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-h3 leading-tight">{c.nameMn}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-caption text-muted-foreground"><Flag code={c.countryCode} size={16} />{c.countryMn}<Badge variant={c.countryCode === 'MN' ? 'success' : 'info'} data-testid="city-origin">{c.countryCode === 'MN' ? t.p2.domestic : t.p2.abroad}</Badge></p>
                </div>
                <div className="shrink-0 text-center"><MatchRing value={c.score} size={56} /><p className="mt-0.5 text-caption text-muted-foreground">{t.p2.match}</p></div>
              </div>

              <ul className="grid gap-2 text-body-sm">
                {c.why.map((w: string) => <li key={w} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden /><span className="min-w-0">{w}</span></li>)}
              </ul>

              <Breakdown d={c.breakdown} />

              {c.meta && (
                <dl className="divide-y rounded-lg border bg-muted/30">
                  <Fact label={C.work} value={c.meta.langPrepWorkNote} />
                  <Fact label={C.budget} value={range(c.meta.budgetM) && `${range(c.meta.budgetM)} ${C.million}`} />
                  <Fact label={C.visa} value={c.meta.postGradVisa} />
                </dl>
              )}

              {gate?.mode === 'none' && (
                <div className="mt-auto border-t pt-4" data-testid="university-gate">
                  <Button asChild className="w-full"><Link href="/assessments/career">{C.gateCareerBtn}</Link></Button>
                </div>
              )}
              {gate && gate.mode !== 'none' && (
                <div className="mt-auto border-t pt-4">
                  <p className="flex items-center gap-1.5 text-label"><GraduationCap className="size-4 text-muted-foreground" aria-hidden />{C.universities}</p>
                  <p className="mb-2 mt-0.5 text-caption text-muted-foreground">{gate.mode === 'master' ? C.gateMasterTag : C.gateBachelorTag}</p>
                  {c.universities?.length
                    ? <ul className="grid gap-1.5">{c.universities.map((u: { slug: string; name: string; city?: string | null }) => <li key={u.slug}><Link href={`/universities/${u.slug}`} className="flex flex-col rounded-md border bg-muted/40 px-3 py-2 text-body-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="font-medium">{u.name}</span>{u.city && <span className="text-caption text-muted-foreground">{u.city}</span>}</Link></li>)}</ul>
                    : <p className="text-body-sm text-muted-foreground">{C.noUnis}</p>}                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-3">
        <Alert hideIcon title={t.result.method}><p className="text-body-sm">{r.method?.note}</p><p className="mt-1 text-caption opacity-80">{Object.entries(r.method?.weights ?? {}).map(([k, v]) => `${C.dims[k] ?? k}: ${Math.round((v as number) * 100)}%`).join(' · ')}</p></Alert>
        <Alert hideIcon variant="warning" title={t.assessments.disclaimerTitle}><p className="text-body-sm">{r.disclaimer}</p></Alert>
      </div>
    </div>
  );
}
