'use client';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { fmtDate, t } from '@/i18n';
import { Alert, Badge, Card, Progress } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';

const P = t.persona;

interface PersonaType { key: string; title: string; description: string; superpower: string; weakness: string }

/** «Хөгжилтэй зан төлөвийн тест»-ийн үр дүн. Зугаа цэнгээний тест тул төлбөрийн түгжээгүй. */
export function PersonaResult({ r }: { r: { primary: PersonaType; tied?: PersonaType[]; types: { key: string; title: string; count: number; percent: number }[]; disclaimer: string; completedAt?: string } }) {
  return (
    <div className="grid gap-5">
      <Card className="grid gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Badge variant="muted">{P.funTag}</Badge>{r.completedAt && <span className="text-caption text-muted-foreground">{fmtDate(r.completedAt)}</span>}</div>
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary"><Sparkles className="size-6" aria-hidden /></span>
          <div className="min-w-0">
            <p className="text-caption text-muted-foreground">{P.title}</p>
            <h1 className="text-h2 leading-snug" data-testid="persona-title">{r.primary.title}</h1>
          </div>
        </div>
        <p className="text-body">{r.primary.description}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-success/10 p-3"><p className="text-label">{P.superpower}</p><p className="mt-1 text-body-sm">{r.primary.superpower}</p></div>
          <div className="rounded-lg bg-warning/10 p-3"><p className="text-label">{P.weakness}</p><p className="mt-1 text-body-sm">{r.primary.weakness}</p></div>
        </div>
      </Card>
      {!!r.tied?.length && (
        <Alert variant="info" title={P.tied}>
          <ul className="mt-1 space-y-0.5 text-body-sm">{r.tied.map((x) => <li key={x.key}>• {x.title}</li>)}</ul>
        </Alert>
      )}
      <Card className="p-5">
        <h2 className="mb-3 text-h4">{P.breakdown}</h2>
        <div className="grid gap-2">
          {r.types.map((x) => (
            <div key={x.key} className="flex items-center gap-2">
              <span className="w-40 shrink-0 text-caption sm:w-56">{x.title}</span>
              <Progress value={x.percent} className="h-1.5 flex-1" />
              <span className="w-16 text-right text-caption">{x.count} {P.answers}</span>
            </div>
          ))}
        </div>
      </Card>
      <Alert hideIcon variant="warning" title={t.assessments.disclaimerTitle}><p className="text-body-sm">{r.disclaimer}</p><p className="mt-1 text-caption opacity-80">{P.funNote}</p></Alert>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/assessments/persona">{P.retake}</Link></Button>
        <Button asChild><Link href="/assessments/career">{P.toCareer}</Link></Button>
      </div>
    </div>
  );
}
