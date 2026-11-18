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
      <div className="relative aspect-[16/9] w-full bg-muted">
        {u.coverUrl ? <img src={u.coverUrl} alt="" loading="lazy" className="size-full object-cover" /> : <div className="grid size-full place-items-center bg-hero text-hero-muted"><GraduationCap className="size-10" aria-hidden /></div>}
        <span className="absolute -bottom-6 left-4 grid size-14 place-items-center overflow-hidden rounded-lg border-2 border-card bg-card shadow-sm">
          {u.logoUrl ? <img src={u.logoUrl} alt="" width={56} height={56} className="size-full object-contain p-1" /> : <GraduationCap className="size-6 text-muted-foreground" aria-hidden />}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-9">
        <h3 className="text-h4 [overflow-wrap:anywhere]"><Link href={`/universities/${u.slug}`} className="rounded-sm after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{u.name}</Link></h3>
        {u.nameMn && <p className="text-body-sm text-muted-foreground">{u.nameMn}</p>}
        <p className="mt-auto flex items-center gap-1.5 pt-2 text-body-sm"><Flag code={u.country?.code} size={16} />{u.country?.nameMn ?? t.common.noData}{u.city ? `, ${u.city}` : ''}</p>
      </div>
    </Card>
  );
}
