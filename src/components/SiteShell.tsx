'use client';
import { ReactNode } from 'react';
import { BottomNav } from './layout/bottom-nav';
import { Footer } from './layout/footer';
import { Navbar } from './layout/navbar';
import { ScrollToTop } from './layout/scroll-to-top';

/** Нийтийн хуудасны хүрээ: Navbar + агуулга + Footer. Skip-link нь keyboard хэрэглэгчид зориулсан. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Үндсэн агуулга руу очих</a>
      <Navbar />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      {/* Доод цэс fixed тул контентын доод хэсгийг далдалахгүйн тулд зай үлдээнэ (lg-ээс дээш цэсгүй) */}
      <div aria-hidden className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden" />
      <BottomNav />
      <ScrollToTop />
    </div>
  );
}
