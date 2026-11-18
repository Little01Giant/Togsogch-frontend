'use client';
import * as React from 'react';
import { BookOpen, Dumbbell, Lightbulb, Pencil, Wind } from 'lucide-react';
import { LogoMark, type BearAct } from '@/components/brand/logo-mark';
import { t } from '@/i18n';

const SCENES: BearAct[] = ['run', 'study', 'lift'];
const SCENE_MS = 2600;

/** Үйлдэл бүрийн чимэглэл (Lucide дүрс + CSS хөдөлгөөн) */
function Decor({ act }: { act: BearAct }) {
  if (act === 'run') {
    return (
      <>
        <span className="absolute inset-x-3 bottom-6 border-t-2 border-dashed border-muted-foreground/40" />
        {[0, -0.2, -0.4].map((d, i) => <span key={d} className="anim-speed absolute left-3 h-1 w-9 rounded-full bg-muted-foreground/40" style={{ top: `${38 + i * 14}%`, animationDelay: `${d}s` }} />)}
        <Wind className="anim-rise absolute right-3 top-3 size-7 text-muted-foreground/60" />
      </>
    );
  }
  if (act === 'study') {
    return (
      <>
        <BookOpen className="absolute bottom-0 left-1/2 size-16 -translate-x-1/2 text-primary" strokeWidth={2.25} />
        <Pencil className="anim-rise absolute bottom-3 right-2 size-8 rotate-12 text-muted-foreground" />
        <Lightbulb className="anim-twinkle absolute right-3 top-2 size-8 text-accent" />
      </>
    );
  }
  return <Dumbbell className="anim-rise absolute left-1/2 top-0 size-12 -translate-x-1/2 text-primary" strokeWidth={2.25} />;
}

/**
 * Урт үйлдлийн (жишээ нь тест дуусгах) үеийн loader: баавгай гүйнэ → хичээл хийнэ → бэлтгэл хийнэ, 2.6 секунд тутам солигдоно.
 * Дэлгэц бүхлээр дарагдаж (давхар дарахаас сэргийлнэ), `role="status"`-аар дэлгэц уншигчид мэдэгдэнэ.
 */
export function BearLoader({ title, captions }: { title?: string; captions?: readonly string[] }) {
  const L = t.assessments.loader;
  const lines = captions ?? L.captions;
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((n) => n + 1), SCENE_MS);
    return () => clearInterval(id);
  }, []);
  const act = SCENES[i % SCENES.length];
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-[100] grid place-items-center bg-background/85 p-4 backdrop-blur-sm">
      <div className="w-[min(92vw,22rem)] rounded-xl border bg-card p-6 text-center shadow-lg">
        <div key={act} className="relative mx-auto h-60 w-60">
          <Decor act={act} />
          <LogoMark body act={act} className="absolute inset-x-0 top-12 mx-auto size-40" />
        </div>
        <p className="mt-3 text-h4 font-bold">{title ?? L.title}</p>
        <p className="mt-1 min-h-12 text-body-sm text-muted-foreground">{lines[i % lines.length]}</p>
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {SCENES.map((s) => <span key={s} className={`h-1.5 rounded-full transition-all ${s === act ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`} />)}
        </div>
      </div>
    </div>
  );
}
