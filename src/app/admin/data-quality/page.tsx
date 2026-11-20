'use client';
import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { fmtDate, t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger } from '@/components/ui/data-display';
import { notify, Pagination } from '@/components/ui/misc';

const P = t.p4;
const RES = [['universities', t.admin.universities], ['countries', t.admin.countries], ['programs', t.admin.programs], ['careers', t.admin.careers]];

interface StaleItem { id: string; name: string; status: string; verifiedAt?: string | null; sourceUrl?: string | null }

export default function DataQuality() {
  const qc = useQueryClient();
  const [resource, setResource] = useState('universities'); const [page, setPage] = useState(1);
  const q = useQuery<{ items: StaleItem[]; total: number; months: number }>({ queryKey: ['stale', resource, page], queryFn: () => api('/admin/tools/stale', { query: { resource, page, pageSize: 20 } }), placeholderData: keepPreviousData });
  const verify = useMutation({
    mutationFn: (id: string) => api(`/admin/${resource}/${id}/verify`, { method: 'POST' }),
    onSuccess: () => { notify({ color: 'teal', message: t.common.updated }); qc.invalidateQueries({ queryKey: ['stale'] }); },
    onError: (e: Error) => notify({ color: 'red', message: e.message }),
  });
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{P.dataQuality}</h1>
      <Alert variant="info">{P.dqHint}</Alert>
      <Tabs value={resource} onValueChange={(v) => { setResource(v); setPage(1); }}><TabsList>{RES.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList></Tabs>
      <StateBoundary isLoading={q.isLoading} error={q.error} onRetry={q.refetch} isEmpty={!q.data?.items.length} emptyTitle="✓">
        <p className="text-body-sm text-muted-foreground">{q.data?.total} · {q.data?.months} {P.monthsShort}+</p>
        <Table><TableHeader><TableRow><TableHead>{t.common.name}</TableHead><TableHead>{t.common.status}</TableHead><TableHead>{P.verifiedAt}</TableHead><TableHead>{t.source.label}</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{q.data?.items.map((x) => (
            <TableRow key={x.id}><TableCell>{x.name}</TableCell><TableCell><Badge variant={x.status === 'published' ? 'success' : 'muted'}>{x.status === 'published' ? t.common.published : t.common.draft}</Badge></TableCell>
              <TableCell>{fmtDate(x.verifiedAt) ?? P.never}</TableCell><TableCell>{x.sourceUrl ? <a href={x.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline dark:text-secondary">{t.source.label}</a> : <span className="text-muted-foreground">{t.common.noData}</span>}</TableCell>
              <TableCell><Button size="sm" loading={verify.isPending && verify.variables === x.id} disabled={!x.sourceUrl} title={!x.sourceUrl ? P.dqHint : undefined} onClick={() => verify.mutate(x.id)}>{P.verify}</Button></TableCell></TableRow>
          ))}</TableBody></Table>
        <Pagination page={page} total={Math.ceil((q.data?.total ?? 0) / 20)} onChange={setPage} />
      </StateBoundary>
    </div>
  );
}
