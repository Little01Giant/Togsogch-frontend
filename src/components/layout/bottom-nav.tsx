'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, House, ListChecks, UserRound, type LucideIcon } from 'lucide-react';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';

/** Доод цэс (гар утас, таблет): 4 үндсэн хуудас. lg-ээс дээш дэлгэц дээр дээд цэс ашиглагдана. */
const ITEMS: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: '/', label: t.nav.home, icon: House, match: (p) => p === '/' },
  { href: '/assessments', label: t.nav.bottomTests, icon: ListChecks, match: (p) => p.startsWith('/assessments') },
  { href: '/universities', label: t.nav.bottomSchools, icon: GraduationCap, match: (p) => p.startsWith('/universities') },
  { href: '/profile', label: t.nav.bottomProfile, icon: UserRound, match: (p) => p.startsWith('/profile') },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label={t.nav.bottomMenu} className="fixed inset-x-0 bottom-0 z-header border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:hidden">
      <ul className="mx-auto grid h-14 max-w-xl grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const on = match(path);
          return (
            <li key={href} className="min-w-0">
              <Link href={href} aria-current={on ? 'page' : undefined} className={cn('flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring', on ? 'text-primary dark:text-secondary' : 'text-muted-foreground hover:text-foreground')}>
                <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', on && 'bg-primary/15 dark:bg-secondary/15')}><Icon className="size-5" strokeWidth={on ? 2.5 : 2} aria-hidden /></span>
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
