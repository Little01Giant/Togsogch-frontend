'use client';
import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { useMe } from '@/lib/auth';
import { ErrorState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Card } from '@/components/ui/data-display';

const P = t.p4;

interface AiExplanation { generatedBy: 'ai' | 'template'; text: string; facts: string[]; sources: { label: string; sourceUrl?: string; status?: string }[]; note: string }

/** AI/автомат тайлбар. Үүсгэсэн текстийг баталгаатай өгөгдлөөс (эх сурвалжтай) тусад нь харуулна. */
export function AiExplain({ kind, id }: { kind: 'university' | 'result'; id: string }) {
  const { data: me } = useMe();
  const m = useMutation({ mutationFn: () => api<AiExplanation>('/ai/explain', { method: 'POST', body: { kind, id } }) });
  const r = m.data;
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3"><Button variant="outline" loading={m.isPending} disabled={!me} onClick={() => m.mutate()}>{!m.isPending && <Sparkles />}{P.aiButton}</Button>{!me && <span className="text-caption text-muted-foreground">{P.aiLoginRequired}</span>}</div>
      {m.error && <ErrorState error={m.error} onRetry={() => m.mutate()} />}
      {r && (
        <Card className="bg-muted/40 p-4">
          <div className="mb-2 flex items-center gap-2"><p className="text-h4">{P.aiTitle}</p><Badge variant={r.generatedBy === 'ai' ? 'info' : 'muted'}>{r.generatedBy === 'ai' ? P.aiAi : P.aiTemplate}</Badge></div>
          <p className="whitespace-pre-line text-body-sm">{r.text}</p>
          <p className="mb-1 mt-4 text-label">{P.aiFacts}</p>
          <ul className="list-disc space-y-0.5 pl-5 text-caption text-muted-foreground">{r.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
          {r.sources.length > 0 && <><p className="mb-1 mt-3 text-label">{P.aiSources}</p><ul className="space-y-0.5 text-caption">{r.sources.map((s, i) => <li key={i}>{s.sourceUrl ? <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline dark:text-secondary">{s.label}</a> : s.label} — {s.status}</li>)}</ul></>}
          <Alert className="mt-3 p-3 text-caption">{r.note}</Alert>
        </Card>
      )}
    </div>
  );
}
