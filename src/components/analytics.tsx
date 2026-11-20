'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

/** Microsoft Clarity төслийн ID (нийтэд харагддаг, нууц биш). Өөр төсөл рүү шилжихэд NEXT_PUBLIC_CLARITY_ID-ээр солино. */
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? 'zgqxdjq458';

/**
 * Microsoft Clarity: зөвхөн production-д ачаалж (хөгжүүлэлт/тестийн өгөгдөл бохирдохгүй),
 * админы хуудсанд (хэрэглэгчийн имэйл, төлбөр харагддаг) огт ачаалахгүй.
 */
export function Analytics() {
  const path = usePathname();
  if (process.env.NODE_ENV !== 'production' || !CLARITY_ID || path.startsWith('/admin')) return null;
  return (
    <Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}</Script>
  );
}
