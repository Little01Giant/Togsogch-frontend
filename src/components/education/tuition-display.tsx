'use client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/data-display';
import { NoData } from '@/components/common';

export interface Tuition { annualFee?: number | null; annualFeeMax?: number | null; semesterFee?: number | null; currency?: string; annualFeeUsd?: number | null; academicYear?: string | null; isEstimate?: boolean; verifiedAt?: string | null }

export function useUsdToMnt() {
  return useQuery<{ usdToMnt: number | null; date: string | null; source: string | null }>({ queryKey: ['rate'], queryFn: () => api('/meta/exchange-rate'), staleTime: 300_000 });
}
const money = (n: number, c: string) => `${fmtNumber(Math.round(n))} ${c === 'MNT' ? '₮' : c}`;

/** Анхны валют + USD + MNT, хичээлийн жил, баталгаажсан/тооцоолсон төлөв. Ханш байхгүй бол MNT-ийг зохиохгүй. */
export function TuitionDisplay({ tuition, compact, className }: { tuition: Tuition; compact?: boolean; className?: string }) {
  const rate = useUsdToMnt().data?.usdToMnt ?? null;
  const cur = tuition.currency ?? 'USD';
  const fee = tuition.annualFee ?? null;
  if (fee == null) return <span className={className}><NoData /></span>;
  const usd = tuition.annualFeeUsd ?? (cur === 'USD' ? fee : null);
  const mnt = cur === 'MNT' ? fee : usd != null && rate ? usd * rate : null;
  return (
    <div className={cn('space-y-1', className)}>
      <p className={cn('font-semibold', compact ? 'text-body-sm' : 'text-h4')}>{tuition.annualFeeMax != null && tuition.annualFeeMax > fee ? `${fmtNumber(Math.round(fee))} – ${money(tuition.annualFeeMax, cur)}` : money(fee, cur)} <span className="text-caption font-normal text-muted-foreground">{t.universities.perYear}</span></p>
      {!compact && (
        <p className="text-body-sm text-muted-foreground">
          {cur !== 'USD' && usd != null && <>≈ {money(usd, 'USD')}</>}{cur !== 'USD' && usd != null && mnt != null && ' · '}
          {cur !== 'MNT' && (mnt != null ? <>≈ {money(mnt, 'MNT')}</> : usd != null && <span title={t.p4.rateMissing}>₮ —</span>)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {tuition.academicYear && <Badge variant="outline">{tuition.academicYear}</Badge>}
        {tuition.isEstimate ? <Badge variant="warning"><CircleAlert aria-hidden />{t.universities.estimate}</Badge> : tuition.verifiedAt ? <Badge variant="success"><CheckCircle2 aria-hidden />{t.source.verified}</Badge> : <Badge variant="muted">{t.source.unverified}</Badge>}
      </div>
    </div>
  );
}
