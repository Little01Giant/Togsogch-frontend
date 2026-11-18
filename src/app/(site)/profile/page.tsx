'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, Briefcase, CheckCircle2, ChevronRight, GraduationCap, Globe2, Languages, ListChecks, Lock, MapPin, Sparkles, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { fmtDate, t } from '@/i18n';
import { Flag, StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Badge, Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/overlays';
import { RequireUser } from '@/features/consent';
import { mnt } from '@/features/paywall';
import type { Me } from '@/lib/auth';

const P = t.s.profile;
/** Зөвхөн хөгжүүлэлт: `NEXT_PUBLIC_UI_PREVIEW=true` үед «Нээсэн сургуулиуд», «Төлбөрийн түүх» хоосон бол дизайныг жишээ мөртэй харуулна (`/profile?preview=off` — унтраана). Production-д ямар ч үед идэвхгүй. */
const UI_PREVIEW = process.env.NEXT_PUBLIC_UI_PREVIEW === 'true';
const PREVIEW_UNIS = [
  { slug: 'preview-1', name: 'Жишээ сургууль 1', city: 'Жишээ хот', country: { code: 'DE', nameMn: 'Жишээ улс' }, logoUrl: '' },
  { slug: 'preview-2', name: 'Жишээ сургууль 2', city: '', country: { code: 'KR', nameMn: 'Жишээ улс' }, logoUrl: '' },
  { slug: 'preview-3', name: 'Жишээ сургууль 3 (нэр урт тохиолдлыг шалгах зорилготой жишээ)', city: 'Жишээ хот', country: { code: 'JP', nameMn: 'Жишээ улс' }, logoUrl: '' },
];
const PAY_ROW = 'grid grid-cols-[1fr_5.5rem_6rem] items-center gap-x-2 px-3 py-3';
const PREVIEW_COUNTRIES = [{ slug: 'preview-country', nameMn: 'Жишээ улс', code: 'KR' }];
const PREVIEW_PAYMENTS = [
  { id: 'preview-p1', productKey: 'country_access', amount: 5000, currency: 'MNT', status: 'paid', createdAt: '2026-11-03T09:00:00Z', paidAt: '2026-11-03T09:02:00Z' },
  { id: 'preview-p2', productKey: 'test_result', amount: 9900, currency: 'MNT', status: 'paid', createdAt: '2026-11-02T12:30:00Z', paidAt: '2026-11-02T12:31:00Z' },
  { id: 'preview-p3', productKey: 'university_access', amount: 1000, currency: 'MNT', status: 'pending', createdAt: '2026-11-01T15:10:00Z', paidAt: null },
  { id: 'preview-p4', productKey: 'university_access', amount: 1000, currency: 'MNT', status: 'expired', createdAt: '2026-10-30T08:00:00Z', paidAt: null },
];
const TEST_TITLE: Record<string, string> = { career: t.nav.career, masters: t.nav.masters, language: t.nav.language, city: t.nav.city, persona: t.assessments.names.persona.title, thinking: t.assessments.names.thinking.title };
const TEST_ICON: Record<string, LucideIcon> = { career: Briefcase, city: MapPin, language: Languages, masters: GraduationCap, persona: Sparkles, thinking: Brain };
const Block = ({ title, icon: Icon, children }: { title?: string; icon?: React.ElementType; children: React.ReactNode }) => (
  <Card className="p-3 sm:p-6">{title && <h2 className="mb-3 flex items-center gap-2 text-h3">{Icon && <Icon className="size-5 text-muted-foreground" aria-hidden />}{title}</h2>}{children}</Card>
);

function ProfileInner({ me }: { me: Me }) {
  const attempts = useQuery<any[]>({ queryKey: ['attempts'], queryFn: () => api('/attempts') });
  const payments = useQuery<any[]>({ queryKey: ['payments-me'], queryFn: () => api('/payments/me') });
  const access = useQuery<{ unlocked: any[]; countries: any[] }>({ queryKey: ['access'], queryFn: () => api('/users/me/access') });
  const assessments = useQuery<{ key: string; title: string; subtitle: string; available: boolean }[]>({ queryKey: ['assessments'], queryFn: () => api('/assessments') });
  /** Одоогоор нээлттэй, гэхдээ хэрэглэгч нэг ч удаа өгөөгүй тестүүд. */
  const takenKeys = new Set(attempts.data?.map((a) => a.assessmentKey));
  const todo = attempts.isSuccess ? (assessments.data ?? []).filter((a) => a.available && !takenKeys.has(a.key)) : [];

  const [preview, setPreview] = useState(false);
  useEffect(() => { if (UI_PREVIEW) setPreview(new URLSearchParams(window.location.search).get('preview') !== 'off'); }, []);
  const previewUnis = preview && !access.data?.unlocked.length && !access.data?.countries.length;
  const previewPay = preview && !payments.data?.length;
  const unlockedUnis: any[] | undefined = previewUnis ? PREVIEW_UNIS : access.data?.unlocked;
  const unlockedCountries: any[] | undefined = previewUnis ? PREVIEW_COUNTRIES : access.data?.countries;
  const paymentRows: any[] | undefined = previewPay ? PREVIEW_PAYMENTS : payments.data;

  return (
    <PageContainer className="py-3 md:py-8">
      <div className="grid grid-cols-1 gap-3 sm:gap-5 [&>*]:min-w-0">
        <Block>
          <dl className="grid gap-3 text-body-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">{P.name}</dt><dd className="font-medium">{me.name}</dd></div>
            <div><dt className="text-muted-foreground">{P.email}</dt><dd className="font-medium [overflow-wrap:anywhere]">{me.email}</dd></div>
          </dl>
        </Block>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-14 w-full justify-between bg-card text-body-sm font-semibold" data-testid="tests-trigger">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-5 text-muted-foreground" aria-hidden />{P.tests}</span>
              <span className="flex items-center gap-2">
                {!!attempts.data?.length && <Badge variant="secondary">{attempts.data.length}</Badge>}
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <SheetHeader className="pr-8">
              <SheetTitle className="flex items-center gap-2"><CheckCircle2 className="size-5 text-muted-foreground" aria-hidden />{P.tests}</SheetTitle>
              <SheetDescription className="sr-only">{P.results}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <StateBoundary isLoading={attempts.isLoading} error={attempts.error} onRetry={attempts.refetch} isEmpty={!attempts.data?.length} emptyTitle={P.noTests}>
                <ul className="grid gap-3">
                  {attempts.data?.map((a) => (
                    <li key={a.id} className="flex flex-col gap-3 rounded-lg border p-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">{TEST_TITLE[a.assessmentKey] ?? a.assessmentKey}</p>
                          <Badge variant={a.unlocked ? 'success' : 'warning'}>{a.unlocked ? <CheckCircle2 aria-hidden /> : <Lock aria-hidden />}{a.unlocked ? P.resultOpen : P.resultLocked}</Badge>
                        </div>
                        <p className="text-caption text-muted-foreground">{P.completed}: {fmtDate(a.completedAt)}{!a.unlocked && ` · ${P.answersSaved}`}</p>
                        {a.unlocked && a.summary && <p className="text-body-sm">{a.summary}</p>}
                      </div>
                      <Button asChild className="w-full" variant={a.unlocked ? 'outline' : 'default'}><Link href={`/assessments/${a.assessmentKey}/result/${a.id}`}>{a.unlocked ? P.viewResult : P.unlockResult}</Link></Button>
                    </li>
                  ))}
                </ul>
              </StateBoundary>
              {todo.length > 0 && (
                <section className="mt-6" aria-labelledby="todo-tests" data-testid="todo-tests">
                  <h3 id="todo-tests" className="mb-3 text-h4">{P.notTaken}</h3>
                  <ul className="grid gap-3">
                    {todo.map((a) => {
                      const Icon = TEST_ICON[a.key] ?? ListChecks;
                      return (
                        <li key={a.key}>
                          <Link href={`/assessments/${a.key}`} className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-[border-color,box-shadow] hover:border-ring/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary"><Icon className="size-5" aria-hidden /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-body font-semibold leading-snug">{a.title}</span>
                              <span className="mt-1 block text-body-sm text-muted-foreground">{a.subtitle}</span>
                              <span className="mt-3 inline-flex items-center gap-1 text-body-sm font-semibold text-primary dark:text-secondary">{P.takeTest}<ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Block title={P.unis} icon={GraduationCap}>
          {previewUnis && <p className="mb-3 rounded-md border border-dashed bg-muted/50 p-2 text-caption text-muted-foreground" role="note">{P.previewNote}</p>}
          <StateBoundary isLoading={!previewUnis && access.isLoading} error={previewUnis ? null : access.error} onRetry={access.refetch} isEmpty={!unlockedUnis?.length && !unlockedCountries?.length} emptyTitle={P.noUnis}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {unlockedCountries?.map((c) => (
                <li key={c.slug} className="min-w-0"><Link href={previewUnis ? '/universities' : `/universities?country=${c.slug}`} className="flex min-w-0 items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border bg-muted"><Globe2 className="size-4 text-muted-foreground" aria-hidden /></span>
                  <span className="min-w-0"><span className="block truncate font-medium">{P.allUnis}</span><span className="flex items-center gap-1.5 text-caption text-muted-foreground"><Flag code={c.code} size={14} />{c.nameMn}</span></span>
                </Link></li>
              ))}
              {unlockedUnis?.map((u) => (
                <li key={u.slug} className="min-w-0"><Link href={previewUnis ? '/universities' : `/universities/${u.slug}`} className="flex min-w-0 items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted">
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">{u.logoUrl ? <img src={u.logoUrl} alt="" width={40} height={40} className="size-full object-contain" /> : <GraduationCap className="size-4 text-muted-foreground" aria-hidden />}</span>
                  <span className="min-w-0"><span className="block truncate font-medium">{u.name}</span><span className="flex items-center gap-1.5 text-caption text-muted-foreground"><Flag code={u.country?.code} size={14} />{u.country?.nameMn}{u.city ? `, ${u.city}` : ''}</span></span>
                </Link></li>
              ))}
            </ul>
          </StateBoundary>
        </Block>

        <Block title={P.payments}>
          {previewPay && <p className="mb-3 rounded-md border border-dashed bg-muted/50 p-2 text-caption text-muted-foreground" role="note">{P.previewNote}</p>}
          <StateBoundary isLoading={!previewPay && payments.isLoading} error={previewPay ? null : payments.error} onRetry={payments.refetch} isEmpty={!paymentRows?.length} emptyTitle={P.noPayments}>
            <div className="overflow-hidden rounded-lg border">
              <div className={`${PAY_ROW} bg-muted/50 text-caption font-semibold text-muted-foreground`}>
                <span>{P.cols.method}</span><span className="text-right">{P.cols.amount}</span><span className="text-right">{P.cols.date}</span>
              </div>
              <ul className="divide-y border-t">
                {paymentRows?.map((p) => (
                  <li key={p.id} className={`${PAY_ROW} text-body-sm`}>
                    <span className="font-medium">{P.provider}</span>
                    <span className={`text-right font-semibold ${p.status === 'paid' ? '' : 'text-muted-foreground'}`}>{mnt(p.amount)}</span>
                    <span className="text-right text-muted-foreground">{fmtDate(p.paidAt ?? p.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StateBoundary>
        </Block>
      </div>
    </PageContainer>
  );
}

export default function ProfilePage() {
  return <RequireUser>{(me) => <ProfileInner me={me} />}</RequireUser>;
}
