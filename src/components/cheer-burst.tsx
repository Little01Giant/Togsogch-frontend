import { cn } from '@/lib/utils';

const PIECES: { x: number; y: number; tone: string; delay: string; round?: boolean }[] = [
  { x: 24, y: 6, tone: 'fill-secondary', delay: '0s' },
  { x: 48, y: 2, tone: 'fill-primary', delay: '0.5s', round: true },
  { x: 70, y: 10, tone: 'fill-warning', delay: '1s' },
  { x: 92, y: 0, tone: 'fill-info', delay: '0.25s', round: true },
  { x: 112, y: 8, tone: 'fill-secondary', delay: '0.8s' },
  { x: 134, y: 2, tone: 'fill-warning', delay: '0.1s', round: true },
  { x: 154, y: 10, tone: 'fill-primary', delay: '0.65s' },
  { x: 176, y: 4, tone: 'fill-info', delay: '1.2s', round: true },
];

/** Тест дуусгасан баярын дүрс: медаль «поп» хийж, confetti унана (зөвхөн токен, гадны зураггүй) */
export function CheerBurst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={cn('overflow-visible', className)} aria-hidden="true" focusable="false">
      {PIECES.map((p) => (
        <g key={p.x} className="anim-fall" style={{ animationDelay: p.delay }}>
          {p.round
            ? <circle cx={p.x} cy={p.y} r="3.5" className={p.tone} />
            : <rect x={p.x - 3} y={p.y - 4} width="6" height="8" rx="1.5" className={p.tone} />}
        </g>
      ))}
      <g className="anim-pop">
        <circle cx="100" cy="68" r="34" className="fill-secondary/20" />
        <circle cx="100" cy="68" r="26" className="fill-secondary/40 stroke-primary" strokeWidth="3" />
        <path d="M88 68l9 9 16-18" fill="none" className="stroke-primary" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
