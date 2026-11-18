'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger } from '@/components/ui/data-display';

const P = t.p4;
const tick = { fontSize: 11, fill: 'var(--muted-foreground)' };

export default function Analytics() {
  const [days, setDays] = useState('30');
  const q = useQuery<any>({ queryKey: ['analytics', days], queryFn: () => api('/admin/tools/analytics', { query: { days } }) });
  const d = q.data;
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{P.analytics}</h1>
      <Tabs value={days} onValueChange={setDays}><TabsList>{['14', '30', '90'].map((v) => <TabsTrigger key={v} value={v}>{v} {P.days}</TabsTrigger>)}</TabsList></Tabs>
      <StateBoundary isLoading={q.isLoading} error={q.error} onRetry={q.refetch}>
        {d && <>
          <Card className="p-5"><h2 className="mb-2 text-h4">{P.started} / {P.completedS}</h2>
            <div className="h-64" role="img" aria-label={`${P.started} / ${P.completedS}`}><ResponsiveContainer><LineChart data={d.series}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={tick} tickFormatter={(x) => x.slice(5)} /><YAxis allowDecimals={false} tick={tick} /><RTooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10 }} /><Legend />
              <Line type="monotone" dataKey="started" name={P.started} stroke="var(--chart-1)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="completed" name={P.completedS} stroke="var(--chart-2)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></Card>
          <Card className="p-5"><h2 className="mb-2 text-h4">{t.pay.revenue} (₮)</h2>
            <div className="h-52" role="img" aria-label={t.pay.revenue}><ResponsiveContainer><BarChart data={d.series}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={tick} tickFormatter={(x) => x.slice(5)} /><YAxis tick={tick} /><RTooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10 }} /><Bar dataKey="revenue" name={t.pay.revenue} fill="var(--chart-3)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5"><h2 className="mb-2 text-h4">{P.funnel}</h2>
              <Table><TableHeader><TableRow><TableHead>{t.admin.assessments}</TableHead><TableHead className="text-right">{P.started}</TableHead><TableHead className="text-right">{P.completedS}</TableHead><TableHead className="text-right">%</TableHead></TableRow></TableHeader>
                <TableBody>{Object.entries(d.funnel).map(([k, v]: any) => <TableRow key={k}><TableCell>{t.assessments[k as 'career']?.name ?? k}</TableCell><TableCell className="text-right">{v.started}</TableCell><TableCell className="text-right">{v.completed}</TableCell><TableCell className="text-right">{v.started ? Math.round((v.completed / v.started) * 100) : 0}</TableCell></TableRow>)}</TableBody></Table></Card>
            <Card className="p-5"><h2 className="mb-2 text-h4">{P.topCareers}</h2>
              {d.topCareers.length ? <Table><TableBody>{d.topCareers.map((c: any) => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell className="text-right">{c.count}</TableCell></TableRow>)}</TableBody></Table> : <p className="text-muted-foreground">{t.common.noData}</p>}</Card>
          </div>
        </>}
      </StateBoundary>
    </div>
  );
}
