import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/nunito';
import '@/styles/globals.css';
import { Providers } from './providers';
import { brand } from '@/theme/brand';
import { t } from '@/i18n';
import { THEME_COLOR } from '@/lib/constants';

export const metadata: Metadata = {
  title: { default: `${brand.name} — ${t.brand.tagline}`, template: `%s · ${brand.name}` },
  description: t.home.heroSubtitle,
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: THEME_COLOR.light }, { media: '(prefers-color-scheme: dark)', color: THEME_COLOR.dark }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className="min-h-dvh antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
