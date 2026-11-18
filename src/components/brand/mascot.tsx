export type MascotMood = 'happy' | 'cheer' | 'sad' | 'think' | 'wow' | 'love' | 'wink';
export type MascotWho = 'bor' | 'tsagaan' | 'duo';

const INK = 'var(--mascot-ink)';
const LX = 60; // зүүн нүдний төв
const RX = 140; // баруун нүдний төв
const EY = 116;

/** Зүрх (нүд, чимэглэл): (x,y) төвтэй, s масштабтай */
const Heart = ({ x, y, s = 1, fill = 'var(--destructive)' }: { x: number; y: number; s?: number; fill?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 8 C-14 -4 -18 -16 -8 -19 C-3 -20 0 -16 0 -13 C0 -16 3 -20 8 -19 C18 -16 14 -4 0 8 Z" fill={fill} stroke={INK} strokeWidth={3 / s} strokeLinejoin="round" />
);

/** Нүд: төлөв бүрт өөр хэлбэр, гялбаа */
function Eyes({ mood }: { mood: MascotMood }) {
  const glint = 'var(--bear-white)';
  if (mood === 'cheer') {
    return <g fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round"><path d={`M${LX - 14} ${EY + 4} Q${LX} ${EY - 16} ${LX + 14} ${EY + 4}`} /><path d={`M${RX - 14} ${EY + 4} Q${RX} ${EY - 16} ${RX + 14} ${EY + 4}`} /></g>;
  }
  if (mood === 'love') return <g className="mascot-beat"><Heart x={LX} y={EY - 2} s={0.9} /><Heart x={RX} y={EY - 2} s={0.9} /></g>;
  if (mood === 'wow') {
    return (
      <g>
        {[LX, RX].map((x) => (<g key={x}><circle cx={x} cy={EY} r="14" fill={glint} stroke={INK} strokeWidth="4" /><circle cx={x} cy={EY + 1} r="7" fill={INK} /><circle cx={x + 2.5} cy={EY - 2} r="2.6" fill={glint} /></g>))}
      </g>
    );
  }
  if (mood === 'think') {
    // нүд дээш-баруун тийш харна
    return (
      <g>
        {[LX, RX].map((x) => (<g key={x}><ellipse cx={x + 3} cy={EY - 2} rx="9" ry="11.5" fill={INK} /><circle cx={x + 6} cy={EY - 7} r="3.6" fill={glint} /></g>))}
      </g>
    );
  }
  if (mood === 'sad') {
    // том, нойтон нүд (хоёр гялбаа)
    return (
      <g>
        {[LX, RX].map((x) => (<g key={x}><ellipse cx={x} cy={EY + 2} rx="10.5" ry="13" fill={INK} /><circle cx={x + 3.5} cy={EY - 3} r="4.4" fill={glint} /><circle cx={x - 3.5} cy={EY + 7} r="2.2" fill={glint} /></g>))}
      </g>
    );
  }
  const open = (x: number) => (
    <g key={x}><ellipse cx={x} cy={EY} rx="8" ry="10.5" fill={INK} /><circle cx={x + 3} cy={EY - 5} r="3.8" fill={glint} /><circle cx={x - 3} cy={EY + 4} r="1.8" fill={glint} /></g>
  );
  if (mood === 'wink') {
    return <g>{open(RX)}<path d={`M${LX - 13} ${EY + 3} Q${LX} ${EY - 13} ${LX + 13} ${EY + 3}`} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" /></g>;
  }
  return <g>{open(LX)}{open(RX)}</g>;
}

/** Хөмсөг: сэтгэл хөдлөлийг тодруулна */
function Brows({ mood }: { mood: MascotMood }) {
  const p = { stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round' as const, fill: 'none' };
  if (mood === 'sad') return <g {...p}><path d="M44 100 L76 86" /><path d="M156 100 L124 86" /></g>;
  if (mood === 'think') return <g {...p}><path d="M46 84 Q62 74 80 82" /><path d="M120 92 L152 90" /></g>;
  if (mood === 'wow') return <g {...p}><path d="M48 80 Q64 68 80 80" /><path d="M120 80 Q136 68 152 80" /></g>;
  if (mood === 'happy' || mood === 'wink') return <g {...p} strokeWidth={4}><path d="M50 90 Q64 84 78 90" opacity="0.7" /><path d="M122 90 Q136 84 150 90" opacity="0.7" /></g>;
  return null;
}

/** Ам */
function Mouth({ mood }: { mood: MascotMood }) {
  const line = { fill: 'none', stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round' as const };
  if (mood === 'cheer' || mood === 'wink') {
    return (
      <g>
        <path d="M84 132 Q100 166 116 132 Z" fill={INK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M92 150 Q100 160 108 150 Q100 143 92 150 Z" fill="var(--mascot-pink)" />
      </g>
    );
  }
  if (mood === 'wow') return <ellipse cx="100" cy="146" rx="8" ry="11" fill={INK} />;
  if (mood === 'sad') return <path d="M88 148 Q94 138 100 144 Q106 138 112 148" {...line} />;
  if (mood === 'think') return <path d="M92 142 Q100 138 108 144" {...line} />;
  return <path d="M100 128 Q100 140 90 140 M100 128 Q100 140 110 140" {...line} />; // happy, love: «ω»
}

/** Нэг баавгайн толгой (200×190 хүрээнд). Өнгө нь globals.css-ийн --bear-* токенээс. */
function Bear({ kind, mood }: { kind: 'bor' | 'tsagaan'; mood: MascotMood }) {
  const brown = kind === 'bor';
  const fur = brown ? 'var(--bear-brown)' : 'var(--bear-white)';
  const ear = brown ? fur : INK;
  const inner = 'var(--bear-brown-inner)';
  const cheek = brown ? 'var(--bear-brown-cheek)' : 'var(--mascot-pink)';
  const blush = mood === 'love' || mood === 'cheer' ? 1 : 0.8;
  const blinks = mood === 'happy' || mood === 'wow' || mood === 'think' || mood === 'sad';
  return (
    <g>
      <ellipse cx="100" cy="226" rx="58" ry="6" fill={INK} opacity="0.14" />
      <g className={brown ? 'mascot-bob' : 'mascot-bob-late'}>
      {/* жижиг хавтгай бие: гар, хөл, хэвлий (толгойн ард) */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round" fill={fur}>
        <ellipse cx="72" cy="218" rx="19" ry="9" /><ellipse cx="128" cy="218" rx="19" ry="9" />
        <rect x="56" y="140" width="88" height="76" rx="34" />
        <circle cx="50" cy="186" r="13" /><circle cx="150" cy="186" r="13" />
        <ellipse cx="100" cy="190" rx="21" ry="17" fill={brown ? inner : 'var(--bear-white-inner)'} opacity="0.9" stroke="none" />
      </g>
      {/* жижиг дугуй чихнүүд (толгойн дээд булан) */}
      <g className="mascot-ear"><circle cx="48" cy="52" r="19" fill={ear} stroke={INK} strokeWidth="5" /><circle cx="48" cy="54" r="8.5" fill={brown ? inner : 'var(--bear-white-inner)'} opacity={brown ? 1 : 0.25} /></g>
      <g className="mascot-ear" style={{ animationDelay: '-3s' }}><circle cx="152" cy="52" r="19" fill={ear} stroke={INK} strokeWidth="5" /><circle cx="152" cy="54" r="8.5" fill={brown ? inner : 'var(--bear-white-inner)'} opacity={brown ? 1 : 0.25} /></g>
      {/* толгой: «Бор» — зөөлөн дөрвөлжин; «Цас» — хацар нь бөндгөр */}
      {brown ? (
        <rect x="14" y="42" width="172" height="128" rx="64" ry="58" fill={fur} stroke={INK} strokeWidth="5" />
      ) : (
        <path d="M62 44 H138 C164 44 180 60 182 82 C196 98 198 130 186 148 C174 170 146 172 100 172 C54 172 26 170 14 148 C2 130 4 98 18 82 C20 60 36 44 62 44 Z" fill={fur} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      )}
      {/* төгсөх малгай (хүрэн баавгай) */}
      {brown && (
        <g strokeLinejoin="round">
          <polygon points="100,6 154,24 100,42 46,24" fill="var(--brand-foreground)" stroke={INK} strokeWidth="4" />
          <path d="M70 34 V50 Q100 62 130 50 V34" fill="var(--brand-foreground)" stroke={INK} strokeWidth="4" />
          <path d="M150 26 V58" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="150" cy="61" r="5" fill="var(--accent)" stroke={INK} strokeWidth="2.5" />
        </g>
      )}
      <Brows mood={mood} />
      <g className={blinks ? (brown ? 'mascot-blink' : 'mascot-blink-late') : undefined}><Eyes mood={mood} /></g>
      {/* шил (цагаан баавгай) */}
      {!brown && (
        <g fill="none" stroke={INK} strokeWidth="4">
          <circle cx={LX} cy={EY} r="19" /><circle cx={RX} cy={EY} r="19" /><path d="M83 110 Q100 102 117 110" strokeLinecap="round" />
        </g>
      )}
      {/* хацар: инээхэд улам улайна */}
      <ellipse cx={brown ? 38 : 34} cy={brown ? 136 : 138} rx={brown ? 16 : 20} ry={brown ? 12 : 16} fill={cheek} opacity={blush} />
      <ellipse cx={brown ? 160 : 164} cy={brown ? 136 : 138} rx={brown ? 16 : 20} ry={brown ? 12 : 16} fill={cheek} opacity={blush} />
      {/* нулимс (гунигтай үед) */}
      {mood === 'sad' && <path d="M52 128 Q46 140 52 146 Q58 140 52 128 Z" fill="var(--bear-white)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />}
      {/* хоншоор (цайвар хэсэг) ба үсний гялбаа */}
      <ellipse cx="100" cy="138" rx="27" ry="19" fill={brown ? 'var(--bear-brown-inner)' : 'var(--bear-white-inner)'} opacity={brown ? 0.85 : 0.6} />
      {/* хамар, ам */}
      <ellipse cx="100" cy="128" rx="5.5" ry="4" fill={INK} />
      <Mouth mood={mood} />
      {/* нэмэлт тэмдэг: бодох үед «?», баярлахад оч */}
      {mood === 'think' && <text className="anim-float" x="164" y="40" fontSize="34" fontWeight="800" fill="var(--accent)" stroke={INK} strokeWidth="1.5" paintOrder="stroke">?</text>}
      {mood === 'cheer' && (
        <g fill="var(--accent)" stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path className="anim-twinkle" d="M172 26 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" /><path className="anim-twinkle" style={{ animationDelay: '-1s' }} d="M24 20 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" />
        </g>
      )}
      </g>
    </g>
  );
}

/**
 * «Temuul»-ийн дүрүүд — хоёр баавгай: «Бор» (хүрэн, төгсөх малгайтай) ба «Цас» (цагаан, шилтэй).
 * who: 'duo' — хоёулаа (нүүр, амжилт) · 'bor' / 'tsagaan' — ганцаараа. Өгөхгүй бол төлөвөөс сонгоно:
 * sad → Бор, think → Цас, бусад → хоёулаа. mood2 — хоёр дахь баавгайн (Цас) өөр мимик (жишээ нь Бор баярлахад Цас нүдээ ирмэнэ).
 * Төлөвүүд: happy · cheer · sad · think · wow · love · wink. Чимэглэл тул дэлгэц уншигчид нууна.
 */
export function Mascot({ mood = 'happy', mood2, who, className }: { mood?: MascotMood; mood2?: MascotMood; who?: MascotWho; className?: string }) {
  const pick: MascotWho = who ?? (mood === 'sad' ? 'bor' : mood === 'think' ? 'tsagaan' : 'duo');
  if (pick === 'duo') {
    return (
      <svg viewBox="0 0 330 222" className={className} aria-hidden focusable="false">
        <g transform="scale(0.92)"><Bear kind="bor" mood={mood} /></g>
        <g transform="translate(146 6) scale(0.92)"><Bear kind="tsagaan" mood={mood2 ?? mood} /></g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 232" className={className} aria-hidden focusable="false">
      <Bear kind={pick} mood={mood} />
    </svg>
  );
}
