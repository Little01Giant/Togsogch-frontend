'use client';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Annoyed, Frown, Laugh, ListChecks, Meh, Save, Smile } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { EmptyState, ErrorState, Loading } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/data-display';
import { notify } from '@/components/ui/misc';
import { AssessmentNav, AssessmentProgress } from '@/components/assessment/assessment-progress';
import { Cheer, CheerModal } from '@/components/assessment/cheer-modal';
import { BearLoader } from '@/components/brand/bear-loader';
import { type AnswerValue, Question, QuestionCard } from '@/components/assessment/question-card';
import { RequireUser } from '@/features/consent';

interface Q extends Question { showIf?: { questionKey: string; equals: string | number } }
interface Def { key: string; title: string; subtitle?: string; version: number; sections: { key: string; title: string; description?: string }[]; questions: Q[] }
type Answers = Record<string, AnswerValue>;

const visible = (q: Q, a: Answers) => {
  if (!q.showIf?.questionKey) return true;
  const v = a[q.showIf.questionKey];
  return Array.isArray(v) ? (v as (string | number)[]).includes(q.showIf.equals) : v === q.showIf.equals;
};
const GUIDE_FACES = [Frown, Annoyed, Meh, Smile, Laugh];
const empty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);

function Runner({ assessmentKey }: { assessmentKey: string }) {
  const router = useRouter();
  const def = useQuery<Def>({ queryKey: ['assessment-active', assessmentKey], queryFn: () => api(`/assessments/${assessmentKey}/active`), retry: false });
  const history = useQuery<{ id: string; assessmentKey: string }[]>({ queryKey: ['attempts'], queryFn: () => api('/attempts') });
  const previous = history.data?.find((a) => a.assessmentKey === assessmentKey); // шинэ нь эхэндээ
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(-1); // -1 → танилцуулга
  const [cheerMsg, setCheerMsg] = useState<Cheer | null>(null);
  const [guided, setGuided] = useState(false); // 1–5 онооны тайлбарыг үзсэн эсэх
  const [showInvalid, setShowInvalid] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = useRef<Answers>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const start = useMutation({
    mutationFn: () => api<{ id: string; answers: Answers }>(`/assessments/${assessmentKey}/attempts`, { method: 'POST' }),
    onSuccess: (r) => { setAttemptId(r.id); setAnswers(r.answers ?? {}); setStep(0); },
  });
  const flush = async (id = attemptId) => {
    if (!id || !Object.keys(dirty.current).length) return;
    const batch = dirty.current; dirty.current = {};
    setSaving(true);
    try { await api(`/attempts/${id}/answers`, { method: 'PUT', body: { answers: batch } }); }
    catch (e) { dirty.current = { ...batch, ...dirty.current }; throw e; }
    finally { setSaving(false); }
  };
  const submit = useMutation({
    mutationFn: async () => { await flush(); await api(`/attempts/${attemptId}/submit`, { method: 'POST' }); },
    onSuccess: () => router.push(`/assessments/${assessmentKey}/result/${attemptId}`),
    onError: (e: Error) => notify({ color: 'red', message: e.message }),
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  const sections = def.data?.sections ?? [];
  const byStep = useMemo(() => sections.map((s) => (def.data?.questions ?? []).filter((q) => q.section === s.key)), [def.data, sections]);
  const setAnswer = (k: string, v: AnswerValue) => {
    setAnswers((a) => ({ ...a, [k]: v }));
    dirty.current[k] = v;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flush().catch(() => notify({ color: 'orange', message: t.errors.network })), 700);
  };

  if (def.isLoading) return <Loading />;
  if (def.error) return <PageContainer size="narrow" className="py-8 md:py-12"><EmptyState title={t.assessments.comingSoon} hint={(def.error as Error).message} /></PageContainer>;
  const d = def.data!;
  const total = d.questions.filter((q) => visible(q, answers)).length;
  const done = d.questions.filter((q) => visible(q, answers) && !empty(answers[q.key])).length;

  if (step === -1) {
    return (
      <PageContainer size="narrow" className="py-8 md:py-12"><Card className="grid gap-5 p-6 sm:p-8">
        <div className="min-w-0"><h1 className="text-h2">{t.assessments.names[d.key]?.title ?? d.title}</h1>{(t.assessments.names[d.key]?.subtitle ?? d.subtitle) && <p className="mt-1 text-body-sm text-muted-foreground">{t.assessments.names[d.key]?.subtitle ?? d.subtitle}</p>}</div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-sm text-muted-foreground">
          <li className="flex items-center gap-1.5"><ListChecks className="size-4" aria-hidden />{total} {t.assessments.questions}</li>
          <li className="flex items-center gap-1.5"><Save className="size-4" aria-hidden />{t.assessments.autosave}</li>
        </ul>
        <p className="rounded-md bg-muted p-3.5 text-body-sm text-muted-foreground"><span><strong className="font-semibold text-foreground">{t.assessments.disclaimerTitle}.</strong> {d.key === 'persona' ? t.persona.funNote : d.key === 'thinking' ? t.thinking.note : t.assessments.intro}</span></p>
        {start.error && <ErrorState error={start.error} />}
        <div className="grid gap-2.5">
          <Button size="lg" fullWidth loading={start.isPending} onClick={() => start.mutate()}>{previous ? t.assessments.startNew : t.assessments.start}</Button>
          {previous && (
            <Button asChild size="lg" variant="outline" fullWidth data-testid="view-previous">
              <Link href={`/assessments/${assessmentKey}/result/${previous.id}`}>{t.assessments.viewPrevious}</Link>
            </Button>
          )}
        </div>
      </Card></PageContainer>
    );
  }

  if (!guided && d.questions.some((q) => q.type === 'likert' || q.type === 'rating')) { // 1–5 онооны заавар: зөвхөн онооны асуулттай тестэд
    const G = t.assessments;
    return (
      <PageContainer size="narrow" className="py-8 md:py-12"><Card className="grid gap-5 p-6 sm:p-8">
        <h1 className="text-h2">{G.guideTitle}</h1>
        <p className="text-body-sm text-muted-foreground">{G.guideIntro}</p>
        <div className="rounded-md bg-muted p-4" aria-hidden>
          <div className="flex justify-between gap-2">{GUIDE_FACES.map((Face, i) => <span key={i} className="flex flex-col items-center gap-1.5"><span className="grid size-11 place-items-center rounded-full border bg-card text-muted-foreground"><Face className="size-6" /></span><span className="text-label">{i + 1}</span></span>)}</div>
          <div className="mt-2 flex justify-between gap-4 text-caption text-muted-foreground"><span>{G.guideLow}</span><span className="text-right">{G.guideHigh}</span></div>
        </div>
        <ul className="grid list-disc gap-1.5 pl-5 text-body-sm text-muted-foreground">{G.guideTips.map((x) => <li key={x}>{x}</li>)}</ul>
        <Button size="lg" fullWidth onClick={() => { setGuided(true); window.scrollTo({ top: 0 }); }}>{G.guideOk}</Button>
      </Card></PageContainer>
    );
  }

  const section = sections[step];
  const qs = (byStep[step] ?? []).filter((q) => visible(q, answers));
  const missing = qs.filter((q) => q.required && empty(answers[q.key])).map((q) => q.key);
  const last = step === sections.length - 1;
  const base = byStep.slice(0, step).reduce((n, g) => n + g.filter((q) => visible(q, answers)).length, 0);

  const cheer = () => {
    const doneSections = step + 1;
    const C = t.assessments.cheer;
    const pool = sections.length - doneSections === 1 ? C.almost : doneSections / sections.length < 0.5 ? C.good : C.keepGoing;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCheerMsg({ emoji: pick.emoji, text: pick.text, sub: C.sectionsDone.replace('{done}', String(doneSections)).replace('{total}', String(sections.length)) });
  };

  const next = () => {
    if (missing.length) { setShowInvalid(true); notify({ color: 'orange', message: t.assessments.incomplete }); document.querySelector(`[data-testid="q-${missing[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setShowInvalid(false);
    if (last) submit.mutate(); else { setStep(step + 1); window.scrollTo({ top: 0 }); cheer(); }
  };

  return (
    <PageContainer size="narrow" className="grid gap-4 py-4">
      <CheerModal cheer={cheerMsg} onClose={() => setCheerMsg(null)} />
      {(submit.isPending || submit.isSuccess) && <BearLoader />}
      <AssessmentProgress section={section.title} step={step} steps={sections.length} answered={done} total={total} saving={saving} />
      <div className="grid gap-3">{qs.map((q, i) => <QuestionCard key={q.key} q={q} index={base + i + 1} value={answers[q.key]} onChange={(v) => setAnswer(q.key, v)} invalid={showInvalid && missing.includes(q.key)} />)}</div>
      <AssessmentNav onPrev={() => { setStep(step - 1); window.scrollTo({ top: 0 }); }} onNext={next} prevDisabled={step === 0} nextLabel={last ? t.assessments.finish : t.common.next} loading={submit.isPending} />
    </PageContainer>
  );
}

export default function AssessmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  return <RequireUser>{() => <Runner assessmentKey={key} />}</RequireUser>;
}
