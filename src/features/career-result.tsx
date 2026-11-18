'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdviceBulb } from '@/components/advice-bulb';
import { LogoMark } from '@/components/brand/logo-mark';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/overlays';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { fmtDate, t } from '@/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Card, Progress, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { MatchRing } from '@/components/assessment/career-match-card';

const R = t.result;
const KEYS = ['R', 'I', 'A', 'S', 'E', 'C'];
const SHORT: Record<string, string> = { R: 'Практик', I: 'Судалгаа', A: 'Бүтээлч', S: 'Нийгмийн', E: 'Бизнес', C: 'Зохион байгуулалт' };

/** Радар дахь шошго таслагдахгүйн тулд товч хувилбар */
const RADAR_LABEL: Record<string, string> = { C: 'Зохион байгуул.' };

/** Нэр + оноо дээд мөрөнд, bar доор нь бүтэн өргөнөөр (нэр олон мөр болдоггүй). Оноогоор буурах дараалал */
function ScoreList({ items }: { items: [string, number | null][] }) {
  const rows = [...items].sort((a, b) => (b[1] ?? -1) - (a[1] ?? -1));
  return (
    <ul className="grid gap-3.5">
      {rows.map(([label, v]) => (
        <li key={label}>
          <div className="flex items-baseline justify-between gap-3 text-body-sm">
            <span>{label}</span>
            {v === null ? <span className="text-caption text-muted-foreground">{t.common.noData}</span> : <span className="font-semibold tabular-nums">{v}</span>}
          </div>
          {v !== null && (
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
              <div className="h-full rounded-full bg-secondary" style={{ width: `${v}%` }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Bars({ items }: { items: [string, number | null][] }) {
  return <div className="grid gap-1.5">{items.map(([label, v]) => <div key={label} className="flex items-center gap-2"><span className="w-28 shrink-0 text-caption">{label}</span>{v === null ? <span className="text-caption text-muted-foreground">{t.common.noData}</span> : <><Progress value={v} className="h-1.5 flex-1" /><span className="w-7 text-right text-caption">{v}</span></>}</div>)}</div>;
}

const PAGE = 5;

/** Салбар доторх мэргэжлүүд: 5-aар нэмж харуулна */
function CategoryCareers({ careers }: { careers: any[] }) {
  const [shown, setShown] = useState(PAGE);
  return (
    <>
      <p className="mb-2 text-label font-bold">{R.bestCareers}</p>
      <ul className="divide-y divide-border">
        {careers.slice(0, shown).map((m) => (
          <li key={m.slug} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <Link href={`/careers/${m.slug}`} className="min-w-0 flex-1 rounded-sm text-body-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [overflow-wrap:anywhere]">{m.nameMn}</Link>
            <Progress value={m.absoluteScore} className="hidden h-1.5 w-24 sm:block" aria-label={m.nameMn} />
            <span className="w-14 shrink-0 text-right text-body-sm font-medium">{m.absoluteScore}%</span>
          </li>
        ))}
      </ul>
      {careers.length > shown && <Button variant="ghost" size="sm" className="mt-2 h-10 w-full" onClick={() => setShown((n) => n + PAGE)}>{R.showMore}<ChevronDown className="size-4" aria-hidden /></Button>}
    </>
  );
}

export function CareerResult({ r }: { r: any }) {
  const [showAll, setShowAll] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllLeast, setShowAllLeast] = useState(false);
  const radar = KEYS.map((k) => ({ axis: RADAR_LABEL[k] ?? SHORT[k], value: r.riasec?.[k] ?? 0 }));
  const holland = new Set(String(r.hollandCode ?? ''));
  const riasecRows = KEYS.map((k) => ({ k, v: (r.riasec?.[k] ?? null) as number | null, strong: holland.has(k) })).sort((a, b) => (b.v ?? -1) - (a.v ?? -1));
  const dims: [string, string][] = [['cosine', R.cosine], ['euclidean', R.euclidean], ['interest', R.interest], ['skills', R.skills], ['workStyle', R.workStyle], ['values', R.values], ['academic', R.academic]];
  const advice: { key: string; tone: 'info' | 'warning'; title: string; text: string }[] = [
    ...(r.quality?.reducedConfidence ? [{ key: 'confidence', tone: 'warning' as const, title: R.lowConfidence, text: `${r.quality.missingAnswers} ${R.lowConfidenceNote}` }] : []),
    ...(r.counselorFlags ?? []).map((f: any) => ({ key: f.key, tone: 'warning' as const, title: R.flagTitles[f.key as keyof typeof R.flagTitles] ?? R.flags, text: f.text })),
    ...(r.notes ?? []).map((n: string) => ({ key: n, tone: 'info' as const, title: R.noteTitle, text: n })),
  ];
  const adviceCount = advice.length;

  return (
    <div className="grid gap-4 md:gap-5">
      <Card className="grid gap-3 p-3.5 sm:gap-5 sm:p-6" data-testid="result-hero">
        <div className="grid gap-2.5 sm:gap-3">
          <p className="eyebrow">{R.title}{r.completedAt && <span className="font-normal normal-case tracking-normal text-muted-foreground"> · {fmtDate(r.completedAt)}</span>}</p>
          {r.hollandCode && (
            <div>
              <ul className="flex flex-wrap gap-2" aria-label={`${R.hollandCode}: ${r.hollandCode}`}>
                {[...String(r.hollandCode)].map((ch, i) => <li key={`${ch}${i}`} className="rounded-lg bg-primary px-3 py-1.5 text-body-sm text-primary-foreground">{SHORT[ch] ?? ch}</li>)}
              </ul>
            </div>
          )}
          <p className="text-body-sm text-muted-foreground">{String(r.summary ?? '').split(' Давуу тал:')[0]}</p>
          {r.strengths?.length > 0 && (
            <div className="grid gap-1.5">
              <p className="text-label">{R.strengths}</p>
              <ul className="grid gap-1">{r.strengths.slice(0, 3).map((s: any) => <li key={s.key} className="flex items-start gap-1.5 text-body-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{s.name}</li>)}</ul>
            </div>
          )}
        </div>
      </Card>

      {r.careerMatches?.length > 0 && (
        <section data-testid="top-picks">
          <h2 className="mb-3 text-h4">{R.topMatches}</h2>
          <Card className="p-0">
            <ol className="divide-y divide-border">
              {r.careerMatches.slice(0, showAll ? undefined : 3).map((m: any) => (
                <li key={m.slug}>
                  <Link href={`/careers/${m.slug}`} className="flex items-center gap-2 px-3.5 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4">
                    <span className="min-w-0 flex-1"><span className="block text-body-sm font-semibold">{m.nameMn}</span><span className="block truncate text-caption text-muted-foreground">{m.nameEn}</span></span>
                    <span className="shrink-0 text-body-sm font-semibold text-primary dark:text-secondary">{m.score}%</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ol>
            {r.careerMatches.length > 3 && (
              <Button variant="ghost" className="h-12 w-full rounded-t-none border-t border-border text-body-sm font-semibold" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
                {showAll ? R.showLess : `${R.showAll} (${r.careerMatches.length})`}
                <ChevronDown className={`size-4 transition-transform ${showAll ? 'rotate-180' : ''}`} aria-hidden />
              </Button>
            )}
          </Card>
        </section>
      )}

      {r.categoryMatches?.length > 0 && (
        <section data-testid="category-matches">
          <h2 className="mb-3 text-h4">{R.categories}</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {r.categoryMatches.slice(0, showAllCats ? undefined : 3).map((c: any) => (
              <AccordionItem key={c.slug} value={c.slug}>
                <AccordionTrigger>
                  <span className="flex w-full min-w-0 items-center gap-3 pr-2">
                    <span className="min-w-0 flex-1 text-left"><span className="block font-semibold">{c.nameMn}</span><span className="block text-caption font-normal text-muted-foreground">{c.careerCount} {R.careersInCategory}</span></span>
                    <Progress value={c.absoluteScore} className="hidden h-2 w-32 sm:block" aria-label={c.nameMn} />
                    <span className="w-14 shrink-0 text-right font-semibold">{c.absoluteScore}%</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <CategoryCareers careers={c.careers} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {r.categoryMatches.length > 3 && (
            <Button variant="outline" className="mt-2 h-12 w-full text-body-sm font-semibold" aria-expanded={showAllCats} onClick={() => setShowAllCats((v) => !v)}>
              {showAllCats ? R.showLess : `${R.showAll} (${r.categoryMatches.length})`}
              <ChevronDown className={`size-4 transition-transform ${showAllCats ? 'rotate-180' : ''}`} aria-hidden />
            </Button>
          )}
        </section>
      )}

      {adviceCount > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 w-full justify-between text-body-sm font-semibold" data-testid="advice-trigger">
              <span className="flex items-center gap-2"><Lightbulb className="size-4" aria-hidden />{R.advice}</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <SheetHeader className="pr-8">
              <SheetTitle className="flex items-center gap-2"><Lightbulb className="size-5 text-primary dark:text-secondary" aria-hidden />{R.advice}</SheetTitle>
              <SheetDescription>{R.adviceDesc}</SheetDescription>
            </SheetHeader>
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {advice.map((a) => {
                const Icon = a.tone === 'warning' ? TriangleAlert : Info;
                return (
                  <li key={a.key} className="bg-card p-3.5">
                    <p className="flex items-center gap-1.5 text-body-sm font-semibold">{a.title}<Icon className={cn('size-4 shrink-0', a.tone === 'warning' ? 'text-warning' : 'text-info')} aria-hidden /></p>
                    <p className="mt-1 text-body-sm text-muted-foreground">{a.text}</p>
                  </li>
                );
              })}
            </ul>
            <div className="grid flex-1 place-items-center py-4"><AdviceBulb className="w-32 max-w-full" /></div>
            <div className="sticky bottom-0 bg-card pt-4"><SheetClose asChild><Button fullWidth>{R.gotIt}</Button></SheetClose></div>
          </SheetContent>
        </Sheet>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <h2 className="text-h4">{R.profile}</h2>
          <div className="h-56" role="img" aria-label={R.profile}><ResponsiveContainer width="100%" height="100%"><RadarChart data={radar} outerRadius="68%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}><PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} /><Radar dataKey="value" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} /></RadarChart></ResponsiveContainer></div>
          <ul className="mt-2 grid gap-2.5">
            {riasecRows.map(({ k, v, strong }) => (
              <li key={k} className="flex items-center gap-2.5 text-caption">
                <span className={cn('w-32 shrink-0 whitespace-nowrap', strong ? 'font-semibold' : 'text-muted-foreground')}>{SHORT[k]}</span>
                {v === null
                  ? <span className="text-muted-foreground">{t.common.noData}</span>
                  : <><span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className={cn('block h-full rounded-full', strong ? 'bg-secondary' : 'bg-secondary/40')} style={{ width: `${v}%` }} /></span><span className="w-7 shrink-0 text-right font-semibold tabular-nums">{v}</span></>}
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid content-start gap-5">
          {r.personality?.length > 0 && (
            <Card className="p-4 sm:p-5"><h2 className="mb-4 text-h4">{R.personality}</h2>
              <ScoreList items={r.personality.map((p: any) => [p.name, p.score])} />
              <p className="mt-4 border-t border-border pt-3 text-caption text-muted-foreground">{R.personalityNote}</p></Card>
          )}
          {r.cognitive?.length > 0 && <Card className="p-4 sm:p-5"><h2 className="mb-4 text-h4">{R.cognitive}</h2><ScoreList items={r.cognitive.map((p: any) => [p.name, p.score])} /></Card>}
          {r.environment && <Card className="p-5"><h2 className="mb-2 text-h4">{R.environment}</h2><p className="text-body-sm">{r.environment.label}</p></Card>}
          {r.subjectsFocus?.length > 0 && <Card className="p-5"><h2 className="mb-2 text-h4">{R.subjects}</h2><div className="flex flex-wrap gap-1.5">{r.subjectsFocus.map((s: any) => <Badge key={s.key} variant="outline">{s.name}</Badge>)}</div></Card>}
        </div>
      </div>

      {r.skillGaps?.length > 0 && (
        <Card className="p-5"><h2 className="mb-3 text-h4">{R.gaps}</h2>
          <Table><TableHeader><TableRow><TableHead>{t.admin.skills}</TableHead><TableHead>{R.userLevel} ({R.selfReported})</TableHead><TableHead>{R.required}</TableHead><TableHead>{t.nav.careers}</TableHead></TableRow></TableHeader>
            <TableBody>{r.skillGaps.map((g: any) => <TableRow key={g.key}><TableCell>{g.name}</TableCell><TableCell>{g.user}</TableCell><TableCell>{g.required}</TableCell><TableCell className="whitespace-normal text-caption">{g.careers.join(', ')}</TableCell></TableRow>)}</TableBody></Table></Card>
      )}

      {r.leastMatches?.length > 0 && (
        <section data-testid="career-matches">
          <h2 className="mb-3 text-h4">{R.tabNoMatch}</h2>
          <Accordion type="single" collapsible className="space-y-2" data-testid="least-matches">
            {r.leastMatches.slice(0, showAllLeast ? undefined : 2).map((m: any, i: number) => (
              <AccordionItem key={m.slug} value={m.slug}>
                <AccordionTrigger><span className="flex items-center gap-3"><MatchRing value={m.score} size={48} /><span><span className="block font-semibold">{i + 1}. {m.nameMn}</span><span className="block text-caption font-normal text-muted-foreground">{m.nameEn} · {R.match} {m.score}%</span></span></span></AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div><p className="mb-1 text-label">{R.whyNot}</p><ul className="space-y-0.5 text-body-sm">{m.why.map((w: string, j: number) => <li key={j}>• {w}</li>)}</ul></div>
                    {m.breakdown && <div><p className="mb-1.5 text-label">{R.breakdown}</p><Bars items={dims.filter(([k]) => typeof m.breakdown[k] === 'number').map(([k, label]) => [label, m.breakdown[k]])} /></div>}
                    <div><Button asChild size="sm" variant="outline"><Link href={`/careers/${m.slug}`}>{R.viewCareer}</Link></Button></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {r.leastMatches.length > 2 && (
            <Button variant="outline" className="mt-2 h-12 w-full text-body-sm font-semibold" aria-expanded={showAllLeast} onClick={() => setShowAllLeast((v) => !v)}>
              {showAllLeast ? R.showLess : `${R.showAll} (${r.leastMatches.length})`}
              <ChevronDown className={`size-4 transition-transform ${showAllLeast ? 'rotate-180' : ''}`} aria-hidden />
            </Button>
          )}
        </section>
      )}

      <Accordion type="single" collapsible defaultValue="method">
        <AccordionItem value="method">
          <AccordionTrigger>{R.method}</AccordionTrigger>
          <AccordionContent><p className="text-body-sm">{r.method?.note}</p><p className="mt-1 text-caption text-muted-foreground">{t.careers.attribution}</p></AccordionContent>
        </AccordionItem>
      </Accordion>
      <p className="rounded-md bg-muted p-3.5 text-body-sm text-muted-foreground"><strong className="font-semibold text-foreground">{t.assessments.disclaimerTitle}.</strong> {r.disclaimer}</p>
      <div className="grid justify-items-center gap-1 pt-2 text-center" data-testid="result-cheer">
        <LogoMark body className="anim-float size-40" />
        <p className="text-h4">{R.congrats}</p>
      </div>
    </div>
  );
}
