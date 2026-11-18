import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';

/** Хувийн зөвлөмж/дараагийн алхам: гарчиг, тайлбар, CTA */
export function RecommendationCard({ title, description, href, cta, icon: Icon = Lightbulb, premium, className }: { title: string; description?: string; href?: string; cta?: string; icon?: React.ComponentType<{ className?: string }>; premium?: boolean; className?: string }) {
  return (
    <Card className={cn('flex items-start gap-4 p-5', premium && 'border-accent/50 bg-gold-soft/40', className)}>
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-md', premium ? 'bg-accent text-accent-foreground' : 'bg-teal-soft text-teal-soft-foreground')}><Icon className="size-5" aria-hidden /></span>
      <div className="min-w-0 flex-1"><h3 className="text-h4">{title}</h3>{description && <p className="mt-0.5 text-body-sm text-muted-foreground">{description}</p>}
        {href && cta && <Button asChild variant="link" className="mt-2"><Link href={href}>{cta} →</Link></Button>}</div>
    </Card>
  );
}
