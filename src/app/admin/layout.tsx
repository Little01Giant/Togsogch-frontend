'use client';
import Link from 'next/link';
import { Loading } from '@/components/common';
import { MobileSidebar, Sidebar } from '@/components/layout/sidebar';
import { ThemeToggle } from '@/components/layout/theme';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/data-display';
import { t } from '@/i18n';
import { isAdmin, useLogout, useMe } from '@/lib/auth';
import { ADMIN_NAV } from '@/features/admin/config';
import Login from '@/features/login-form';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();
  if (isLoading) return <Loading />;
  if (!me) return <Login />;
  if (!isAdmin(me)) return <div className="mx-auto max-w-lg p-6"><Alert variant="destructive" title={t.admin.title}>{t.admin.forbidden}</Alert><Button asChild variant="outline" className="mt-4"><Link href="/">{t.nav.home}</Link></Button></div>;
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-header flex h-14 items-center justify-between gap-3 bg-hero px-3 text-hero-foreground sm:px-4">
        <div className="flex items-center gap-2"><MobileSidebar items={ADMIN_NAV} title={t.admin.title} /><span className="font-bold">Чиглэл</span><span className="text-hero-muted">· {t.admin.title}</span></div>
        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="text-hero-foreground hover:bg-white/10 hover:text-hero-foreground"><Link href="/">{t.nav.home}</Link></Button>
          <span className="hidden text-body-sm text-hero-muted sm:inline">{me.email}</span>
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={logout}>{t.nav.logout}</Button>
        </div>
      </header>
      <div className="flex items-start"><Sidebar items={ADMIN_NAV} title={t.admin.title} /><main className="min-w-0 flex-1 p-4 md:p-8">{children}</main></div>
    </div>
  );
}
