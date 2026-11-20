'use client';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { fmtDate, t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Pagination } from '@/components/ui/misc';

export default function AdminAudit() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery<{ items: { _id: string; createdAt: string; actorEmail?: string; action: string; resource?: string; resourceId?: string }[]; total: number }>({ queryKey: ['admin-audit', page], queryFn: () => api('/admin/audit-logs', { query: { page, pageSize: 30 } }), placeholderData: keepPreviousData });
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{t.admin.audit}</h1>
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch} isEmpty={!data?.items.length}>
        <Table><TableHeader><TableRow><TableHead>Огноо</TableHead><TableHead>Админ</TableHead><TableHead>Үйлдэл</TableHead><TableHead>Нөөц</TableHead><TableHead>ID</TableHead></TableRow></TableHeader>
          <TableBody>{data?.items.map((l) => <TableRow key={l._id}><TableCell>{fmtDate(l.createdAt)}</TableCell><TableCell>{l.actorEmail}</TableCell><TableCell>{l.action}</TableCell><TableCell>{l.resource}</TableCell><TableCell><code className="text-caption">{l.resourceId}</code></TableCell></TableRow>)}</TableBody></Table>
        <Pagination page={page} total={Math.ceil((data?.total ?? 0) / 30)} onChange={setPage} />
      </StateBoundary>
    </div>
  );
}
