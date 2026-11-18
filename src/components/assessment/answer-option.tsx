'use client';
import { cn } from '@/lib/utils';
import { Checkbox, Label, RadioGroup, RadioGroupItem } from '@/components/ui/form-controls';

/** Сонголтын нэг мөр: зүүн талд сонголтын хайрцаг, баруун талд текст (олон мөр болсон ч эхний мөртэйгөө эгнэнэ). Сонгосон үед хүрээ тод. */
const optionClass = (on: boolean) => cn(
  'flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border bg-card px-3.5 py-3 font-normal transition-colors hover:border-ring/60 hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
  on && 'border-secondary bg-teal-soft text-teal-soft-foreground ring-1 ring-secondary hover:bg-teal-soft',
);

/** Сонголтот асуултын хариулт (нэг сонголт) — том, дарахад хялбар карт хэлбэртэй. Мөр бүр ижил өндөртэй. */
export function SingleChoice({ name, options, value, onChange }: { name: string; options: { key: string; label: string }[]; value?: string; onChange: (v: string) => void }) {
  return (
    <RadioGroup value={value ?? ''} onValueChange={onChange} aria-label={name} className="grid auto-rows-fr gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const id = `${name}-${o.key}`;
        return (
          <Label key={o.key} htmlFor={id} className={optionClass(value === o.key)}>
            <RadioGroupItem id={id} value={o.key} className="mt-0.5 shrink-0" /><span className="min-w-0 text-body-sm leading-snug">{o.label}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

export function MultiChoice({ name, options, value, onChange }: { name: string; options: { key: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div role="group" aria-label={name} className="grid auto-rows-fr gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const id = `${name}-${o.key}`; const on = value.includes(o.key);
        return (
          <Label key={o.key} htmlFor={id} className={optionClass(on)}>
            <Checkbox id={id} checked={on} onCheckedChange={(c) => onChange(c ? [...value, o.key] : value.filter((x) => x !== o.key))} className="mt-0.5 shrink-0" /><span className="min-w-0 text-body-sm leading-snug">{o.label}</span>
          </Label>
        );
      })}
    </div>
  );
}

/** Likert/үнэлгээний хэмжүүр: товчлуур бүр 44px — гар утсанд тохиромжтой */
export function ScaleChoice({ name, min, max, minLabel, maxLabel, value, onChange }: { name: string; min: number; max: number; minLabel?: string; maxLabel?: string; value?: number; onChange: (v: number) => void }) {
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <RadioGroup value={value === undefined ? '' : String(value)} onValueChange={(v) => onChange(Number(v))} aria-label={name} className="flex flex-wrap gap-2">
        {nums.map((n) => (
          <Label key={n} htmlFor={`${name}-${n}`} className={cn('grid size-11 cursor-pointer place-items-center rounded-md border bg-card text-sm font-semibold transition-colors hover:border-ring/60 hover:bg-muted/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring', value === n && 'border-primary bg-primary text-primary-foreground hover:bg-primary')}>
            <RadioGroupItem id={`${name}-${n}`} value={String(n)} className="sr-only" />{n}
          </Label>
        ))}
      </RadioGroup>
      {(minLabel || maxLabel) && <div className="mt-1.5 flex max-w-md justify-between text-caption text-muted-foreground"><span>{min} — {minLabel}</span><span>{max} — {maxLabel}</span></div>}
    </div>
  );
}
