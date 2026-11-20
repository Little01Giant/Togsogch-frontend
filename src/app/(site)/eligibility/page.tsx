'use client';
import { useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { useDebounce } from '@/lib/hooks';
import { StateBoundary } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Input } from '@/components/ui/form-controls';
import { Field } from '@/components/ui/form';
import { Combobox } from '@/components/ui/select';
import { NumberInput } from '@/components/ui/misc';

const P = t.p4;
type BadgeVariant = ComponentProps<typeof Badge>['variant'];
const overallVariant: Record<string, BadgeVariant> = { satisfied: 'success', additional: 'warning', not_satisfied: 'destructive', insufficient: 'muted' };
const itemVariant: Record<string, BadgeVariant> = { satisfied: 'success', not_met: 'destructive', uncertain: 'warning' };
type Scores = Record<string, number | undefined>;

interface ProgramOption { id: string; name: string; level: string; university?: { name: string } | null }
interface EligibilityItem { kind: string; minScore?: number | null; optional?: boolean; note?: string; status: string; detail?: string }
interface EligibilityResult { program: { name: string; university?: { slug: string; name: string } | null }; overall: string; items: EligibilityItem[]; disclaimer: string }

export default function Eligibility() {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const [programId, setProgramId] = useState<string | undefined>();
  const [scores, setScores] = useState<Scores>({});
  const [docs, setDocs] = useState('');
  const programs = useQuery<ProgramOption[]>({ queryKey: ['programs', dq], queryFn: () => api('/programs/search', { query: { q: dq } }) });
  const check = useMutation({ mutationFn: () => api<EligibilityResult>('/eligibility/check', { method: 'POST', body: { programId, profile: { ...scores, documents: docs.split(',').map((s) => s.trim()).filter(Boolean) } } }) });
  const num = (k: string, label: string, step = 0.1) => <Field key={k} label={label}><NumberInput min={0} step={step} value={scores[k]} onValueChange={(v) => setScores((s) => ({ ...s, [k]: v }))} /></Field>;
  const r = check.data;

  return (
    <PageContainer size="narrow" className="py-8 md:py-12">
      <PageHeader mascot="think" title={P.eligTitle} description={P.eligSubtitle} />
      <div className="grid gap-5">
        <Card className="grid gap-3 p-5"><h2 className="text-h4">{P.pickProgram}</h2>
          <Combobox value={programId} onChange={setProgramId} onSearch={setQ} placeholder={P.searchProgram} searchPlaceholder={P.searchProgram} emptyText={P.noPrograms}
            options={(programs.data ?? []).map((p) => ({ value: p.id, label: `${p.name}${p.university ? ` — ${p.university.name}` : ''} (${t.universities.labelsDegree[p.level] ?? p.level})` }))} />
          {programs.data?.length === 0 && <p className="text-body-sm text-muted-foreground">{P.noPrograms}</p>}
        </Card>
        <Card className="grid gap-4 p-5"><h2 className="text-h4">{P.yourScores}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{num('gpa', P.gpa)}{num('ielts', 'IELTS', 0.5)}{num('toefl', 'TOEFL', 1)}{num('sat', 'SAT', 10)}{num('act', 'ACT', 1)}{num('gre', 'GRE', 1)}{num('gmat', 'GMAT', 10)}</div>
          <Field label={P.docs}><Input placeholder="Portfolio, Motivation Letter…" value={docs} onChange={(e) => setDocs(e.target.value)} /></Field>
          <p className="text-caption text-muted-foreground">{P.noScoresStored}</p>
          <div><Button disabled={!programId} loading={check.isPending} onClick={() => check.mutate()}>{P.check}</Button></div>
        </Card>
        <StateBoundary error={check.error} onRetry={() => check.mutate()}>
          {r && (
            <Card className="grid gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{r.program.name}</p>{r.program.university && <Link href={`/universities/${r.program.university.slug}`} className="text-body-sm text-primary hover:underline dark:text-secondary">{r.program.university.name}</Link>}</div>
                <Badge variant={overallVariant[r.overall]} className="px-3 py-1 text-body-sm">{P.overall[r.overall]}</Badge></div>
              {r.items.length > 0 && (
                <Table><TableHeader><TableRow><TableHead>{P.requirements}</TableHead><TableHead>{t.common.status}</TableHead><TableHead /></TableRow></TableHeader>
                  <TableBody>{r.items.map((i, k) => (
                    <TableRow key={k}><TableCell><p className="font-medium">{i.kind}{i.minScore != null ? ` ≥ ${i.minScore}` : ''}{i.optional ? ` (${P.optional})` : ''}</p>{i.note && <p className="text-caption text-muted-foreground">{i.note}</p>}</TableCell>
                      <TableCell><Badge variant={itemVariant[i.status]}>{P.item[i.status]}</Badge></TableCell><TableCell className="whitespace-normal text-body-sm">{i.detail}</TableCell></TableRow>
                  ))}</TableBody></Table>
              )}
              <Alert variant="warning">{r.disclaimer}</Alert>
            </Card>
          )}
        </StateBoundary>
      </div>
    </PageContainer>
  );
}
