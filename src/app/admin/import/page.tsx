'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { IMPORT_TEMPLATE, parseCsv } from '@/lib/csv';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Input } from '@/components/ui/form-controls';
import { Field } from '@/components/ui/form';
import { notify } from '@/components/ui/misc';

const P = t.p4;
const variant: Record<string, any> = { error: 'destructive', create: 'success', created: 'success', update: 'info', updated: 'info' };

export default function ImportPage() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const run = useMutation({
    mutationFn: (dryRun: boolean) => api<any>('/admin/tools/import/universities', { method: 'POST', body: { rows, dryRun } }),
    onSuccess: (r) => { if (!r.dryRun) notify({ color: 'teal', message: `${P.created}: ${r.created}, ${P.updatedN}: ${r.updated}` }); },
    onError: (e: any) => notify({ color: 'red', message: e.message }),
  });
  const r = run.data;
  const onFile = async (f: File | undefined) => { run.reset(); setRows([]); if (f) setRows(parseCsv(await f.text())); };
  const download = () => {
    const url = URL.createObjectURL(new Blob(['﻿' + IMPORT_TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'universities-template.csv'; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{P.importTitle}</h1>
      <Alert variant="info">{P.importHint}</Alert>
      <div className="flex flex-wrap items-end gap-3">
        <Field label={P.pickFile} className="w-72"><Input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} className="h-auto py-1.5" /></Field>
        <Button variant="ghost" onClick={download}><Download />{P.template}</Button>
      </div>
      {rows.length > 0 && <p className="text-body-sm">{rows.length} {P.rowsCount}</p>}
      <div className="flex gap-2">
        <Button variant="outline" disabled={!rows.length} loading={run.isPending && run.variables === true} onClick={() => run.mutate(true)}>{P.dryRun}</Button>
        <Button disabled={!rows.length || !r?.dryRun || r.failed === rows.length} loading={run.isPending && run.variables === false} onClick={() => run.mutate(false)}><Upload />{P.doImport}</Button>
      </div>
      {r && (
        <Card className="grid gap-4 p-5">
          <div className="grid gap-3 sm:grid-cols-4"><StatCard label={P.created} value={r.created} /><StatCard label={P.updatedN} value={r.updated} /><StatCard label={P.failed} value={r.failed} /><div className="flex items-center"><Badge variant={r.dryRun ? 'warning' : 'success'}>{r.dryRun ? 'dry-run' : 'imported'}</Badge></div></div>
          <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>{t.common.name}</TableHead><TableHead>{t.common.status}</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{r.report.map((x: any) => <TableRow key={x.row}><TableCell>{x.row}</TableCell><TableCell>{x.name ?? '—'}</TableCell><TableCell><Badge variant={variant[x.status]}>{x.status}</Badge></TableCell><TableCell>{x.errors?.map((e: string) => <p key={e} className="text-caption text-destructive">{e}</p>)}</TableCell></TableRow>)}</TableBody></Table>
        </Card>
      )}
    </div>
  );
}
