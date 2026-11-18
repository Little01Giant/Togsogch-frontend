'use client';
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, ChevronDown, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ───────── Card ───────── */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }>(({ className, interactive, ...p }, ref) => (
  <div ref={ref} className={cn('rounded-2xl border-2 bg-card text-card-foreground shadow-[0_2px_0_0_var(--border)]', interactive && 'transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-standard hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-[0_4px_0_0_var(--border)] focus-within:border-ring/60', className)} {...p} />
));
Card.displayName = 'Card';
export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col gap-1.5 p-5 pb-3', className)} {...p} />;
export const CardTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('text-h4', className)} {...p} />;
export const CardDescription = ({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn('text-body-sm text-muted-foreground', className)} {...p} />;
export const CardContent = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('p-5 pt-0', className)} {...p} />;
export const CardFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex items-center p-5 pt-0', className)} {...p} />;

/* ───────── Badge ───────── */
export const badgeVariants = cva('inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-caption font-bold whitespace-nowrap transition-colors [&_svg]:size-3', {
  variants: { variant: {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-teal-soft text-teal-soft-foreground',
    outline: 'border-border bg-transparent text-foreground',
    muted: 'border-transparent bg-muted text-muted-foreground',
    success: 'border-transparent bg-success-soft text-success-soft-foreground',
    warning: 'border-transparent bg-warning-soft text-warning-soft-foreground',
    info: 'border-transparent bg-info-soft text-info-soft-foreground',
    destructive: 'border-transparent bg-destructive-soft text-destructive-soft-foreground',
    premium: 'border-transparent bg-gold-soft text-gold-soft-foreground',
  } }, defaultVariants: { variant: 'secondary' },
});
export function Badge({ className, variant, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...p} />;
}

/* ───────── Alert ───────── */
const alertVariants = cva('relative flex gap-3 rounded-lg border p-4 text-body-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0', {
  variants: { variant: {
    default: 'border-border bg-card text-foreground',
    info: 'border-info/30 bg-info-soft text-info-soft-foreground',
    success: 'border-success/30 bg-success-soft text-success-soft-foreground',
    warning: 'border-warning/40 bg-warning-soft text-warning-soft-foreground',
    destructive: 'border-destructive/30 bg-destructive-soft text-destructive-soft-foreground',
  } }, defaultVariants: { variant: 'default' },
});
const ALERT_ICON = { default: Info, info: Info, success: CheckCircle2, warning: TriangleAlert, destructive: AlertCircle };
export function Alert({ className, variant = 'default', title, children, role, hideIcon, ...p }: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & VariantProps<typeof alertVariants> & { title?: React.ReactNode; hideIcon?: boolean }) {
  const Icon = ALERT_ICON[variant ?? 'default'];
  return (
    <div role={role ?? (variant === 'destructive' ? 'alert' : 'status')} className={cn(alertVariants({ variant }), className)} {...p}>
      {!hideIcon && <Icon aria-hidden />}<div className="min-w-0 flex-1">{title && <p className="mb-0.5 font-semibold">{title}</p>}<div>{children}</div></div>
    </div>
  );
}

/* ───────── Progress / Skeleton / Separator / Avatar ───────── */
export const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }>(({ className, value, indicatorClassName, ...p }, ref) => (
  <ProgressPrimitive.Root ref={ref} value={value} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)} {...p}>
    <ProgressPrimitive.Indicator className={cn('h-full rounded-full bg-secondary transition-[width] duration-[var(--duration-slow)] ease-standard', indicatorClassName)} style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} />
  </ProgressPrimitive.Root>
));
Progress.displayName = 'Progress';
export const Skeleton = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div aria-hidden className={cn('animate-pulse rounded-md bg-muted', className)} {...p} />;
export const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(({ className, orientation = 'horizontal', decorative = true, ...p }, ref) => (
  <SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} {...p} />
));
Separator.displayName = 'Separator';
export const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({ className, ...p }, ref) => <AvatarPrimitive.Root ref={ref} className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)} {...p} />);
Avatar.displayName = 'Avatar';
export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...p }, ref) => <AvatarPrimitive.Fallback ref={ref} className={cn('flex size-full items-center justify-center bg-teal-soft text-caption font-semibold text-teal-soft-foreground', className)} {...p} />);
AvatarFallback.displayName = 'AvatarFallback';

/* ───────── Tabs ───────── */
export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...p }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1 text-muted-foreground', className)} {...p} />
));
TabsList.displayName = 'TabsList';
export const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...p }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={cn('inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs', className)} {...p} />
));
TabsTrigger.displayName = 'TabsTrigger';
export const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...p }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)} {...p} />
));
TabsContent.displayName = 'TabsContent';

/* ───────── Accordion ───────── */
export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...p }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('overflow-hidden rounded-lg border bg-card', className)} {...p} />
));
AccordionItem.displayName = 'AccordionItem';
export const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...p }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} className={cn('group flex flex-1 items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring', className)} {...p}>
      {children}<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-base)] group-data-[state=open]:rotate-180" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';
export const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, ...p }, ref) => (
  <AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...p}><div className={cn('px-4 pb-4 pt-1', className)}>{children}</div></AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

/* ───────── Table ───────── */
export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...p }, ref) => (
  <div className="relative w-full overflow-x-auto rounded-lg border bg-card"><table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...p} /></div>
));
Table.displayName = 'Table';
export const TableHeader = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('bg-muted/60 [&_tr]:border-b', className)} {...p} />;
export const TableBody = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn('[&_tr:last-child]:border-0', className)} {...p} />;
export const TableRow = ({ className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-b transition-colors hover:bg-muted/40', className)} {...p} />;
export const TableHead = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn('h-10 whitespace-nowrap px-3 text-left align-middle text-caption font-semibold text-muted-foreground', className)} {...p} />;
export const TableCell = ({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-3 py-2.5 align-middle', className)} {...p} />;
