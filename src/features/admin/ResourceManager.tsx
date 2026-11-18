'use client';
import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { ConfirmDialog, StateBoundary } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Input } from '@/components/ui/form-controls';
import { notify, Pagination } from '@/components/ui/misc';
import { Hint, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/overlays';
import { SimpleSelect } from '@/components/ui/select';
import { ResourceConfig } from './config';
import { FieldForm, validate } from './FieldForm';

const SIZE = 15;

export function ResourceManager({ cfg }: { cfg: ResourceConfig }) {
  const qc = useQueryClient();
  const [q, setQ] = useState(''); const [dq, setDq] = useState(''); const [status, setStatus] = useState<string | undefined>(); const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null); const [errors, setErrors] = useState<Record<string, string>>({}); const [deleting, setDeleting] = useState<any | null>(null);
  useEffect(() => { const h = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(h); }, [q]);
  useEffect(() => { setPage(1); setQ(''); setStatus(undefined); setEditing(null); }, [cfg.key]);

  const query = { q: dq, status, page, pageSize: SIZE };
  const list = useQuery<{ items: any[]; total: number }>({ queryKey: ['admin', cfg.key, query], queryFn: () => api(`/admin/${cfg.key}`, { query }), placeholderData: keepPreviousData });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', cfg.key] });
  const fail = (e: any) => notify({ color: 'red', title: t.common.error, message: e.details?.length ? `${e.message} ${e.details.join('; ')}` : e.message });

  const save = useMutation({
    mutationFn: (d: any) => (d._id ? api(`/admin/${cfg.key}/${d._id}`, { method: 'PATCH', body: d }) : api(`/admin/${cfg.key}`, { method: 'POST', body: d })),
    onSuccess: (_r, d) => { notify({ color: 'teal', message: d._id ? t.common.updated : t.common.created }); setEditing(null); refresh(); qc.invalidateQueries({ queryKey: ['admin-ref'] }); }, onError: fail,
  });
  const toggle = useMutation({ mutationFn: ({ id, action }: any) => api(`/admin/${cfg.key}/${id}/${action}`, { method: 'POST' }), onSuccess: refresh, onError: fail });
  const del = useMutation({ mutationFn: (id: string) => api(`/admin/${cfg.key}/${id}`, { method: 'DELETE' }), onSuccess: () => { notify({ color: 'teal', message: t.common.deleted }); setDeleting(null); refresh(); }, onError: fail });

  const openEdit = async (row?: any) => {
    setErrors({});
    if (!row) return setEditing({ ...(cfg.defaults ?? {}), ...(cfg.hasStatus ? { status: 'draft' } : {}) });
    try { setEditing(await api(`/admin/${cfg.key}/${row._id}`)); } catch (e) { fail(e); }
  };
  const submit = () => { const e = validate(cfg.fields, editing); setErrors(e); if (Object.keys(e).length) { notify({ color: 'orange', message: t.validation.required }); return; } save.mutate(editing); };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-h1">{cfg.title}</h1><Button onClick={() => openEdit()}><Plus />{t.admin.newItem}</Button></div>
      <div className="flex flex-wrap gap-2">
        <div className="relative w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={t.common.search} aria-label={t.common.search} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {cfg.hasStatus && <SimpleSelect className="w-44" clearable placeholder={t.common.status} options={[{ value: 'published', label: t.common.published }, { value: 'draft', label: t.common.draft }]} value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} />}
      </div>
      <StateBoundary isLoading={list.isLoading} error={list.error} onRetry={list.refetch} isEmpty={list.data?.items.length === 0}>
        <Table>
          <TableHeader><TableRow>{cfg.columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}<TableHead className="text-right">{t.common.actions}</TableHead></TableRow></TableHeader>
          <TableBody>{list.data?.items.map((row) => (
            <TableRow key={row._id}>
              {cfg.columns.map((c) => <TableCell key={c.key}>{c.key === 'status' ? <Badge variant={row.status === 'published' ? 'success' : 'muted'}>{row.status === 'published' ? t.common.published : t.common.draft}</Badge> : c.render ? c.render(row) : row[c.key] ?? <span className="text-muted-foreground">—</span>}</TableCell>)}
              <TableCell><div className="flex items-center justify-end gap-1">
                {cfg.hasStatus && <Button size="sm" variant="soft" onClick={() => toggle.mutate({ id: row._id, action: row.status === 'published' ? 'unpublish' : 'publish' })}>{row.status === 'published' ? t.common.unpublish : t.common.publish}</Button>}
                <Hint label={t.common.edit}><Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)} aria-label={t.common.edit}><Pencil /></Button></Hint>
                <Hint label={t.common.delete}><Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleting(row)} aria-label={t.common.delete}><Trash2 /></Button></Hint>
              </div></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
        <Pagination page={page} total={Math.ceil((list.data?.total ?? 0) / SIZE)} onChange={setPage} />
      </StateBoundary>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" widthClass="w-[min(100vw,860px)] sm:max-w-none" onInteractOutside={(e) => e.preventDefault()}>
          <SheetHeader><SheetTitle>{editing?._id ? t.admin.editItem : t.admin.newItem}</SheetTitle><SheetDescription className="sr-only">{cfg.title}</SheetDescription></SheetHeader>
          {editing && <>
            {Object.keys(errors).length > 0 && <Alert variant="destructive">{t.validation.required}</Alert>}
            <FieldForm fields={cfg.fields} data={editing} onChange={setEditing} errors={errors} />
            <div className="sticky bottom-0 -mx-6 -mb-6 mt-2 flex justify-end gap-2 border-t bg-card px-6 py-3"><Button variant="outline" onClick={() => setEditing(null)}>{t.common.cancel}</Button><Button onClick={submit} loading={save.isPending}>{t.common.save}</Button></div>
          </>}
        </SheetContent>
      </Sheet>
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={t.common.delete} description={t.common.confirmDelete} loading={del.isPending} onConfirm={() => del.mutate(deleting._id)} />
    </div>
  );
}
