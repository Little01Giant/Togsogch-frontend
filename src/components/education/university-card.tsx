'use client';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { t } from '@/i18n';
import { Card } from '@/components/ui/data-display';
import { Flag } from '@/components/common';

/** Жагсаалтын карт: ЗӨВХӨН үнэгүй мэдээлэл (backend энэ хүрээнд л буцаана) — лого, зураг, нэр, улс */
export interface UniCard {
  id: string; slug: string; name: string; nameMn: string | null; logoUrl: string | null; coverUrl: string | null; city: string | null; type: string | null;
  country: { slug: string; code: string; nameMn: string; nameEn: string; flag: string | null } | null;
  degreeLevels: string[]; subjects: string[];
}

export function UniversityCard({ u }: { u: UniCard }) {
  return (
    <Card interactive className="relative flex h-full flex-col overflow-hidden p-0" data-testid="university-card">
      {/* Зураг нь абсолют: өөрийн харьцаагаар картыг сунгахгүй, бүх карт ижил өндөртэй (16:9) */}
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        {u.coverUrl ? <img src={u.coverUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="absolute inset-0 grid place-items-center bg-hero text-hero-muted"><GraduationCap className="size-10" aria-hidden /></div>}
      </div>
      <span className="relative z-10 -mt-10 ml-4 grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-card bg-logo-surface shadow-sm">
        {u.logoUrl ? <img src={u.logoUrl} alt="" width={80} height={80} className="size-full object-contain p-1.5" /> : <GraduationCap className="size-6 text-muted-foreground" aria-hidden />}
      </span>
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
        <h3 className="text-h4 [overflow-wrap:anywhere]"><Link href={`/universities/${u.slug}`} className="rounded-sm after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{u.name}</Link></h3>
        {u.nameMn && <p className="text-body-sm text-muted-foreground">{u.nameMn}</p>}
        <p className="mt-auto flex items-center gap-1.5 pt-2 text-body-sm"><Flag code={u.country?.code} size={16} />{u.country?.nameMn ?? t.common.noData}{u.city ? `, ${u.city}` : ''}</p>
      </div>
    </Card>
  );
}
