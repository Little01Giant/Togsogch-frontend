'use client';
import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtDate, t } from '@/i18n';
import { useMe } from '@/lib/auth';
import { StateBoundary } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Input } from '@/components/ui/form-controls';
import { notify, Pagination } from '@/components/ui/misc';
import { SimpleSelect } from '@/components/ui/select';

interface AdminUser { _id: string; name: string; email: string; role: string; status: string; lastLoginAt?: string | null }

export default function AdminUsers() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [q, setQ] = useState(''); const [dq, setDq] = useState(''); const [page, setPage] = useState(1);
  useEffect(() => { const h = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(h); }, [q]);
  const query = { q: dq, page, pageSize: 20 };
  const { data, isLoading, error, refetch } = useQuery<{ items: AdminUser[]; total: number }>({ queryKey: ['admin-users', query], queryFn: () => api('/admin/manage/users', { query }), placeholderData: keepPreviousData });
  const m = useMutation({ mutationFn: ({ id, body }: { id: string; body: { role?: string; status?: string } }) => api(`/admin/manage/users/${id}`, { method: 'PATCH', body }), onSuccess: () => { notify({ color: 'teal', message: t.common.updated }); qc.invalidateQueries({ queryKey: ['admin-users'] }); }, onError: (e: Error) => notify({ color: 'red', message: e.message }) });
  const isSuper = me?.role === 'super_admin';
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{t.admin.users}</h1>
      <div className="relative w-72"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={t.common.search} aria-label={t.common.search} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch} isEmpty={!data?.items.length}>
        <Table><TableHeader><TableRow><TableHead>{t.common.name}</TableHead><TableHead>{t.auth.email}</TableHead><TableHead>{t.admin.role}</TableHead><TableHead>{t.admin.lastLogin}</TableHead><TableHead>{t.common.status}</TableHead></TableRow></TableHeader>
          <TableBody>{data?.items.map((u) => (
            <TableRow key={u._id}><TableCell>{u.name}</TableCell><TableCell>{u.email}</TableCell>
              <TableCell>{isSuper && u._id !== me?.id ? <SimpleSelect className="h-9 w-36" options={['user', 'admin', 'super_admin'].map((v) => ({ value: v, label: v }))} value={u.role} onValueChange={(role) => role && m.mutate({ id: u._id, body: { role } })} aria-label={t.admin.role} /> : <Badge>{u.role}</Badge>}</TableCell>
              <TableCell>{fmtDate(u.lastLoginAt) ?? '—'}</TableCell>
              <TableCell><div className="flex items-center gap-2"><Badge variant={u.status === 'blocked' ? 'destructive' : 'success'}>{u.status}</Badge>{isSuper && u._id !== me?.id && <Button size="sm" variant="ghost" onClick={() => m.mutate({ id: u._id, body: { status: u.status === 'blocked' ? 'active' : 'blocked' } })}>{u.status === 'blocked' ? t.admin.unblock : t.admin.block}</Button>}</div></TableCell></TableRow>
          ))}</TableBody></Table>
        <Pagination page={page} total={Math.ceil((data?.total ?? 0) / 20)} onChange={setPage} />
      </StateBoundary>
    </div>
  );
}
