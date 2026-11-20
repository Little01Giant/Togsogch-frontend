'use client';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/form-controls';
import { NumberInput } from '@/components/ui/misc';
import { MultiChoice, ScaleChoice, SingleChoice } from './answer-option';

/** Хариултын утга: тоо (likert/number), текст, сонголтын түлхүүр эсвэл түлхүүрүүдийн жагсаалт */
export type AnswerValue = string | number | string[] | null | undefined;

export interface Question { key: string; section: string; order: number; type: string; text: string; required: boolean; options?: { key: string; label: string }[]; scale?: { min: number; max: number; minLabel?: string; maxLabel?: string } }

const isAnswered = (v: unknown) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);

/** Нэг асуулт: дугаар + гарчиг + төрөлд тохирсон хариултын оролт + алдааны мэдээлэл */
export function QuestionCard({ q, index, value, onChange, invalid }: { q: Question; index: number; value: AnswerValue; onChange: (v: AnswerValue) => void; invalid?: boolean }) {
  const id = `q-${q.key}`;
  const answered = isAnswered(value);
  let input: React.ReactNode = null;
  if (q.type === 'likert' || q.type === 'rating') input = <ScaleChoice name={id} min={q.scale?.min ?? 1} max={q.scale?.max ?? 5} minLabel={q.scale?.minLabel} maxLabel={q.scale?.maxLabel} value={typeof value === 'number' ? value : undefined} onChange={onChange} />;
  else if (q.type === 'single') input = <SingleChoice name={id} options={q.options ?? []} value={typeof value === 'string' ? value : undefined} onChange={onChange} />;
  else if (q.type === 'multi') input = <MultiChoice name={id} options={q.options ?? []} value={Array.isArray(value) ? value : []} onChange={onChange} />;
  else if (q.type === 'text') input = <Textarea id={id} maxLength={2000} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} />;
  else if (q.type === 'number') input = <NumberInput id={id} className="max-w-48" value={typeof value === 'number' ? value : null} onValueChange={onChange} aria-invalid={invalid} />;
  return (
    <fieldset data-testid={id} aria-invalid={invalid} className={cn('grid gap-4 rounded-xl border bg-card p-4 transition-colors sm:p-5', answered && 'border-secondary/40', invalid && 'border-destructive ring-2 ring-destructive/20')}>
      <legend className="sr-only">{q.text}</legend>
      <div className="flex items-start gap-3" aria-hidden>
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-caption font-bold text-muted-foreground">{index}</span>
        <p className="min-w-0 text-h4 leading-snug">{q.text}{q.required && <span className="ml-1 text-destructive">*</span>}</p>
      </div>
      {q.type === 'multi' && <p className="-mt-2 pl-10 text-caption text-muted-foreground">{t.assessments.multiHint}</p>}
      {input}
      {invalid && <p role="alert" className="text-caption font-medium text-destructive">{t.assessments.required}</p>}
    </fieldset>
  );
}
