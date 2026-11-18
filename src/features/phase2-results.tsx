'use client';
import Link from 'next/link';
import { fmtDate, t } from '@/i18n';
import { Flag, NoData } from '@/components/common';
import { Alert, Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Card, Progress } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { MatchRing } from '@/components/assessment/career-match-card';

const P = t.p2;

function Breakdown({ d }: { d: Record<string, number | null> | null }) {
  if (!d) return null;
  return (
    <div><p className="mb-1.5 text-label">{t.result.breakdown}</p>
      <div className="grid gap-1.5">{Object.entries(d).map(([k, v]) => <div key={k} className="flex items-center gap-2"><span className="w-28 shrink-0 text-caption">{P.dims[k] ?? k}</span>{v === null ? <span className="text-caption text-muted-foreground">{t.common.noData}</span> : <><Progress value={v} className="h-1.5 flex-1" /><span className="w-7 text-right text-caption">{v}</span></>}</div>)}</div></div>
  );
}
function Footer({ r }: { r: any }) {
  return (
    <>
      <Alert hideIcon title={t.result.method}><p className="text-body-sm">{r.method?.note}</p><p className="mt-1 text-caption opacity-80">{Object.entries(r.method?.weights ?? {}).map(([k, v]) => `${P.dims[k] ?? k}: ${Math.round((v as number) * 100)}%`).join(' · ')}</p></Alert>
      <Alert hideIcon variant="warning" title={t.assessments.disclaimerTitle}><p className="text-body-sm">{r.disclaimer}</p></Alert>
    </>
  );
}
const Chips = ({ items, variant = 'default' }: { items?: string[]; variant?: any }) => (items?.length ? <div className="flex flex-wrap gap-1.5">{items.map((i) => <Badge key={i} variant={variant}>{i}</Badge>)}</div> : <NoData />);
interface School { slug: string; name: string; city?: string | null; country?: { code?: string; nameMn?: string } | null }

/** Санал болгосон сургуулиудыг «Монгол» (улсын код MN) ба «Гадаад» гэж хуваана. Бүлэгт мэдээлэл байхгүй бол үүнийг хэлнэ (зохиохгүй). */
export function SchoolGroups({ items }: { items: School[] }) {
  const groups = [
    { key: 'domestic', title: P.domesticSchools, list: items.filter((u) => u.country?.code === 'MN'), empty: P.noneYet },
    { key: 'abroad', title: P.abroadSchools, list: items.filter((u) => u.country?.code !== 'MN'), empty: P.noneYet },
  ];
  return (
    <div className="grid gap-3">
      {groups.map((g) => (
        <div key={g.key} data-testid={`schools-${g.key}`}>
          <p className="mb-1 text-caption font-semibold text-muted-foreground">{g.title}</p>
          {g.list.length
            ? <ul className="grid gap-2 sm:grid-cols-2">{g.list.map((u) => <li key={u.slug}><Link href={`/universities/${u.slug}`} className="flex items-center gap-2 rounded-md border p-2.5 text-body-sm transition-colors hover:bg-muted"><Flag code={u.country?.code} size={16} /><span className="min-w-0"><span className="block truncate font-medium">{u.name}</span><span className="block text-caption text-muted-foreground">{u.country?.nameMn}{u.city ? `, ${u.city}` : ''}</span></span></Link></li>)}</ul>
            : <p className="text-body-sm italic text-muted-foreground">{g.empty}</p>}
        </div>
      ))}
    </div>
  );
}
const Trigger =({ score, title, sub, flag }: { score: number; title: string; sub: string; flag?: string }) => <span className="flex items-center gap-3"><MatchRing value={score} size={48} />{flag && <Flag code={flag} size={28} />}<span><span className="block font-semibold">{title}</span><span className="block text-caption font-normal text-muted-foreground">{sub}</span></span></span>;

export function MastersResult({ r }: { r: any }) {
  const p = r.profile ?? {};
  return (
    <div className="grid gap-5">
      <Alert variant="info" title={P.mastersTitle}><p>{r.summary}</p>{r.completedAt && <p className="mt-1 text-caption opacity-80">{fmtDate(r.completedAt)}</p>}</Alert>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5"><h2 className="mb-2 text-h4">{P.profile}</h2><dl className="space-y-1 text-body-sm"><div>{P.bachelor}: <b>{p.bachelorArea ?? t.common.noData}</b></div><div>{P.experience}: <b>{p.years} {P.years}</b></div><div>{P.goal}: <b>{p.goal ?? t.common.noData}</b></div></dl></Card>
        <Card className="p-5"><h2 className="mb-2 text-h4">{P.gaps}</h2>{r.knowledgeGaps?.length ? <Chips items={r.knowledgeGaps} variant="warning" /> : <p className="text-muted-foreground">{t.result.noResults}</p>}</Card>
      </div>
      {Object.keys(r.byType ?? {}).length > 0 && (
        <Card className="p-5"><h2 className="mb-2 text-h4">{P.typeGroups}</h2>
          <div className="space-y-2">{Object.entries(r.byType).map(([type, slugs]) => <div key={type} className="flex flex-wrap items-start gap-2"><Badge variant="default" className="shrink-0">{r.typeLabels[type]}</Badge><span className="text-body-sm">{(slugs as string[]).map((s) => r.fieldMatches.find((m: any) => m.slug === s)?.nameMn).join(' · ')}</span></div>)}</div>
          <p className="mt-2 text-caption text-muted-foreground">{r.programNote}</p></Card>
      )}
      <Accordion type="single" collapsible defaultValue={r.fieldMatches?.[0]?.slug} className="space-y-2">
        {r.fieldMatches?.map((m: any, i: number) => (
          <AccordionItem key={m.slug} value={m.slug}>
            <AccordionTrigger><Trigger score={m.score} title={`${i + 1}. ${m.nameMn}`} sub={`${m.nameEn} · ${m.typeLabel}`} /></AccordionTrigger>
            <AccordionContent><div className="grid gap-4">
              {m.description && <p className="text-body-sm">{m.description}</p>}
              <div><p className="mb-1 text-label">{P.why}</p><ul className="space-y-0.5 text-body-sm">{m.why.map((w: string, j: number) => <li key={j}>• {w}</li>)}</ul></div>
              <Breakdown d={m.breakdown} />
              {m.prerequisites?.length > 0 && <div><p className="mb-1 text-label">{P.prerequisites}</p><Chips items={m.prerequisites} variant="warning" /></div>}
              {m.competencies?.length > 0 && <div><p className="mb-1 text-label">{P.competencies}</p><Chips items={m.competencies} /></div>}
              {m.commonExams?.length > 0 && <div><p className="mb-1 text-label">{P.exams}</p><Chips items={m.commonExams} variant="muted" /><p className="mt-1 text-caption text-muted-foreground">{P.examNote}</p></div>}
              <div data-testid="masters-where">
                <p className="mb-1 text-label">{t.s.result.whereTitle}</p>
                {m.universities?.length ? (
                  <div className="grid gap-3">
                    {m.countries?.length > 0 && <div><p className="mb-1 text-caption text-muted-foreground">{t.s.result.whereCountries}</p><div className="flex flex-wrap gap-2">{m.countries.map((c: any) => <Button key={c.slug} asChild variant="outline" size="sm"><Link href={`/universities?country=${c.slug}&degree=master${m.uniSubject ? `&subject=${m.uniSubject}` : ''}`}><Flag code={c.code} size={16} />{c.nameMn}{c.preferred ? ` · ${t.s.result.preferred}` : ''}</Link></Button>)}</div></div>}
                    <SchoolGroups items={m.universities} />
                  </div>
                ) : <p className="italic text-muted-foreground">{t.s.result.whereNone}</p>}
              </div>
              <div><Button asChild size="sm"><Link href={`/universities?degree=master${m.uniSubject ? `&subject=${m.uniSubject}` : ''}`}>{P.findPrograms}</Link></Button></div>
            </div></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Footer r={r} />
    </div>
  );
}

export function LanguageResult({ r }: { r: any }) {
  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h2">{P.languageMatches}</h2>
      </header>
      <Accordion type="single" collapsible defaultValue={r.countryMatches?.[0]?.slug} className="space-y-2">
        {r.countryMatches?.map((m: any, i: number) => (
          <AccordionItem key={m.slug} value={m.slug}>
            <AccordionTrigger><Trigger score={m.score} flag={m.code} title={`${i + 1}. ${m.nameMn}`} sub={`${m.nameEn} · ${P.match} ${m.score}%`} /></AccordionTrigger>
            <AccordionContent><div className="grid gap-4">
              <div><p className="mb-1 text-label">{P.why}</p><ul className="space-y-0.5 text-body-sm">{m.why.map((w: string, j: number) => <li key={j}>• {w}</li>)}</ul></div>
              <Breakdown d={m.breakdown} />
              {(m.pros.length > 0 || m.cons.length > 0) && <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="mb-1 text-label">{P.pros}</p>{m.pros.length ? <ul className="space-y-0.5 text-body-sm">{m.pros.map((x: string) => <li key={x}>+ {x}</li>)}</ul> : <NoData />}</div>
                <div><p className="mb-1 text-label">{P.cons}</p>{m.cons.length ? <ul className="space-y-0.5 text-body-sm">{m.cons.map((x: string) => <li key={x}>− {x}</li>)}</ul> : <NoData />}</div></div>}
              {m.breakdown && <dl className="grid gap-3 text-body-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">{P.cost}</dt><dd>{m.costTier ?? <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.languages}</dt><dd>{m.languages?.join(', ') || <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.livingCost}</dt><dd>{m.livingCostMonthlyUsd ? `${m.livingCostMonthlyUsd.min ?? '?'} – ${m.livingCostMonthlyUsd.max ?? '?'} USD` : <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.tuition}</dt><dd>{m.tuitionRange ?? <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.prepInfo}</dt><dd>{m.languagePrepInfo ?? <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.scholarship}</dt><dd>{m.scholarshipInfo ?? <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.prepUnis}</dt><dd>{m.languagePrepUniversities || <NoData />}</dd></div>
                <div><dt className="text-muted-foreground">{P.visa}</dt><dd>{m.visaLinks?.length ? m.visaLinks.map((v: any) => <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer" className="block text-primary underline dark:text-secondary">{v.title}</a>) : <NoData />}</dd></div>
              </dl>}
              <div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link href={`/countries/${m.slug}`}>{P.countryPage}</Link></Button><Button asChild size="sm"><Link href={`/universities?country=${m.slug}&degree=language_prep`}>{t.result.findUniversities}</Link></Button></div>
            </div></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Footer r={r} />
    </div>
  );
}
