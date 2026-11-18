import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/data-display';

/** Хяналтын самбарын үзүүлэлт: нэр, утга, дүрс, сонголтот өөрчлөлт (trend), тайлбар */
export function StatCard({ label, value, icon: Icon, trend, description, className }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; trend?: { value: number; label?: string }; description?: string; className?: string }) {
  const up = (trend?.value ?? 0) >= 0;
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-body-sm text-muted-foreground">{label}</p>
        {Icon && <span className="grid size-9 place-items-center rounded-md bg-teal-soft text-teal-soft-foreground"><Icon className="size-[18px]" aria-hidden /></span>}
      </div>
      <p className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-caption">
        {trend && <span className={cn('inline-flex items-center gap-0.5 font-semibold', up ? 'text-success-soft-foreground' : 'text-destructive-soft-foreground')}>{up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}{Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ''}</span>}
        {description && <span className="text-muted-foreground">{description}</span>}
      </div>
    </Card>
  );
}
