'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { fmtUsd, t } from '@/i18n';
import { useCompare } from '@/lib/compare';
import { EmptyState, Flag, NoData, StateBoundary } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Alert, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { UnlockButton } from '@/features/paywall';

const C = t.compare;
const U = t.universities;
interface CompareRank { rank?: number | null; rankText?: string | null; edition?: string | null; year?: number }
interface CompareUni {
  id: string; slug: string; name: string; city?: string | null; country?: { code?: string | null; nameMn?: string } | null;
  qsWorld?: CompareRank | null; qsAsia?: CompareRank | null; tuition?: { minUsd: number; maxUsd: number } | null;
  degreeLevels: string[]; scholarshipTypes: string[]; admissionTests?: string[];
}
const rank = (r?: CompareRank | null) => (r && (r.rank || r.rankText) ? <>#{r.rank ?? r.rankText}<span className="text-caption text-muted-foreground"> · {r.edition ?? r.year}</span></> : <NoData />);

function Inner() {
  const sp = useSearchParams();
  const c = useCompare();
  const ids = (sp.get('ids') ?? c.ids.join(',')).split(',').filter(Boolean);
  const res = useQuery<{ items: CompareUni[]; personal: { locked: boolean; insights: Record<string, { budgetFit: string; subjectFit: string }> | null } }>({ queryKey: ['compare', ids], queryFn: () => api('/universities/compare', { query: { ids } }), enabled: ids.length >= 2 });
  const data = res.data?.items;
  const personal = res.data?.personal;
  const rows: [string, (u: CompareUni) => React.ReactNode][] = [
    [C.row.country, (u) => <span className="flex items-center gap-1.5"><Flag code={u.country?.code} size={16} />{u.country?.nameMn}</span>], [C.row.city, (u) => u.city ?? <NoData />],
    [C.row.qsWorld, (u) => rank(u.qsWorld)], [C.row.qsAsia, (u) => rank(u.qsAsia)],
    [C.row.tuition, (u) => (u.tuition ? `${fmtUsd(u.tuition.minUsd)}${u.tuition.maxUsd !== u.tuition.minUsd ? ` – ${fmtUsd(u.tuition.maxUsd)}` : ''}` : <NoData />)],
    [C.row.degrees, (u) => u.degreeLevels.map((d) => U.labelsDegree[d]).join(', ') || <NoData />],
    [C.row.scholarship, (u) => (u.scholarshipTypes.length ? u.scholarshipTypes.map((s) => U.labelsScholarship[s]).join(', ') : <NoData />)],
    [U.admission, (u) => (u.admissionTests?.length ? u.admissionTests.map((a) => U.labelsAdmission[a] ?? a).join(', ') : <NoData />)],
  ];
  const personalRows: [string, (u: CompareUni) => React.ReactNode][] = personal && !personal.locked && personal.insights
    ? [[t.pay.budgetFit, (u) => t.pay[personal.insights![u.id].budgetFit as 'within'] ?? t.pay.unknown], [t.pay.subjectFit, (u) => t.pay[personal.insights![u.id].subjectFit as 'match'] ?? t.pay.unknown]] : [];

  return (
    <PageContainer className="py-8 md:py-12">
      <PageHeader title={C.title} actions={<Button asChild variant="outline"><Link href="/universities">{t.nav.universities}</Link></Button>} />
      {ids.length < 2 ? <EmptyState title={C.minTwo} /> : (
        <StateBoundary isLoading={res.isLoading} error={res.error} onRetry={res.refetch} isEmpty={!data?.length}>
          <Alert variant="info" className="mb-4">{C.note}</Alert>
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 border-accent/40 bg-gold-soft/40 p-4"><div><p className="font-semibold">{t.pay.cmpTitle}</p><p className="text-body-sm text-muted-foreground">{personal?.locked ? t.pay.cmpLocked : t.pay.cmpNote}</p></div>{personal?.locked && <UnlockButton productKey="premium_comparison" />}</Card>
          <Table>
            <TableHeader><TableRow><TableHead className="w-40" /> {data?.map((u) => <TableHead key={u.id} className="min-w-44 whitespace-normal py-3"><Link href={`/universities/${u.slug}`} className="text-body font-semibold text-foreground hover:underline">{u.name}</Link><div><Button variant="link" size="sm" className="text-destructive" onClick={() => c.remove(u.id)}>{U.compareRemove}</Button></div></TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {personalRows.map(([label, fn]) => <TableRow key={label} className="bg-gold-soft/40"><TableHead scope="row" className="text-foreground">{label}</TableHead>{data?.map((u) => <TableCell key={u.id}>{fn(u)}</TableCell>)}</TableRow>)}
              {rows.map(([label, fn]) => <TableRow key={label}><TableHead scope="row" className="text-foreground">{label}</TableHead>{data?.map((u) => <TableCell key={u.id}>{fn(u)}</TableCell>)}</TableRow>)}
            </TableBody>
          </Table>
        </StateBoundary>
      )}
    </PageContainer>
  );
}
export default function ComparePage() { return <Suspense><Inner /></Suspense>; }
