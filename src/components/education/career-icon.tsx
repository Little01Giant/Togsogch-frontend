import { Briefcase, Cpu, FlaskConical, HeartPulse, Leaf, Palette, Scale, Users, Wrench, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Мэргэжлийн ангиллын slug → Lucide дүрс. Тодорхойгүй ангилалд ерөнхий «Briefcase». */
const ICONS: Record<string, LucideIcon> = {
  technology: Cpu,
  engineering: Wrench,
  health: HeartPulse,
  business: Briefcase,
  creative: Palette,
  'education-social': Users,
  science: FlaskConical,
  'law-public': Scale,
  'agri-env': Leaf,
};

export function CareerIcon({ category, className }: { category?: string | null; className?: string }) {
  const Icon = (category && ICONS[category]) || Briefcase;
  return <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary', className)} aria-hidden><Icon className="size-5" /></span>;
}
