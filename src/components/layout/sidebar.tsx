'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/overlays';

export interface SidebarItem { href: string; label: string }

function Items({ items, onNavigate }: { items: SidebarItem[]; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <ul className="space-y-0.5">
      {items.map((n) => {
        const on = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
        return <li key={n.href}><Link href={n.href} onClick={onNavigate} aria-current={on ? 'page' : undefined} className={cn('block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground', on && 'bg-muted text-foreground shadow-[inset_3px_0_0_var(--secondary)]')}>{n.label}</Link></li>;
      })}
    </ul>
  );
}

/** Desktop: тогтмол сайдбар. Mobile: Sheet-д нээгдэх цэс. */
export function Sidebar({ items, title }: { items: SidebarItem[]; title: string }) {
  return <aside aria-label={title} className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r bg-card p-3 md:block"><Items items={items} /></aside>;
}
export function MobileSidebar({ items, title }: { items: SidebarItem[]; title: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" aria-label={title}><Menu /></Button></SheetTrigger>
      <SheetContent side="left"><SheetTitle>{title}</SheetTitle><SheetClose asChild><div><Items items={items} onNavigate={() => setOpen(false)} /></div></SheetClose></SheetContent>
    </Sheet>
  );
}
