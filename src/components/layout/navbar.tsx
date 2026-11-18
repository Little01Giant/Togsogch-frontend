'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as NavMenu from '@radix-ui/react-navigation-menu';
import { ChevronDown, ChevronRight, LayoutDashboard, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { t } from '@/i18n';
import { brand } from '@/theme/brand';
import { LogoMark } from '@/components/brand/logo-mark';
import { isAdmin, useLogout, useMe } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Sheet, SheetContent, SheetClose, SheetTitle, SheetTrigger } from '@/components/ui/overlays';
import { PageContainer } from './page-container';
import { ThemeToggle } from './theme';

export const NAV_GROUPS = [
  { title: 'Тест өгөх', links: [{ href: '/assessments/career', label: t.nav.career }, { href: '/assessments/masters', label: t.nav.masters }, { href: '/assessments/city', label: t.nav.city }] },
  { title: 'Судлах', links: [{ href: '/countries', label: t.nav.countries }, { href: '/universities', label: t.nav.universities }, { href: '/future-careers', label: t.nav.futureCareers }] },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={brand.name} className={cn('flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}>
      <LogoMark className="size-10" />
      <span className="text-[19px] font-bold tracking-tight text-foreground">{brand.name}</span>
    </Link>
  );
}

const triggerCls = 'group inline-flex h-10 items-center gap-1 rounded-md px-3.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted';

function UserMenu() {
  const { data: me } = useMe();
  const logout = useLogout();
  if (!me) return <Button asChild size="sm"><Link href="/login">{t.nav.login}</Link></Button>;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2"><Avatar className="size-7"><AvatarImage src={me.picture} alt="" /><AvatarFallback>{me.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar><span className="hidden sm:inline">{me.name.split(' ')[0]}</span></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><Link href="/profile"><LayoutDashboard />{t.s.profile.title}</Link></DropdownMenuItem>
        {isAdmin(me) && <DropdownMenuItem asChild><Link href="/admin"><ShieldCheck />{t.nav.admin}</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()}><LogOut />{t.nav.logout}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Гар утас/таблет: Sheet-д суурилсан цэс */
export function MobileNav() {
  const path = usePathname();
  const [open, setOpen] = React.useState(false);
  const { data: me } = useMe();
  const logout = useLogout();
  const active = (h: string) => path.startsWith(h);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label={t.nav.menu}><Menu /></Button></SheetTrigger>
      <SheetContent side="right">
        <SheetTitle className="sr-only">{t.nav.menu}</SheetTitle>
        <Logo />
        {me && (
          <SheetClose asChild>
            <Link href="/profile" className="-mx-2 flex items-center gap-3 rounded-lg border bg-muted/50 p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-10 shrink-0"><AvatarImage src={me.picture} alt="" /><AvatarFallback>{me.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{me.name}</span><span className="block truncate text-caption text-muted-foreground">{me.email}</span></span>
              <ChevronRight className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </SheetClose>
        )}
        <nav aria-label={t.nav.menu} className="-mx-2 flex flex-col gap-4">
          <SheetClose asChild><Link href="/" className={cn('rounded-md px-3 py-3 text-sm font-medium hover:bg-muted', path === '/' && 'bg-muted')}>{t.nav.home}</Link></SheetClose>
          {NAV_GROUPS.map((g) => (
            <div key={g.title}><p className="px-3 pb-1 text-caption font-medium text-muted-foreground" aria-hidden>{g.title}</p>
              <div className="ml-3 border-l pl-1">{g.links.map((l) => <SheetClose asChild key={l.href}><Link href={l.href} aria-current={active(l.href) ? 'page' : undefined} className={cn('block rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted', active(l.href) && 'bg-muted text-primary dark:text-secondary')}>{l.label}</Link></SheetClose>)}</div></div>
          ))}
          {isAdmin(me) && <SheetClose asChild><Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium hover:bg-muted"><ShieldCheck className="size-4" aria-hidden />{t.nav.admin}</Link></SheetClose>}
        </nav>
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-auto border-t bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {me ? <Button variant="outline" className="w-full" onClick={() => { setOpen(false); logout(); }}><LogOut />{t.nav.logout}</Button> : <SheetClose asChild><Button asChild className="w-full"><Link href="/login">{t.nav.login}</Link></Button></SheetClose>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const path = usePathname();
  const homeActive = path === '/';
  return (
    <header className="sticky top-0 z-header border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo />
          <NavMenu.Root className="relative hidden lg:block" aria-label="Үндсэн цэс">
            <NavMenu.List className="flex items-center gap-1">
              <NavMenu.Item><NavMenu.Link asChild active={homeActive}><Link href="/" className={cn(triggerCls, homeActive && 'bg-success-soft text-success-soft-foreground font-bold')}>{t.nav.home}</Link></NavMenu.Link></NavMenu.Item>
              {NAV_GROUPS.map((g) => {
                const on = g.links.some((l) => path.startsWith(l.href));
                return (
                  <NavMenu.Item key={g.title} className="relative">
                    <NavMenu.Trigger className={cn(triggerCls, on && 'text-foreground')}>{g.title}<ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden />{on && <span className="absolute inset-x-3.5 -bottom-[13px] h-0.5 rounded-full bg-secondary" aria-hidden />}</NavMenu.Trigger>
                    <NavMenu.Content className="absolute left-0 top-full z-overlay mt-1.5 w-60 rounded-lg border bg-popover p-1.5 shadow-md data-[motion=from-end]:animate-in data-[motion=from-end]:fade-in-0 data-[motion=from-start]:animate-in data-[motion=from-start]:fade-in-0">
                      {g.links.map((l) => <NavMenu.Link asChild key={l.href} active={path.startsWith(l.href)}><Link href={l.href} className="block rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted data-[active]:bg-muted data-[active]:font-semibold">{l.label}</Link></NavMenu.Link>)}
                    </NavMenu.Content>
                  </NavMenu.Item>
                );
              })}
            </NavMenu.List>
          </NavMenu.Root>
          <div className="flex items-center gap-1.5"><ThemeToggle /><UserMenu /><MobileNav /></div>
        </div>
      </PageContainer>
    </header>
  );
}
