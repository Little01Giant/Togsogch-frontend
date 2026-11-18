import { cn } from '@/lib/utils';

/**
 * «Temuul» брэндийн дүр ба тэмдэг: бие нь өөрөө дугуй булантай дөрвөлжин «Бор» баавгай (төгсөх малгайтай).
 * Тэмдэг (navbar, favicon) болон дүр (нүүр, алдаа, хоосон төлөв) нэг хэлбэр. Өнгө бүхэн globals.css-ийн токенээс.
 * Хуучин луужин: `logo-mark-compass.tsx.txt`, `public/brand/`.
 */
/** `act` — зөвхөн `body`-той үед: баавгайн үйлдэл (globals.css `bear-act-*`): run — гүйх, study — хичээл хийх, lift — бэлтгэл хийх. */
export type BearAct = 'run' | 'study' | 'lift';

export function LogoMark({ className, title, body = false, act }: { className?: string; title?: string; body?: boolean; act?: BearAct }) {
  return (
    <svg viewBox={body ? '-30 0 260 238' : '0 0 200 200'} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={cn('shrink-0', body && act && `bear-act-${act}`, className)}>
      {/* гар (биеийн ард, дээш өргөсөн) ба хөл (биеэс тусдаа хөвсөн) — зөвхөн body үед */}
      {body && (
        <g>
          <g className="bear-arm-l"><rect x="-18" y="96" width="40" height="76" rx="20" fill="var(--bear-brown)" transform="rotate(32 2 134)" /></g>
          <g className="bear-arm-r"><rect x="178" y="96" width="40" height="76" rx="20" fill="var(--bear-brown)" transform="rotate(-32 198 134)" /></g>
          <g className="bear-foot-l"><rect x="44" y="206" width="52" height="26" rx="13" fill="var(--bear-brown-cheek)" transform="rotate(-14 70 219)" /></g>
          <g className="bear-foot-r"><rect x="104" y="206" width="52" height="26" rx="13" fill="var(--bear-brown-cheek)" transform="rotate(14 130 219)" /></g>
        </g>
      )}
      {/* чихнүүд */}
      <circle cx="40" cy="36" r="26" fill="var(--bear-brown)" /><circle cx="40" cy="38" r="12" fill="var(--bear-brown-inner)" />
      <circle cx="160" cy="36" r="26" fill="var(--bear-brown)" /><circle cx="160" cy="38" r="12" fill="var(--bear-brown-inner)" />
      {/* дөрвөлжин бие */}
      <rect x="6" y="28" width="188" height="166" rx="62" fill="var(--bear-brown)" />
      {/* нүд */}
      <ellipse cx="66" cy="108" rx="22" ry="26" fill="var(--bear-white)" /><ellipse cx="134" cy="108" rx="22" ry="26" fill="var(--bear-white)" />
      <ellipse cx="70" cy="112" rx="11" ry="15" fill="var(--mascot-ink)" /><ellipse cx="130" cy="112" rx="11" ry="15" fill="var(--mascot-ink)" />
      <circle cx="74" cy="105" r="4.5" fill="var(--bear-white)" /><circle cx="134" cy="105" r="4.5" fill="var(--bear-white)" />
      {/* хацар, хоншоор, хамар, ам */}
      <ellipse cx="34" cy="148" rx="14" ry="10" fill="var(--bear-brown-cheek)" /><ellipse cx="166" cy="148" rx="14" ry="10" fill="var(--bear-brown-cheek)" />
      <ellipse cx="100" cy="152" rx="34" ry="24" fill="var(--bear-brown-inner)" />
      <ellipse cx="100" cy="142" rx="9" ry="6.5" fill="var(--mascot-ink)" />
      <path d="M100 148 Q100 162 86 162 M100 148 Q100 162 114 162" fill="none" stroke="var(--mascot-ink)" strokeWidth="5" strokeLinecap="round" />
      {/* төгсөх малгай */}
      <polygon points="100,2 160,22 100,46 40,22" fill="var(--brand-foreground)" />
      <path d="M68 36 V56 Q100 68 132 56 V36" fill="var(--brand-foreground)" />
      <path d="M154 26 V62" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" /><circle cx="154" cy="66" r="6" fill="var(--accent)" />
    </svg>
  );
}
