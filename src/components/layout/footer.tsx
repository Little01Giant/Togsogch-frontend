import Link from 'next/link';
import { t } from '@/i18n';
import { brand } from '@/theme/brand';
import { Separator } from '@/components/ui/data-display';
import { Logo, NAV_GROUPS } from './navbar';
import { PageContainer } from './page-container';

export function Footer() {
  return (
    <footer className="border-t bg-card pt-10 pb-8">
      <PageContainer>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16">
          <div className="space-y-3"><Logo /><p className="text-body-sm font-medium italic text-foreground/80">«{t.brand.slogan}»</p><p className="text-body-sm text-muted-foreground">{t.home.footerNote}</p></div>
          {NAV_GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title} className="space-y-2"><p className="text-label">{g.title}</p>
              <ul className="space-y-1.5">{g.links.map((l) => <li key={l.href}><Link href={l.href} className="text-body-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link></li>)}</ul></nav>
          ))}
        </div>
        <Separator className="my-6" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-muted-foreground">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span className="flex gap-5"><Link href="/privacy" className="hover:text-foreground">{t.legal.privacyTitle}</Link><Link href="/terms" className="hover:text-foreground">{t.legal.termsTitle}</Link></span>
        </div>
      </PageContainer>
    </footer>
  );
}
