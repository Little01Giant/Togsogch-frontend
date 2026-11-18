'use client';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { fmtDate, t } from '@/i18n';
import { Alert, Badge, Card, Progress } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';

const P = t.thinking;

interface Style { key: string; title: string; description: string }

/** «Сэтгэлгээний хэв маягийн тест»-ийн үр дүн (төлбөргүй, мэргэжил/улсын зөвлөмжид нөлөөлөхгүй). */
export function ThinkingResult({ r }: { r: { hybrid: boolean; leaders: Style[]; types: { key: string; title: string; count: number; percent: number }[]; disclaimer: string; completedAt?: string } }) {
  return (
    <div className="grid gap-5">
      <Card className="grid gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-2">{r.completedAt && <Badge variant="muted">{fmtDate(r.completedAt)}</Badge>}</div>
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary"><Brain className="size-6" aria-hidden /></span>
          <div className="min-w-0">
            <p className="text-caption text-muted-foreground">{r.hybrid ? P.hybridTitle : P.title}</p>
            <h1 className="text-h2 leading-snug" data-testid="thinking-title">{r.leaders.map((x) => x.title).join(' + ')}</h1>
          </div>
        </div>
        {r.hybrid && <p className="text-body-sm text-muted-foreground">{P.hybridNote}</p>}
        <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          {r.leaders.map((x) => <div key={x.key} className="rounded-lg bg-muted p-3"><p className="text-label">{x.title}</p><p className="mt-1 text-body-sm">{x.description}</p></div>)}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 text-h4">{P.breakdown}</h2>
        <div className="grid gap-2">
          {r.types.map((x) => (
            <div key={x.key} className="flex items-center gap-2">
              <span className="w-36 shrink-0 text-caption sm:w-52">{x.title}</span>
              <Progress value={x.percent} className="h-1.5 flex-1" />
              <span className="w-16 text-right text-caption">{x.count} {P.answers}</span>
            </div>
          ))}
        </div>
      </Card>
      <Alert hideIcon variant="warning" title={t.assessments.disclaimerTitle}><p className="text-body-sm">{r.disclaimer}</p></Alert>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/assessments/thinking">{P.retake}</Link></Button>
        <Button asChild><Link href="/assessments/career">{P.toCareer}</Link></Button>
      </div>
    </div>
  );
}
