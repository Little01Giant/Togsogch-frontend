'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { StateBoundary } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Alert, Card } from '@/components/ui/data-display';
import { Checkbox, Input, Label, Textarea } from '@/components/ui/form-controls';
import { Field } from '@/components/ui/form';
import { DatePicker, NumberInput, notify } from '@/components/ui/misc';

const P = t.p4;

interface FutureSettings { year?: number | null; published: boolean; weights: Record<string, number>; sources: { name: string; url: string }[]; notes?: string }
interface RateSettings { usdToMnt?: number; date: string; source: string; sourceUrl: string }

function Methodology() {
  const qc = useQueryClient();
  const q = useQuery<FutureSettings>({ queryKey: ['set-future'], queryFn: () => api('/admin/tools/settings/future-methodology') });
  const [s, setS] = useState<FutureSettings | null>(null);
  useEffect(() => { if (q.data) setS(JSON.parse(JSON.stringify(q.data))); }, [q.data]);
  const save = useMutation({
    mutationFn: () => api('/admin/tools/settings/future-methodology', { method: 'PUT', body: s }),
    onSuccess: () => { notify({ color: 'teal', message: t.common.saved }); qc.invalidateQueries({ queryKey: ['set-future'] }); qc.invalidateQueries({ queryKey: ['future'] }); },
    onError: (e: Error) => notify({ color: 'red', message: e.message }),
  });
  const total = s ? Object.values(s.weights).reduce((a, b) => a + b, 0) : 0;
  return (
    <StateBoundary isLoading={q.isLoading || !s} error={q.error} onRetry={q.refetch}>
      {s && (
        <Card className="grid gap-4 p-5">
          <h2 className="text-h3">{P.futureAdmin}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={P.researchYear}><NumberInput value={s.year ?? undefined} onValueChange={(v) => setS({ ...s, year: v ?? null })} /></Field>
            <div className="flex items-center gap-2.5 pt-7"><Checkbox id="pub" checked={s.published} onCheckedChange={(c) => setS({ ...s, published: !!c })} /><Label htmlFor="pub" className="cursor-pointer font-normal">{P.publishRank}</Label></div>
          </div>
          <p className="text-label">{P.weights} <span className="text-caption font-normal text-muted-foreground">(Σ = {total.toFixed(2)}; автоматаар нормчилогдоно)</span></p>
          <div className="grid gap-3 sm:grid-cols-2">{Object.keys(s.weights).map((k) => <Field key={k} label={P.criteria[k]}><NumberInput min={0} max={1} step={0.05} value={s.weights[k]} onValueChange={(v) => setS({ ...s, weights: { ...s.weights, [k]: v ?? 0 } })} /></Field>)}</div>
          <p className="text-label">{P.sources}</p>
          {s.sources.map((x, i) => (
            <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Field label={P.sourceName}><Input value={x.name} onChange={(e) => setS({ ...s, sources: s.sources.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) })} /></Field>
              <Field label="URL"><Input value={x.url} onChange={(e) => setS({ ...s, sources: s.sources.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)) })} /></Field>
              <Button variant="ghost" className="text-destructive" onClick={() => setS({ ...s, sources: s.sources.filter((_, j) => j !== i) })}>{t.common.delete}</Button>
            </div>
          ))}
          <div><Button variant="outline" size="sm" onClick={() => setS({ ...s, sources: [...s.sources, { name: '', url: '' }] })}>+ {P.addSource}</Button></div>
          <Field label={P.notes}><Textarea rows={2} value={s.notes ?? ''} onChange={(e) => setS({ ...s, notes: e.target.value })} /></Field>
          <Alert variant="info">Мэргэжил бүрийн шалгуурын оноог Мэргэжлүүд → засах → «Эрэлттэй 25 мэргэжил» хэсэгт эх сурвалжтай нь оруулна. Бүх 7 шалгуурын оноотой мэргэжил л эрэмбэд орно.</Alert>
          <div><Button loading={save.isPending} onClick={() => save.mutate()}>{t.common.save}</Button></div>
        </Card>
      )}
    </StateBoundary>
  );
}

function Rate() {
  const qc = useQueryClient();
  const q = useQuery<Partial<RateSettings>>({ queryKey: ['set-rate'], queryFn: () => api('/admin/tools/settings/exchange-rate') });
  const [s, setS] = useState<RateSettings>({ usdToMnt: undefined, date: '', source: '', sourceUrl: '' });
  useEffect(() => { if (q.data) setS({ usdToMnt: q.data.usdToMnt ?? undefined, date: q.data.date ?? '', source: q.data.source ?? '', sourceUrl: q.data.sourceUrl ?? '' }); }, [q.data]);
  const save = useMutation({
    mutationFn: () => api('/admin/tools/settings/exchange-rate', { method: 'PUT', body: { ...s, usdToMnt: Number(s.usdToMnt) } }),
    onSuccess: () => { notify({ color: 'teal', message: t.common.saved }); qc.invalidateQueries({ queryKey: ['rate'] }); },
    onError: (e: Error) => notify({ color: 'red', message: e.message }),
  });
  return (
    <Card className="grid gap-4 p-5">
      <h2 className="text-h3">{P.rateAdmin}</h2><p className="text-body-sm text-muted-foreground">{P.rateHint}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={P.usdToMnt}><NumberInput min={0} value={s.usdToMnt} onValueChange={(v) => setS({ ...s, usdToMnt: v })} /></Field>
        <Field label={P.rateDate}><DatePicker value={s.date} onChange={(v) => setS({ ...s, date: v ?? '' })} /></Field>
        <Field label={P.rateSource}><Input value={s.source} onChange={(e) => setS({ ...s, source: e.target.value })} /></Field>
        <Field label="URL"><Input value={s.sourceUrl} onChange={(e) => setS({ ...s, sourceUrl: e.target.value })} /></Field>
      </div>
      <div><Button loading={save.isPending} disabled={!s.usdToMnt || !s.date || !s.source} onClick={() => save.mutate()}>{t.common.save}</Button></div>
    </Card>
  );
}

export default function FutureAdmin() {
  return <div className="grid gap-5"><h1 className="text-h1">{P.futureAdmin} / {P.rateAdmin}</h1><Methodology /><Rate /></div>;
}
