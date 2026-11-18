import { Clock, Languages } from 'lucide-react';
import { fmtNumber, t } from '@/i18n';
import { Badge, Card } from '@/components/ui/data-display';
import { NoData } from '@/components/common';

const U = t.universities;
export interface ProgramData { _id?: string; name: string; level: string; department?: string; language?: string; durationMonths?: number; annualTuition?: number; currency?: string; applicationPeriod?: string; requirements?: { kind: string; minScore?: number | null; note?: string }[] }

/** Хөтөлбөр: түвшин, хэл, хугацаа, төлбөр, шаардлага (хөтөлбөр бүрээр тусдаа; байхгүй бол зохиохгүй) */
export function ProgramCard({ p }: { p: ProgramData }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-h4">{p.name}</h4>{p.department && <p className="text-caption text-muted-foreground">{p.department}</p>}</div><Badge variant="outline">{U.labelsDegree[p.level] ?? p.level}</Badge></div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Languages className="size-4" aria-hidden />{p.language ?? <NoData />}</span>
        <span className="flex items-center gap-1"><Clock className="size-4" aria-hidden />{p.durationMonths ? `${p.durationMonths} ${U.months}` : <NoData />}</span>
        <span>{p.annualTuition != null ? `${fmtNumber(p.annualTuition)} ${p.currency ?? 'USD'} ${U.perYear}` : <NoData />}</span>
      </div>
      {p.applicationPeriod && <p className="mt-1 text-caption text-muted-foreground">{U.applicationPeriod}: {p.applicationPeriod}</p>}
      <div className="mt-3 border-t pt-3"><p className="mb-1 text-label">{U.admissionReq}</p>
        {p.requirements?.length ? <ul className="space-y-0.5 text-body-sm">{p.requirements.map((r, i) => <li key={i}>• {r.kind}{r.minScore != null ? ` ≥ ${r.minScore}` : ''}{r.note ? ` — ${r.note}` : ''}</li>)}</ul> : <p className="text-body-sm italic text-muted-foreground">{U.noRequirements}</p>}</div>
    </Card>
  );
}
