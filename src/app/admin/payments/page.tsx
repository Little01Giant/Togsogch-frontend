'use client';
import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { StatCard } from '@/components/dashboard/stat-card';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display';
import { Input } from '@/components/ui/form-controls';
import { Pagination } from '@/components/ui/misc';
import { SimpleSelect } from '@/components/ui/select';

const PAY = t.pay;
const variant: Record<string, any> = { paid: 'success', pending: 'warning', failed: 'destructive', expired: 'muted', cancelled: 'muted' };

export default function AdminPayments() {
  const [q, setQ] = useState(''); const [dq, setDq] = useState(''); const [status, setStatus] = useState<string | undefined>(); const [page, setPage] = useState(1);
  useEffect(() => { const h = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(h); }, [q]);
  const stats = useQuery<any>({ queryKey: ['billing-stats'], queryFn: () => api('/admin/billing/stats') });
  const query = { q: dq, status, page, pageSize: 20 };
  const list = useQuery<{ items: any[]; total: number }>({ queryKey: ['billing-payments', query], queryFn: () => api('/admin/billing/payments', { query }), placeholderData: keepPreviousData });
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{PAY.adminPayments}</h1>
      <StateBoundary isLoading={stats.isLoading} error={stats.error} onRetry={stats.refetch}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={PAY.revenue} value={`${fmtNumber(stats.data?.revenueMnt ?? 0)} ₮`} />
          {Object.entries(stats.data?.byStatus ?? {}).map(([s, n]) => <StatCard key={s} label={PAY.statuses[s] ?? s} value={n as number} />)}
        </div>
        {Object.keys(stats.data?.byProduct ?? {}).length > 0 && <div className="flex flex-wrap gap-2">{Object.entries(stats.data.byProduct).map(([k, v]: any) => <Badge key={k} className="px-3 py-1 text-body-sm">{PAY.products[k] ?? k}: {v.paid} · {fmtNumber(v.revenue)} ₮</Badge>)}</div>}
      </StateBoundary>
      <div className="flex flex-wrap gap-2">
        <div className="relative w-72"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" placeholder={`${t.common.search} (${PAY.invoice})`} aria-label={t.common.search} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <SimpleSelect className="w-44" clearable placeholder={t.common.status} options={Object.entries(PAY.statuses).map(([value, label]) => ({ value, label }))} value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} />
      </div>
      <StateBoundary isLoading={list.isLoading} error={list.error} onRetry={list.refetch} isEmpty={!list.data?.items.length}>
        <Table><TableHeader><TableRow><TableHead>Огноо</TableHead><TableHead>{t.admin.users}</TableHead><TableHead>{PAY.product}</TableHead><TableHead>{PAY.amount}</TableHead><TableHead>{t.common.status}</TableHead><TableHead>{PAY.invoice}</TableHead><TableHead>QPay ID</TableHead><TableHead>{PAY.provider}</TableHead></TableRow></TableHeader>
          <TableBody>{list.data?.items.map((p) => (
            <TableRow key={p.id}><TableCell>{new Date(p.createdAt).toLocaleString('sv-SE', { timeZone: 'Asia/Ulaanbaatar' }).slice(0, 16)}</TableCell><TableCell>{p.user?.email ?? '—'}</TableCell><TableCell>{PAY.products[p.productKey] ?? p.productKey}</TableCell><TableCell>{fmtNumber(p.amount)} ₮</TableCell>
              <TableCell><Badge variant={variant[p.status]}>{PAY.statuses[p.status]}</Badge></TableCell><TableCell><code className="text-caption">{p.senderInvoiceNo}</code></TableCell><TableCell><code className="text-caption">{p.qpayPaymentId ?? p.qpayInvoiceId ?? '—'}</code></TableCell><TableCell>{p.provider}</TableCell></TableRow>
          ))}</TableBody></Table>
        <Pagination page={page} total={Math.ceil((list.data?.total ?? 0) / 20)} onChange={setPage} />
      </StateBoundary>
    </div>
  );
}
