import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';

/** Хэрэглэгчийн үйл ажиллагаа (өгсөн тест, хадгалсан сургууль гэх мэт) нэг мөрөөр */
export function ActivityCard({ title, subtitle, meta, href, actionLabel, className }: { title: React.ReactNode; subtitle?: React.ReactNode; meta?: React.ReactNode; href?: string; actionLabel?: string; className?: string }) {
  return (
    <Card className={cn('flex flex-wrap items-center justify-between gap-3 p-4', className)}>
      <div className="min-w-0"><p className="font-semibold [overflow-wrap:anywhere]">{title}</p>{subtitle && <p className="text-body-sm text-muted-foreground">{subtitle}</p>}{meta && <div className="mt-1.5">{meta}</div>}</div>
      {href && actionLabel && <Button asChild variant="outline" size="sm"><Link href={href}>{actionLabel}</Link></Button>}
    </Card>
  );
}
