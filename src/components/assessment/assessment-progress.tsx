import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/data-display';

/** Одоогийн бүлэг, хариулсан/нийт, хувь, явцын зураас */
export function AssessmentProgress({ section, step, steps, answered, total, saving }: { section: string; step: number; steps: number; answered: number; total: number; saving?: boolean }) {
  const pct = Math.round((answered / Math.max(1, total)) * 100);
  return (
    <div className="sticky top-16 z-sticky -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:bg-card sm:px-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <p className="text-label">{section} <span className="font-normal text-muted-foreground">· {step + 1}/{steps}</span></p>
        <p className="text-caption text-muted-foreground" aria-live="polite">{t.assessments.answered}: {answered}/{total} · {pct}%{saving ? ` · ${t.assessments.saving}` : ''}</p>
      </div>
      <Progress value={pct} aria-label={t.assessments.progress} />
    </div>
  );
}

export function AssessmentNav({ onPrev, onNext, prevDisabled, nextLabel, loading }: { onPrev: () => void; onNext: () => void; prevDisabled?: boolean; nextLabel: string; loading?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" onClick={onPrev} disabled={prevDisabled}><ChevronLeft />{t.common.prev}</Button>
      <Button onClick={onNext} loading={loading}>{nextLabel}<ChevronRight /></Button>
    </div>
  );
}
