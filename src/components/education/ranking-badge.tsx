import { Award } from 'lucide-react';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/data-display';

export interface Ranking { provider?: string; rank: number | null; rankText?: string | null; edition?: string | null; year: number; sourceUrl?: string | null }

/** Рейтингийн байгууллага + хэвлэл/он ЗАСВАЛ ХАРУУЛНА. Мэдээлэл байхгүй бол 0 биш «Мэдээлэл байхгүй». */
export function RankingBadge({ label, ranking, showSource = false, className }: { label: string; ranking?: Ranking | null; showSource?: boolean; className?: string }) {
  const has = ranking && (ranking.rank || ranking.rankText);
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="w-16 shrink-0 text-caption text-muted-foreground">{label}</span>
      {has ? (
        <span className="flex flex-wrap items-center gap-x-2">
          <Badge variant="secondary" className="gap-1 font-semibold"><Award aria-hidden />#{ranking.rank ?? ranking.rankText}</Badge>
          <span className="text-caption text-muted-foreground">{ranking.edition ?? ranking.year}</span>
          {showSource && ranking.sourceUrl && <a href={ranking.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-caption text-primary underline dark:text-secondary">{t.source.label}</a>}
        </span>
      ) : <span className="text-body-sm italic text-muted-foreground">{t.universities.noRanking}</span>}
    </div>
  );
}
