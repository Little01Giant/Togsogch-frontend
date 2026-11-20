'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Хуудас солигдоход (замын өөрчлөлт) дээд талаас нь эхлүүлнэ. Next-ийн өөрийн scroll reset нь богино хуудас руу шилжихэд
 * (жишээ нь урт жагсаалтаас тестийн танилцуулга руу) өмнөх байрлалыг хэвээр үлдээж, хэрэглэгч доод талын footer дээр гарч ирдэг байсан.
 * `#hash` бүхий холбоос болон зөвхөн query (шүүлтүүр, хуудаслалт) өөрчлөгдөхөд оролцохгүй.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
