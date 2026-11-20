'use client';
import { useMemo, useState, type ComponentProps } from 'react';
import type { UniCard } from '@/components/education/university-card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { fmtDate, fmtNumber, t } from '@/i18n';
import { useDebounce } from '@/lib/hooks';
import { computeCost, CostInput, Money } from '@/lib/cost';
import { SourceBadge } from '@/components/common';
import { PageContainer, PageHeader } from '@/components/layout/page-container';
import { Alert, Badge, Card } from '@/components/ui/data-display';
import { Field } from '@/components/ui/form';
import { Combobox, SimpleSelect } from '@/components/ui/select';
import { NumberInput } from '@/components/ui/misc';

const P = t.p4;
type Src = ComponentProps<typeof SourceBadge>['source'];
interface CalcTuition { level: string; faculty?: string | null; academicYear?: string | null; currency?: string; annualFee?: number | null; livingCostMonthlyUsd?: number | null; durationMonths?: number | null; isEstimate?: boolean; sourceUrl?: string | null; verifiedAt?: string | null }
interface CalcUni { slug: string; source?: Src; tuition?: CalcTuition[] }
interface Prefilled { source?: Src; isEstimate?: boolean; sourceUrl?: string | null; verifiedAt?: string | null }
const init: CostInput = { tuitionAnnual: 0, accommodationMonthly: 0, foodMonthly: 0, transportMonthly: 0, otherMonthly: 0, insuranceAnnual: 0, booksAnnual: 0, visaOnce: 0, flightPerTrip: 0, trips: 2, months: 24 };
const fmt = (n: number | null, suffix: string) => (n == null ? '—' : `${fmtNumber(Math.round(n))} ${suffix}`);

function Row({ label, m, cur, big }: { label: string; m: Money; cur: string; big?: boolean }) {
  return (
    <Card className={big ? 'border-secondary/50 bg-teal-soft/50 p-4' : 'p-4'}>
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <p className={big ? 'text-h2' : 'text-h3'}>{fmt(m.cur, cur)}</p>
      <p className="mt-0.5 flex gap-4 text-body-sm"><span>{fmt(m.usd, 'USD')}</span><span>{fmt(m.mnt, '₮')}</span></p>
    </Card>
  );
}

export default function CostCalculator() {
  const [v, setV] = useState<CostInput>(init);
  const [cur, setCur] = useState('USD');
  const [customToUsd, setCustomToUsd] = useState<number | undefined>();
  const [manualRate, setManualRate] = useState<number | undefined>();
  const [uniQ, setUniQ] = useState('');
  const dq = useDebounce(uniQ, 300);
  const [uni, setUni] = useState<CalcUni | null>(null);
  const [entry, setEntry] = useState<string | undefined>();
  const [prefilled, setPrefilled] = useState<Prefilled | null>(null);

  const rate = useQuery<{ usdToMnt: number | null; date?: string | null; source?: string | null }>({ queryKey: ['rate'], queryFn: () => api('/meta/exchange-rate') });
  const search = useQuery<{ items: UniCard[] }>({ queryKey: ['calc-uni', dq], queryFn: () => api('/universities', { query: { q: dq, pageSize: 8 } }), enabled: dq.length >= 2 });

  const sysRate: number | null = rate.data?.usdToMnt ?? null;
  const usdToMnt = manualRate && manualRate > 0 ? manualRate : sysRate;
  const toUsd = cur === 'USD' ? 1 : cur === 'MNT' ? (usdToMnt ? 1 / usdToMnt : null) : customToUsd && customToUsd > 0 ? customToUsd : null;
  const r = useMemo(() => computeCost(v, toUsd, usdToMnt), [v, toUsd, usdToMnt]);
  const set = (k: keyof CostInput) => (x: number | undefined) => setV((s) => ({ ...s, [k]: x ?? 0 }));

  const pickUni = async (slug: string | undefined) => {
    if (!slug) { setUni(null); setPrefilled(null); setEntry(undefined); return; }
    setUni(await api<CalcUni>(`/universities/${slug}`)); setEntry(undefined);
  };
  const applyEntry = (idx: string | undefined) => {
    setEntry(idx);
    const x = idx == null ? null : uni?.tuition?.[Number(idx)];
    if (!x) return;
    if (x.currency && x.currency !== cur && ['USD', 'MNT'].includes(x.currency)) setCur(x.currency);
    setV((s) => ({ ...s, tuitionAnnual: x.annualFee ?? s.tuitionAnnual, otherMonthly: x.livingCostMonthlyUsd != null && (x.currency ?? 'USD') === 'USD' ? x.livingCostMonthlyUsd : s.otherMonthly, months: x.durationMonths ?? s.months }));
    setPrefilled({ source: uni?.source, isEstimate: x.isEstimate, sourceUrl: x.sourceUrl, verifiedAt: x.verifiedAt });
  };

  const suffix = cur === 'MNT' ? '₮' : cur;
  const field = (k: keyof CostInput, label: string, per = suffix) => <Field key={k} label={label}><NumberInput min={0} suffix={per} value={v[k] || undefined} onValueChange={set(k)} /></Field>;

  return (
    <PageContainer className="py-8 md:py-12">
      <PageHeader mascot="think" title={P.calcTitle} description={P.calcSubtitle} />
      <Alert variant="warning" className="mb-5">{P.estimateNote}</Alert>

      <Card className="mb-5 grid gap-3 p-5"><h2 className="text-h4">{P.pickUni}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Combobox value={uni?.slug} onChange={pickUni} onSearch={setUniQ} placeholder={t.universities.searchPlaceholder} searchPlaceholder={t.common.search} emptyText={t.common.empty} options={(search.data?.items ?? []).map((u) => ({ value: u.slug, label: `${u.name}${u.country ? ` — ${u.country.nameMn}` : ''}` }))} />
          <SimpleSelect placeholder={P.pickEntry} disabled={!uni} clearable value={entry} onValueChange={applyEntry} options={(uni?.tuition ?? []).map((x, i) => ({ value: String(i), label: `${t.universities.labelsDegree[x.level] ?? x.level}${x.faculty ? ` · ${x.faculty}` : ''}${x.academicYear ? ` · ${x.academicYear}` : ''}` }))} />
        </div>
        {uni && !uni.tuition?.length && <p className="text-body-sm text-muted-foreground">{t.universities.noTuitionDetail}</p>}
        {prefilled && <div className="flex flex-wrap items-center gap-2"><Badge variant={prefilled.isEstimate ? 'warning' : 'success'}>{prefilled.isEstimate ? P.estimateLabel : P.fromOfficial}</Badge><SourceBadge source={{ ...prefilled.source, verifiedAt: prefilled.verifiedAt ?? prefilled.source?.verifiedAt, sourceUrl: prefilled.sourceUrl ?? prefilled.source?.sourceUrl }} /></div>}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid content-start gap-5">
          <Card className="grid gap-3 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={P.currency}><SimpleSelect options={['USD', 'MNT', 'EUR', 'GBP', 'KRW', 'JPY', 'CNY', 'AUD', 'CAD'].map((c) => ({ value: c, label: c }))} value={cur} onValueChange={(x) => x && setCur(x)} /></Field>
              {!['USD', 'MNT'].includes(cur) && <Field label={`${P.customRate} (${cur})`}><NumberInput min={0} step={0.000001} value={customToUsd} onValueChange={setCustomToUsd} /></Field>}
            </div>
            <Field label={P.usdToMnt} description={sysRate && manualRate === undefined ? `${P.rateOfficial}: ${rate.data?.source}${rate.data?.date ? ` · ${P.rateDate}: ${fmtDate(rate.data.date)}` : ''}` : manualRate !== undefined ? P.rateManual : P.rateMissing}>
              <NumberInput min={0} value={manualRate ?? sysRate ?? undefined} onValueChange={setManualRate} placeholder="—" />
            </Field>
          </Card>
          <Card className="grid gap-3 p-5 sm:grid-cols-2">
            {field('tuitionAnnual', P.tuitionAnnual)}{field('accommodationMonthly', P.accommodation)}{field('foodMonthly', P.food)}{field('transportMonthly', P.transport)}{field('otherMonthly', P.otherMonthly)}
            {field('insuranceAnnual', P.insurance)}{field('booksAnnual', P.books)}{field('visaOnce', P.visa)}{field('flightPerTrip', P.flight)}{field('trips', P.trips, '')}{field('months', P.months, P.monthsShort)}
          </Card>
        </div>
        <div className="grid content-start gap-3" aria-live="polite">
          <Badge variant="warning" className="w-fit px-3 py-1 text-body-sm">{P.estimateLabel}</Badge>
          <Row label={P.monthlyLiving} m={r.monthlyLiving} cur={suffix} /><Row label={P.annual} m={r.annualRecurring} cur={suffix} /><Row label={P.oneTime} m={r.oneTime} cur={suffix} />
          <Row label={P.monthlyAvg} m={r.monthlyAverage} cur={suffix} /><Row label={P.total} m={r.total} cur={suffix} big />
        </div>
      </div>
    </PageContainer>
  );
}
