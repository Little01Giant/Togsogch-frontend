import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/nunito';
import '@/styles/globals.css';
import { Providers } from './providers';
import { Analytics } from '@/components/analytics';
import { brand } from '@/theme/brand';
import { t } from '@/i18n';
import { THEME_COLOR } from '@/lib/constants';

export const metadata: Metadata = {
  title: { default: `${brand.name} — ${t.brand.tagline}`, template: `%s · ${brand.name}` },
  description: t.home.heroSubtitle,
};
export const viewport: Viewport = { themeColor: THEME_COLOR.dark, colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className="dark" suppressHydrationWarning>
      <body className="min-h-dvh antialiased"><Providers>{children}</Providers><Analytics /></body>
    </html>
  );
}
