'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/data-display';

export default function AdminAssessments() {
  const { data, isLoading, error, refetch } = useQuery<{ key: string; title: string; questionCount: number; draftVersion: number; status: string }[]>({ queryKey: ['admin-assessments'], queryFn: () => api('/admin/assessments') });
  return (
    <div className="grid gap-4">
      <h1 className="text-h1">{t.admin.assessments}</h1>
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        <div className="grid gap-3">{data?.map((a) => (
          <Card key={a.key} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div><p className="font-semibold">{a.title}</p><p className="text-body-sm text-muted-foreground">{a.questionCount} {t.assessments.questions} · {t.admin.draftVersion}: v{a.draftVersion}</p></div>
            <div className="flex items-center gap-2"><Badge variant={a.status === 'published' ? 'success' : 'muted'}>{a.status === 'published' ? t.common.published : t.common.draft}</Badge><Button asChild size="sm"><Link href={`/admin/assessments/${a.key}`}>{t.common.edit}</Link></Button></div>
          </Card>
        ))}</div>
      </StateBoundary>
    </div>
  );
}
