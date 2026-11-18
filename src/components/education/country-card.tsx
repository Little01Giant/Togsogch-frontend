import Link from 'next/link';
import { ChevronRight, GraduationCap, Languages, Wallet, BookOpen } from 'lucide-react';
import { fmtNumber, t } from '@/i18n';
import { LANGUAGE_LABEL } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { Badge, Card } from '@/components/ui/data-display';
import { Flag } from '@/components/common';

export interface CountryCardData {
  slug: string; code: string; nameMn: string; nameEn: string; publishedUniversities?: number;
  livingCostMonthlyUsd?: { min?: number | null; max?: number | null } | null; matchProfile?: { languages?: string[] } | null; bachelorDuration?: string | null; masterDuration?: string | null;
}

/** Улс: туг, нэр, хэл, амьдрах зардал, боловсролын боломж, сургуулийн тоо. Мэдээлэлгүй мөрийг нэг мөрөнд нийлүүлнэ. */
export function CountryCard({ c, compact, className }: { c: CountryCardData; compact?: boolean; className?: string }) {
  const lc = c.livingCostMonthlyUsd;
  const living = lc && (lc.min != null || lc.max != null) ? `${lc.min === lc.max ? fmtNumber(lc.min ?? 0) : `${fmtNumber(lc.min ?? 0)}–${fmtNumber(lc.max ?? 0)}`} USD` : null;
  const langs = (c.matchProfile?.languages ?? []).map((l) => LANGUAGE_LABEL[l] ?? l);
  const n = c.publishedUniversities ?? 0;
  const facts = [
    { key: 'lang', Icon: Languages, label: t.countries.cardLanguage, value: langs.length ? <span>{langs.join(', ')}</span> : null },
    { key: 'living', Icon: Wallet, label: t.countries.cardLiving, value: living ? <span>{living} <span className="text-caption text-muted-foreground">/ {t.countries.perMonth}</span></span> : null },
    {
      key: 'edu', Icon: BookOpen, label: t.countries.cardEducation,
      value: c.bachelorDuration || c.masterDuration ? (
        <span className="flex flex-col">
          {c.bachelorDuration && <span>{t.countries.cardBachelor} {c.bachelorDuration}</span>}
          {c.masterDuration && <span>{t.countries.cardMaster} {c.masterDuration}</span>}
        </span>
      ) : null,
    },
  ];
  const known = facts.filter((f) => f.value);
  const missing = facts.filter((f) => !f.value);
  return (
    <Card interactive className={cn('relative flex h-full flex-col p-4', className)}>
      <div className="flex items-center gap-3">
        <Flag code={c.code} size={compact ? 32 : 44} />
        <div className="min-w-0"><h3 className="text-h4"><Link href={`/countries/${c.slug}`} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{c.nameMn}</Link></h3><p className="text-caption text-muted-foreground">{c.nameEn}</p></div>
      </div>
      {!compact && (
        <div className="mt-3 flex-1 space-y-2 text-body-sm">
          {known.map(({ key, Icon, label, value }) => (
            <div key={key} className="flex items-start gap-2.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0"><p className="text-caption text-muted-foreground">{label}</p><div>{value}</div></div>
            </div>
          ))}
          {missing.length > 0 && (
            <p className="text-caption italic text-muted-foreground">{t.countries.cardMissing}: {missing.map((m) => m.label).join(' · ')}</p>
          )}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <Badge variant={n ? 'secondary' : 'muted'}><GraduationCap aria-hidden />{n} {t.countries.publishedUniversities}</Badge>
        <span className="flex items-center text-caption text-muted-foreground">{t.countries.cardOpen}<ChevronRight className="size-4" aria-hidden /></span>
      </div>
    </Card>
  );
}
