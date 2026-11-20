'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { SUBJECT_LABEL } from '@/lib/labels';
import { Flag, NoData, StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Card } from '@/components/ui/data-display';
import { Breadcrumb } from '@/components/ui/misc';

const C = t.careers;
const Box = ({ title, aside, children }: { title?: string; aside?: React.ReactNode; children: React.ReactNode }) => (
  <Card className="p-5">
    {(title || aside) && <div className="mb-2 flex items-center justify-between gap-3">{title && <h2 className="text-h4">{title}</h2>}{aside}</div>}
    {children}
  </Card>
);
const Chips = ({ items }: { items?: string[] }) => (items?.length ? <div className="flex flex-wrap gap-1.5">{items.map((i) => <Badge key={i}>{i}</Badge>)}</div> : <NoData />);

const CheckList = ({ items }: { items?: string[] }) => (items?.length
  ? <ul className="grid gap-1.5">{items.map((i) => <li key={i} className="flex items-start gap-1.5 text-body-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{i}</li>)}</ul>
  : <NoData />);

type Entrance = { university: string; school?: string; program: string; flags?: string; level?: string; baseExams: string[]; extraExams: string[]; examGroups?: { exams: string[] }[]; year?: number; sourceName?: string; sourceUrl?: string };
interface CareerDetailData {
  nameMn: string; nameEn?: string; description?: string | null; categoryId?: { nameMn: string } | null; jobZone?: string | number | null;
  entranceExams?: Entrance[]; entranceExamStatus?: 'not_required' | 'unknown' | string; requiredSkillsDetail?: { nameMn: string }[];
  schoolSubjects?: string[]; universityMajors?: string[]; recommendedCountries?: string[];
  market?: { demand?: string | number | null; growth?: string | number | null; salary?: string | number | null };
  mongoliaOpportunity?: string | null; globalOpportunity?: string | null; automationImpact?: string | null; pathways?: string[];
}
interface CountryOption { slug: string; code?: string | null; nameMn: string }
const SKILL_TEST = 'Ур чадварын шалгалт';
const ExamChips = ({ items }: { items: string[] }) => <div className="flex flex-wrap gap-1.5">{items.map((e) => <Badge key={e} variant={e === SKILL_TEST ? 'outline' : 'default'} className="text-xs">{e}</Badge>)}</div>;

const sigOf = (e: Entrance) => [e.university, e.level, e.program, e.baseExams.join(), e.extraExams.join(), (e.examGroups ?? []).map((g) => g.exams.join()).join('/')].join('|');

/** Хөтөлбөр + ЭЕШ-ийн хичээлийн хослол ижил мөрүүдийг нэгтгэж (олон сургууль) харуулна. */
function EntranceExams({ items }: { items: Entrance[] }) {
  const [all, setAll] = useState(false);
  const groups = new Map<string, { head: Entrance; schools: string[] }>();
  for (const e of items) {
    const k = sigOf(e);
    const g = groups.get(k) ?? { head: e, schools: [] };
    const name = e.school ?? e.university;
    if (!g.schools.includes(name)) g.schools.push(name);
    groups.set(k, g);
  }
  const list = Array.from(groups.values());
  const shown = all ? list : list.slice(0, 3);
  const src = items[0];
  const hasSkill = items.some((e) => [...e.baseExams, ...e.extraExams, ...(e.examGroups ?? []).flatMap((g) => g.exams)].includes(SKILL_TEST));
  return (
    <Box title={C.entranceTitle}>
      <p className="mb-3 text-body-sm text-muted-foreground">{C.entranceHint}</p>
      <ul className="grid gap-3">
        {shown.map(({ head, schools }) => (
          <li key={sigOf(head)} className="rounded-lg border bg-muted/30 p-3 md:p-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-body font-semibold">{head.program}</h3>{head.level === 'associate' && <Badge variant="outline" className="text-xs">{C.entranceAssociate}</Badge>}{head.flags?.split('/').map((f) => C.entranceFlags[f] && <Badge key={f} variant="secondary" className="whitespace-normal text-xs">{C.entranceFlags[f]}</Badge>)}</div>
            <p className="mt-0.5 text-caption text-muted-foreground">{head.university}</p>
            {head.examGroups?.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {head.examGroups.map((g, i) => (
                  <div key={i}><p className="mb-1.5 text-caption font-medium text-muted-foreground">{C.entranceGroup.replace('{n}', String(i + 1))}</p><ExamChips items={g.exams} /></div>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><p className="mb-1.5 text-caption font-medium text-muted-foreground">{C.entranceBase}</p><ExamChips items={head.baseExams} /></div>
                <div><p className="mb-1.5 text-caption font-medium text-muted-foreground">{C.entranceExtra}</p><ExamChips items={head.extraExams} /></div>
              </div>
            )}
            <p className="mt-3 text-caption text-muted-foreground"><span className="font-medium">{C.entranceSchools}:</span> {schools.join('; ')}</p>
          </li>
        ))}
      </ul>
      {list.length > 3 && <Button variant="outline" size="sm" className="mt-3" onClick={() => setAll((v) => !v)} aria-expanded={all}>{all ? C.entranceShowLess : `${C.entranceShowAll} (+${list.length - 3})`}</Button>}
      {items.some((e) => e.examGroups?.length && e.university.includes('АШУҮИС')) && <p className="mt-3 text-caption text-muted-foreground">{C.entranceGroupRule}</p>}
      {hasSkill && <p className="mt-3 text-caption text-muted-foreground">{C.entranceSkill}</p>}
      <p className="mt-2 text-caption text-muted-foreground">{C.entranceSource}: {src.sourceUrl ? <a href={src.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 dark:text-secondary">{src.sourceName ?? src.sourceUrl}</a> : src.sourceName}{src.year ? `, ${src.year}` : ''}</p>
    </Box>
  );
}

export default function CareerDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: c, isLoading, error, refetch } = useQuery<CareerDetailData>({ queryKey: ['career', slug], queryFn: () => api(`/careers/${slug}`) });
  const countries = useQuery<{ items: CountryOption[] }>({ queryKey: ['countries-all'], queryFn: () => api('/countries', { query: { pageSize: 100 } }) });
  const cmap = new Map((countries.data?.items ?? []).map((x) => [x.slug, x]));
  const m = c?.market ?? {};
  return (
    <PageContainer className="py-4 md:py-12">
      <Breadcrumb className="mb-3 md:mb-4" items={[{ label: t.nav.home, href: '/' }, { label: t.careers.title, href: '/careers' }, { label: c?.nameMn ?? '…' }]} />
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        {c && (
          <div className="grid gap-5">
            <div><h1 className="text-h1">{c.nameMn}</h1><p className="text-muted-foreground">{c.nameEn}</p></div>
            <Box aside={c.categoryId && <p className="text-h4 font-normal"><span className="text-muted-foreground">{C.field}:</span> {c.categoryId.nameMn}</p>}><p>{c.description ?? <NoData />}</p></Box>
            {c.jobZone && <Box title={C.education}><CheckList items={C.jobZones[Number(c.jobZone)] ? [C.jobZones[Number(c.jobZone)]] : []} /></Box>}
            {!!c.entranceExams?.length && <EntranceExams items={c.entranceExams} />}
            {c.entranceExamStatus === 'not_required' && <Box title={C.entranceTitle}><p className="text-body-sm" data-testid="exam-not-required">{C.entranceNotRequired}</p></Box>}
            {c.entranceExamStatus === 'unknown' && <Box title={C.entranceTitle}><p className="text-body-sm italic text-muted-foreground" data-testid="exam-unknown">{C.entranceUnknown}</p></Box>}
            <div className="grid gap-5 md:grid-cols-2">
              <Box title={C.skills}><Chips items={c.requiredSkillsDetail?.map((s) => s.nameMn)} /></Box>
              <Box title={C.subjects}><CheckList items={c.schoolSubjects?.map((s) => SUBJECT_LABEL[s] ?? s)} /></Box>
              {!!c.universityMajors?.length && <Box title={C.majors}><Chips items={c.universityMajors} /></Box>}
              <Box title={C.countries}>
                {c.recommendedCountries?.length ? <div className="flex flex-wrap gap-2">{c.recommendedCountries.map((s) => { const co = cmap.get(s); return co && <Button key={s} asChild variant="outline" size="sm"><Link href={`/countries/${s}`}><Flag code={co.code} size={16} />{co.nameMn}</Link></Button>; })}</div> : <NoData />}
                <p className="mt-2 text-caption text-muted-foreground">{t.result.countryHint}</p>
              </Box>
            </div>
            {(m.demand || m.growth || m.salary) && (
              <Box title={C.market}>
                <dl className="grid gap-3 sm:grid-cols-3">{([[C.demand, m.demand], [C.growth, m.growth], [C.salary, m.salary]] as const).filter(([, v]) => v).map(([l, v]) => <div key={l}><dt className="text-body-sm text-muted-foreground">{l}</dt><dd>{v}</dd></div>)}</dl>
                <Alert className="mt-4">{C.marketNote}</Alert>
              </Box>
            )}
            {(c.mongoliaOpportunity || c.globalOpportunity || c.automationImpact || !!c.pathways?.length) && (
              <div className="grid gap-5 md:grid-cols-2">
                {c.mongoliaOpportunity && <Box title={C.mongolia}><p>{c.mongoliaOpportunity}</p></Box>}
                {c.globalOpportunity && <Box title={C.global}><p>{c.globalOpportunity}</p></Box>}
                {c.automationImpact && <Box title={C.automation}><p>{c.automationImpact}</p></Box>}
                {!!c.pathways?.length && <Box title={C.pathways}><ul className="list-disc space-y-1 pl-5">{c.pathways.map((p) => <li key={p}>{p}</li>)}</ul></Box>}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-3"><Button asChild><Link href="/assessments/career">{t.home.ctaCareer}</Link></Button></div>
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
