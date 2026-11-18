'use client';
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fieldBase } from './form-controls';
import { Popover, PopoverContent, PopoverTrigger } from './overlays';

/* ───────── Select (Radix) ───────── */
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...p }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn(fieldBase, 'items-center justify-between gap-2 text-left data-[placeholder]:text-muted-foreground/80 [&>span]:line-clamp-1', className)} {...p}>
    {children}<SelectPrimitive.Icon asChild><ChevronDown className="size-4 shrink-0 text-muted-foreground" /></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';
export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = 'popper', ...p }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} position={position} className={cn('relative z-overlay max-h-80 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', position === 'popper' && 'w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1', className)} {...p}>
      <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';
export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...p }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn('relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2.5 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)} {...p}>
    <span className="absolute left-2 flex size-4 items-center justify-center"><SelectPrimitive.ItemIndicator><Check className="size-4 text-primary dark:text-secondary" /></SelectPrimitive.ItemIndicator></span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export interface Option { value: string; label: string }
const NONE = '__none__';

/** Энгийн сонголт: options массив → Select. clearable үед «сонголтгүй» мөр нэмнэ. */
export function SimpleSelect({ options, value, onValueChange, placeholder, clearable, clearLabel = 'Сонголтгүй', className, id, invalid, disabled, 'aria-label': ariaLabel }: {
  options: Option[]; value?: string | null; onValueChange: (v: string | undefined) => void; placeholder?: string; clearable?: boolean; clearLabel?: string; className?: string; id?: string; invalid?: boolean; disabled?: boolean; 'aria-label'?: string;
}) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => onValueChange(v === NONE ? undefined : v)} disabled={disabled}>
      <SelectTrigger id={id} className={className} aria-invalid={invalid} aria-label={ariaLabel}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {clearable && value && <SelectItem value={NONE} className="text-muted-foreground">{clearLabel}</SelectItem>}
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/* ───────── Combobox (хайлттай нэг сонголт) ───────── */
export function Combobox({ options, value, onChange, placeholder = 'Сонгох', searchPlaceholder = 'Хайх…', emptyText = 'Илэрц олдсонгүй', onSearch, className, clearable = true, invalid, id, loading }: {
  options: Option[]; value?: string | null; onChange: (v: string | undefined) => void; placeholder?: string; searchPlaceholder?: string; emptyText?: string;
  /** Өгвөл хайлтыг сервер талд хийнэ (cmdk-ийн дотоод шүүлтийг унтраана) */ onSearch?: (q: string) => void; className?: string; clearable?: boolean; invalid?: boolean; id?: string; loading?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-expanded={open} aria-invalid={invalid} className={cn(fieldBase, 'items-center justify-between gap-2 text-left', !selected && 'text-muted-foreground/80', className)}>
          <span className="line-clamp-1">{selected?.label ?? placeholder}</span>
          <span className="flex items-center gap-1">
            {clearable && selected && <span role="button" tabIndex={0} aria-label="Цэвэрлэх" onClick={(e) => { e.stopPropagation(); onChange(undefined); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(undefined); } }} className="rounded-sm p-0.5 hover:bg-muted"><X className="size-3.5" /></span>}
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0">
        <CommandPrimitive shouldFilter={!onSearch} className="flex flex-col">
          <CommandPrimitive.Input onValueChange={onSearch} placeholder={searchPlaceholder} className="h-10 border-b bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground" />
          <CommandPrimitive.List className="max-h-64 overflow-y-auto p-1.5">
            <CommandPrimitive.Empty className="py-6 text-center text-body-sm text-muted-foreground">{loading ? 'Ачаалж байна…' : emptyText}</CommandPrimitive.Empty>
            {options.map((o) => (
              <CommandPrimitive.Item key={o.value} value={`${o.label} ${o.value}`} onSelect={() => { onChange(o.value); setOpen(false); }} className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted">
                <Check className={cn('size-4', value === o.value ? 'opacity-100' : 'opacity-0')} />{o.label}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}

/* ───────── MultiSelect (олон сонголт, тагтай) ───────── */
export function MultiSelect({ options, value, onChange, placeholder = 'Сонгох', searchPlaceholder = 'Хайх…', emptyText = 'Илэрц олдсонгүй', className, id }: {
  options: Option[]; value: string[]; onChange: (v: string[]) => void; placeholder?: string; searchPlaceholder?: string; emptyText?: string; className?: string; id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-expanded={open} className={cn(fieldBase, 'h-auto min-h-10 items-center justify-between gap-2 py-1.5 text-left', className)}>
          <span className="flex flex-wrap gap-1">
            {value.length === 0 && <span className="text-muted-foreground/80">{placeholder}</span>}
            {value.map((v) => <span key={v} className="inline-flex items-center gap-1 rounded-sm bg-teal-soft px-1.5 py-0.5 text-caption font-medium text-teal-soft-foreground">{options.find((o) => o.value === v)?.label ?? v}</span>)}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0">
        <CommandPrimitive className="flex flex-col">
          <CommandPrimitive.Input placeholder={searchPlaceholder} className="h-10 border-b bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground" />
          <CommandPrimitive.List className="max-h-64 overflow-y-auto p-1.5">
            <CommandPrimitive.Empty className="py-6 text-center text-body-sm text-muted-foreground">{emptyText}</CommandPrimitive.Empty>
            {options.map((o) => (
              <CommandPrimitive.Item key={o.value} value={`${o.label} ${o.value}`} onSelect={() => toggle(o.value)} className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted">
                <Check className={cn('size-4', value.includes(o.value) ? 'opacity-100' : 'opacity-0')} />{o.label}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
          {value.length > 0 && <button type="button" onClick={() => onChange([])} className="border-t px-3 py-2 text-left text-caption text-muted-foreground hover:bg-muted">Бүгдийг цэвэрлэх</button>}
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}

/* ───────── TagsInput (чөлөөт текст таг) ───────── */
export function TagsInput({ value, onChange, placeholder = 'Бичээд Enter дарна уу', className, id }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; className?: string; id?: string }) {
  const [text, setText] = React.useState('');
  const add = () => { const v = text.trim(); if (v && !value.includes(v)) onChange([...value, v]); setText(''); };
  return (
    <div className={cn(fieldBase, 'h-auto min-h-10 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40', className)}>
      {value.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-caption font-medium">{v}
          <button type="button" aria-label={`${v} устгах`} onClick={() => onChange(value.filter((x) => x !== v))} className="rounded-sm hover:bg-border"><X className="size-3" /></button></span>
      ))}
      <input id={id} value={text} placeholder={value.length ? '' : placeholder} onChange={(e) => setText(e.target.value)} onBlur={add}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1)); }}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/80" />
    </div>
  );
}
