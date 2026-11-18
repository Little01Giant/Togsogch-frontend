import { cn } from '@/lib/utils';

/** Зөвлөмжийн drawer-д зориулсан инээмсэглэсэн чийдэн: зөөлөн хөвж, гэрэлтэж, оч гялалзана (зөвхөн тохиргооны токен, гадны зураггүй) */
export function AdviceBulb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('overflow-visible', className)} aria-hidden="true" focusable="false">
      <circle cx="60" cy="50" r="44" className="anim-glow fill-secondary/20" />
      <g className="anim-float">
        <path d="M60 14C40 14 28 28 28 44c0 12 7 19 12 26 3 4 3 8 3 12h34c0-4 0-8 3-12 5-7 12-14 12-26 0-16-12-30-32-30Z" className="fill-secondary/30 stroke-primary" strokeWidth="3" strokeLinejoin="round" />
        <rect x="44" y="86" width="32" height="8" rx="4" className="fill-primary" />
        <rect x="50" y="96" width="20" height="7" rx="3.5" className="fill-primary" />
        <circle cx="51" cy="46" r="3" className="fill-primary" />
        <circle cx="69" cy="46" r="3" className="fill-primary" />
        <circle cx="45" cy="56" r="4" className="fill-secondary/60" />
        <circle cx="75" cy="56" r="4" className="fill-secondary/60" />
        <path d="M52 57q8 8 16 0" fill="none" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M16 30v12M10 36h12" className="anim-twinkle stroke-primary" strokeWidth="3" strokeLinecap="round" />
      <path d="M106 22v10M101 27h10" className="anim-twinkle stroke-primary [animation-delay:0.7s]" strokeWidth="3" strokeLinecap="round" />
      <path d="M102 70v8M98 74h8" className="anim-twinkle stroke-primary [animation-delay:1.4s]" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
