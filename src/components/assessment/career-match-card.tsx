import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Badge, Card } from '@/components/ui/data-display';

/** Тохирлын хувийг дугуй хэлбэрээр харуулна (SVG). 80+ → teal, 65+ → navy, бусад → саарал */
export function MatchRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  const tone = value >= 80 ? 'text-secondary' : value >= 65 ? 'text-primary dark:text-secondary' : 'text-muted-foreground';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${t.result.match} ${value}%`}>
      <svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-muted" /><circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className={cn('stroke-current transition-[stroke-dashoffset] duration-[var(--duration-slow)]', tone)} /></svg>
      <span className={cn('absolute inset-0 grid place-items-center font-bold', size >= 80 ? 'text-h4' : 'text-caption')}>{value}%</span>
    </div>
  );
}

export interface CareerMatch { slug: string; nameMn: string; nameEn: string; score: number; category?: string | null; description?: string | null; skills?: string[] }

/** Мэргэжлийн зөвлөмжийн карт: нэр, тохирол, ангилал, тайлбар, шаардлагатай ур чадвар, дэлгэрэнгүй */
export function CareerMatchCard({ m, rank, className }: { m: CareerMatch; rank?: number; className?: string }) {
  return (
    <Card interactive className={cn('relative flex flex-col gap-3 p-4', className)}>
      <div className="flex items-center gap-3">
        <MatchRing value={m.score} />
        <div className="min-w-0"><h3 className="text-h4">{rank ? `${rank}. ` : ''}<Link href={`/careers/${m.slug}`} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{m.nameMn}</Link></h3><p className="text-caption text-muted-foreground">{m.nameEn}</p></div>
      </div>
      {m.category && <Badge variant="secondary" className="w-fit">{m.category}</Badge>}
      {m.description && <p className="line-clamp-3 text-body-sm text-muted-foreground">{m.description}</p>}
      {m.skills && m.skills.length > 0 && <div className="flex flex-wrap gap-1">{m.skills.slice(0, 4).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>}
      <span className="mt-auto inline-flex items-center gap-1 text-label text-primary dark:text-secondary">{t.result.viewCareer}<ArrowRight className="size-4" aria-hidden /></span>
    </Card>
  );
}
