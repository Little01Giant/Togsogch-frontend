'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Brain, Briefcase, GraduationCap, Languages, ListChecks, MapPin, Sparkles, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { t } from '@/i18n';
import { CardSkeleton, StateBoundary } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { Badge, Card } from '@/components/ui/data-display';

/** Тест бүрийн дүрс (зөвхөн харагдац). Тодорхойгүй түлхүүр → ерөнхий дүрс. */
const ICONS: Record<string, LucideIcon> = { career: Briefcase, city: MapPin, language: Languages, masters: GraduationCap, persona: Sparkles, thinking: Brain };

interface AssessmentSummary { key: string; title: string; subtitle: string; available: boolean; freeResult?: boolean; questionCount?: number }

function AssessmentCard({ a }: { a: AssessmentSummary }) {
  const Icon = ICONS[a.key] ?? ListChecks;
  const body = (
    <Card interactive={a.available} className={cn('flex h-full flex-col gap-3 p-4 sm:p-6', !a.available && 'opacity-70')}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary"><Icon className="size-4" aria-hidden /></span>
        <h2 className="min-w-0 flex-1 text-h4 leading-snug">{t.assessments.names[a.key]?.title ?? a.title}</h2>
        {a.freeResult && <Badge variant="success" className="shrink-0" data-testid="price-tag">{t.assessments.freeTag}</Badge>}
      </div>
      <p className="text-body-sm text-muted-foreground">{t.assessments.names[a.key]?.subtitle ?? a.subtitle}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
        {a.available
          ? <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground"><ListChecks className="size-4" aria-hidden />{a.questionCount} {t.assessments.questions}</span>
          : <Badge variant="muted">{t.assessments.comingSoon}</Badge>}
        {a.available && <span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary dark:text-secondary">{t.assessments.start}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>}
      </div>
    </Card>
  );
  return a.available
    ? <Link href={`/assessments/${a.key}`} className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{body}</Link>
    : body;
}

export default function AssessmentsPage() {
  const { data, isLoading, error, refetch } = useQuery<AssessmentSummary[]>({ queryKey: ['assessments'], queryFn: () => api('/assessments') });
  const skeleton = <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  return (
    <PageContainer className="py-6 md:py-12">
      <h1 className="sr-only md:hidden">{t.assessments.title}</h1>
      <PageHeader className="hidden md:flex" mascot="happy" title={t.assessments.title} description={t.assessments.subtitle} />
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch} skeleton={skeleton}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((a) => <li key={a.key} className="min-w-0"><AssessmentCard a={a} /></li>)}
        </ul>
      </StateBoundary>
    </PageContainer>
  );
}
