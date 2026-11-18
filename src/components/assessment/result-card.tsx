import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { t } from '@/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display';
import { MatchRing } from './career-match-card';

export interface ResultSummary { title: string; score?: number; match?: number; strengths?: { name: string; score?: number }[]; development?: { name: string; score?: number }[]; actions?: { text: string; href?: string; label?: string }[]; note?: string }

/** Тестийн үр дүнгийн хураангуй: оноо/тохирол, давуу тал, хөгжүүлэх тал, зөвлөсөн үйлдэл */
export function ResultCard({ r }: { r: ResultSummary }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        {typeof (r.match ?? r.score) === 'number' && <MatchRing value={(r.match ?? r.score)!} size={64} />}
        <CardTitle className="text-h3">{r.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <section><h4 className="mb-2 flex items-center gap-1.5 text-label"><Sparkles className="size-4 text-secondary-foreground" aria-hidden />{t.result.strengths}</h4>
          <div className="flex flex-wrap gap-1.5">{r.strengths?.length ? r.strengths.map((s) => <Badge key={s.name} variant="success">{s.name}{s.score != null ? ` · ${s.score}` : ''}</Badge>) : <span className="text-body-sm text-muted-foreground">{t.result.noResults}</span>}</div></section>
        <section><h4 className="mb-2 flex items-center gap-1.5 text-label"><TrendingUp className="size-4" aria-hidden />{t.result.improvements}</h4>
          <div className="flex flex-wrap gap-1.5">{r.development?.length ? r.development.map((s) => <Badge key={s.name} variant="warning">{s.name}{s.score != null ? ` · ${s.score}` : ''}</Badge>) : <span className="text-body-sm text-muted-foreground">{t.result.noResults}</span>}</div></section>
        {r.actions && r.actions.length > 0 && (
          <section className="sm:col-span-2"><h4 className="mb-2 text-label">Зөвлөсөн дараагийн алхам</h4>
            <ul className="space-y-1.5">{r.actions.map((a, i) => <li key={i} className="flex items-start gap-2 text-body-sm"><ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground" aria-hidden /><span>{a.text} {a.href && <Link href={a.href} className="font-medium text-primary underline underline-offset-2 dark:text-secondary">{a.label ?? '→'}</Link>}</span></li>)}</ul></section>
        )}
        {r.note && <p className="text-caption text-muted-foreground sm:col-span-2">{r.note}</p>}
      </CardContent>
    </Card>
  );
}
