'use client';
import * as React from 'react';
import Link from 'next/link';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isValid } from 'date-fns';
import { Toaster as Sonner, toast } from 'sonner';
import { CalendarDays, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './button';
import { fieldBase, Input } from './form-controls';
import { Popover, PopoverContent, PopoverTrigger } from './overlays';

/* ───────── Toast (sonner) ───────── */
export function Toaster() {
  return <Sonner position="top-right" closeButton toastOptions={{ classNames: { toast: '!rounded-lg !border !border-border !bg-popover !text-popover-foreground !shadow-md', description: '!text-muted-foreground' } }} />;
}
type NotifyColor = 'red' | 'teal' | 'orange' | 'blue' | 'green';
/** Хуучин notifications.show-той ижил хэлбэрээр дуудагдана */
export function notify({ color = 'blue', title, message }: { color?: NotifyColor; title?: string; message: string }) {
  const fn = color === 'red' ? toast.error : color === 'teal' || color === 'green' ? toast.success : color === 'orange' ? toast.warning : toast.info;
  fn(title ?? message, title ? { description: message } : undefined);
}

/* ───────── Breadcrumb ───────── */
export function Breadcrumb({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Замын цэс" className={cn('text-[0.6875rem] leading-snug text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href && i < items.length - 1 ? <Link href={it.href} className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{it.label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined} className={i === items.length - 1 ? 'font-medium text-foreground' : ''}>{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="size-3" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ───────── Pagination ───────── */
function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const s = new Set([1, total, page, page - 1, page + 1]);
  const arr = [...s].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  arr.forEach((n, i) => { if (i && n - arr[i - 1] > 1) out.push('…'); out.push(n); });
  return out;
}
export function Pagination({ page, total, onChange, className }: { page: number; total: number; onChange: (p: number) => void; className?: string }) {
  if (total <= 1) return null;
  return (
    <nav role="navigation" aria-label="Хуудаслалт" className={cn('flex items-center justify-center gap-1', className)}>
      <Button variant="outline" size="icon" className="size-9" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Өмнөх хуудас"><ChevronLeft /></Button>
      {pageList(page, total).map((p, i) => p === '…'
        ? <span key={`e${i}`} className="grid size-9 place-items-center text-muted-foreground" aria-hidden><MoreHorizontal className="size-4" /></span>
        : <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined} aria-label={`${p}-р хуудас`} className={cn(buttonVariants({ variant: p === page ? 'default' : 'ghost', size: 'icon' }), 'size-9')}>{p}</button>)}
      <Button variant="outline" size="icon" className="size-9" disabled={page >= total} onClick={() => onChange(page + 1)} aria-label="Дараах хуудас"><ChevronRight /></Button>
    </nav>
  );
}

/* ───────── Date Picker (ISO string ⇄ Date) ───────── */
export function DatePicker({ value, onChange, placeholder = 'Огноо сонгох', className, id }: { value?: string | null; onChange: (iso: string | undefined) => void; placeholder?: string; className?: string; id?: string }) {
  const [open, setOpen] = React.useState(false);
  const d = value ? parseISO(String(value).slice(0, 10)) : undefined;
  const valid = d && isValid(d) ? d : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" className={cn(fieldBase, 'items-center justify-between gap-2 text-left', !valid && 'text-muted-foreground/80', className)}>
          <span>{valid ? format(valid, 'yyyy-MM-dd') : placeholder}</span><CalendarDays className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <DayPicker mode="single" selected={valid} defaultMonth={valid} onSelect={(day) => { onChange(day ? format(day, 'yyyy-MM-dd') : undefined); setOpen(false); }} showOutsideDays
          classNames={{ root: 'text-sm', months: 'relative', month_caption: 'flex h-9 items-center justify-center font-semibold', nav: 'absolute inset-x-0 top-0 flex items-center justify-between', button_previous: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8'), button_next: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8'), weekday: 'size-9 text-caption font-medium text-muted-foreground', day: 'p-0', day_button: 'size-9 rounded-md text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary', today: 'font-bold text-secondary-foreground [&>button]:ring-1 [&>button]:ring-ring', outside: 'opacity-40', chevron: 'size-4' }} />
      </PopoverContent>
    </Popover>
  );
}

/* ───────── Тооны оролт: хоосон = undefined ───────── */
export const NumberInput = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & { value?: number | '' | null; onValueChange: (v: number | undefined) => void; suffix?: string }>(({ value, onValueChange, suffix, className, ...p }, ref) => (
  <div className="relative">
    <Input ref={ref} type="number" inputMode="decimal" value={value ?? ''} onChange={(e) => onValueChange(e.target.value === '' ? undefined : Number(e.target.value))} className={cn(suffix && 'pr-12', className)} {...p} />
    {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">{suffix}</span>}
  </div>
));
NumberInput.displayName = 'NumberInput';
