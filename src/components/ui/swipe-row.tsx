'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Swiper төст хажуу тийш гүйлгэх мөр: scrollbar харагдахгүй, мэдрэгчээр шудрана, хулгана/трекпадаар чирнэ,
 * доор нь цэгэн заагч. Агуулга (children) нь мөрийн шууд хүүхдүүд (карт) байна.
 */
export function SwipeRow({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [count, setCount] = React.useState(0);
  /** Агуулга мөрөөс давсан эсэх, зүүн/баруун төгсгөлд хүрсэн эсэх: заагч ба бүдгэрүүлэлтэд */
  const [edge, setEdge] = React.useState({ scrollable: false, atStart: true, atEnd: true });
  const drag = React.useRef({ down: false, moved: false, startX: 0, startLeft: 0 });

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    setCount(kids.length);
    if (!kids.length) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ scrollable: max > 1, atStart: el.scrollLeft <= 2, atEnd: el.scrollLeft >= max - 2 });
    if (max <= 1) return setActive(0);
    if (el.scrollLeft >= max - 2) return setActive(kids.length - 1);
    let best = 0;
    let bestDist = Infinity;
    kids.forEach((k, i) => { const d = Math.abs(k.offsetLeft - el.offsetLeft - el.scrollLeft - (parseFloat(getComputedStyle(el).paddingLeft) || 0)); if (d < bestDist) { bestDist = d; best = i; } });
    setActive(best);
  }, []);

  React.useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);

  const goTo = (i: number) => {
    const el = ref.current;
    const k = el?.children[i] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft - el.offsetLeft - (parseFloat(getComputedStyle(el).paddingLeft) || 0), behavior: 'smooth' });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { down: true, moved: false, startX: e.clientX, startLeft: ref.current?.scrollLeft ?? 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.down || !ref.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) { ref.current.style.scrollSnapType = 'none'; ref.current.scrollLeft = d.startLeft - dx; }
  };
  const end = () => {
    const d = drag.current;
    if (d.down && ref.current) ref.current.style.scrollSnapType = '';
    d.down = false;
  };
  /** Чирсний дараа тохиолдсон дарилтыг (линк рүү орох) хаана */
  const onClickCapture = (e: React.MouseEvent) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } };

  /** Карт мөрийн ирмэг дээр хатуу таслагдахгүй, бүдгэрч алга болно (гүйлгэх боломжтойг мэдэгдэнэ). */
  const L = edge.scrollable && !edge.atStart ? 'transparent 0, #000 32px' : '#000 0, #000 32px';
  const R = edge.scrollable && !edge.atEnd ? '#000 calc(100% - 32px), transparent 100%' : '#000 calc(100% - 32px), #000 100%';
  const mask = edge.scrollable ? `linear-gradient(to right, ${L}, ${R})` : undefined;
  const fade: React.CSSProperties = mask ? { maskImage: mask, WebkitMaskImage: mask } : {};

  return (
    <div>
      <div
        ref={ref}
        role="list"
        aria-label={label}
        tabIndex={0}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerLeave={end}
        onClickCapture={onClickCapture}
        style={fade}
        className={cn('-mx-4 -my-3 flex cursor-grab snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-3 [scrollbar-width:none] active:cursor-grabbing sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden', className)}
      >
        {children}
      </div>
      {count > 1 && edge.scrollable && (
        <div className="mt-4 flex justify-center gap-2" role="group" aria-label={label}>
          {Array.from({ length: count }).map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)} aria-label={`${i + 1} / ${count}`} aria-current={i === active} className={cn('h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', i === active ? 'w-6 bg-primary dark:bg-secondary' : 'w-2 bg-muted-foreground/40')} />
          ))}
        </div>
      )}
    </div>
  );
}
