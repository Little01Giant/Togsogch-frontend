'use client';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { fmtDate, t } from '@/i18n';
import { Alert, Badge, Card, Progress } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';

const A = t.archetype;

/** Зугаа цэнгээний «дүр/төрөл» тестүүдийн түлхүүрүүд (backend-ийн archetype-tests-тэй ижил). */
export const ARCHETYPE_KEYS = ['money', 'stress', 'strength', 'hunter', 'halloween'];

interface ArchetypeType { key: string; title: string; description: string; tips: string[] }
export interface ArchetypeResultData {
  testKey: string; testTitle: string; primary: ArchetypeType; tied?: ArchetypeType[]; tipsTitle: string; disclaimer: string; completedAt?: string;
  types: { key: string; title: string; count: number; percent: number }[];
}

/** Тестээс хамаарсан «дараагийн алхам» товч (платформын бодит боломж руу). Тодорхойгүй бол тестүүдийн жагсаалт. */
const NEXT: Record<string, { href: string; label: string }> = {
  strength: { href: '/assessments/career', label: A.next.career },
};

/** Зугаа цэнгээний «дүр/төрөл» тестүүдийн (мөнгөний зан төлөв, стресс, хүч чадлын зүйрлэл, чөтгөрийн ангууч, Halloween) нэгдсэн үр дүн. Төлбөрийн түгжээгүй. */
export function ArchetypeResult({ r }: { r: ArchetypeResultData }) {
  const next = NEXT[r.testKey] ?? { href: '/assessments', label: A.next.other };
  return (
    <div className="grid gap-5">
      <Card className="grid gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Badge variant="muted">{A.funTag}</Badge>{r.completedAt && <span className="text-caption text-muted-foreground">{fmtDate(r.completedAt)}</span>}</div>
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary"><Sparkles className="size-6" aria-hidden /></span>
          <div className="min-w-0">
            <p className="text-caption text-muted-foreground">{r.testTitle}</p>
            <h1 className="text-h2 leading-snug" data-testid="archetype-title">{r.primary.title}</h1>
          </div>
        </div>
        <p className="text-body">{r.primary.description}</p>
        <div className="rounded-lg bg-accent/10 p-3">
          <p className="text-label">{r.tipsTitle}</p>
          <ul className="mt-1.5 grid gap-1.5 text-body-sm">{r.primary.tips.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden /><span className="min-w-0">{x}</span></li>)}</ul>
        </div>
      </Card>
      {!!r.tied?.length && (
        <Alert variant="info" title={A.tied}>
          <ul className="mt-1 space-y-0.5 text-body-sm">{r.tied.map((x) => <li key={x.key}>• {x.title}</li>)}</ul>
        </Alert>
      )}
      <Card className="p-5">
        <h2 className="mb-3 text-h4">{A.breakdown}</h2>
        <div className="grid gap-2">
          {r.types.map((x) => (
            <div key={x.key} className="flex items-center gap-2">
              <span className="w-40 shrink-0 text-caption sm:w-56">{x.title}</span>
              <Progress value={x.percent} className="h-1.5 flex-1" />
              <span className="w-16 text-right text-caption">{x.count} {A.answers}</span>
            </div>
          ))}
        </div>
      </Card>
      <Alert hideIcon variant="warning" title={t.assessments.disclaimerTitle}><p className="text-body-sm">{r.disclaimer}</p><p className="mt-1 text-caption opacity-80">{A.funNote}</p></Alert>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href={`/assessments/${r.testKey}`}>{A.retake}</Link></Button>
        <Button asChild><Link href={next.href}>{next.label}</Link></Button>
      </div>
    </div>
  );
}
