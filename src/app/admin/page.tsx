'use client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Briefcase, CheckCircle2, GraduationCap, Globe2, PlayCircle, Users, UserCheck, Wallet, Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { StatCard } from '@/components/dashboard/stat-card';

export default function AdminOverview() {
  const { data, isLoading, error, refetch } = useQuery<any>({ queryKey: ['admin-stats'], queryFn: () => api('/admin/stats/overview') });
  const A = t.admin;
  const cards = data ? [
    [A.totalUsers, data.totalUsers, Users], [A.dau, data.dailyActiveUsers, UserCheck], [A.completed, data.assessmentsCompleted, CheckCircle2], [A.started, data.assessmentsStarted, PlayCircle],
    [A.countriesCount, data.countries, Globe2], [A.universitiesCount, data.universities, GraduationCap], [A.programsCount, data.programs, BookOpen], [A.careersCount, data.careers, Briefcase],
  ] as const : [];
  return (
    <div className="grid gap-5">
      <h1 className="text-h1">{A.overview}</h1>
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([l, v, Icon]) => <StatCard key={l} label={l} value={v} icon={Icon} />)}</div>
        {data && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label={t.pay.revenue} value={`${fmtNumber(data.payments?.revenueMnt ?? 0)} ₮`} icon={Wallet} /><StatCard label={t.pay.paidCount} value={data.payments?.byStatus?.paid ?? 0} icon={Receipt} /></div>}
      </StateBoundary>
    </div>
  );
}
