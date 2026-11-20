'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, ChevronRight, Clock, Loader2, Lock, Smartphone } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { useMe } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/brand/logo-mark';
import { Badge, Card } from '@/components/ui/data-display';
import { notify } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/overlays';

const PAY = t.pay;
export interface Product { key: string; title: string; description?: string; priceMnt: number; scope: string }
interface PaymentView { id: string; status: string; amount: number; currency: string; qrImage: string | null; shortUrl: string | null; invoiceNumber?: string | null; urls: { name: string; description?: string; logo?: string; link: string }[]; expiresAt: string; provider: string }

export const mnt = (n: number) => `${fmtNumber(n)} ₮`;
export function useProducts() { return useQuery<Product[]>({ queryKey: ['products'], queryFn: () => api('/payments/products'), staleTime: 300_000 }); }
const fmtLeft = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/** QPay QR төлбөрийн цонх: invoice үүсгэж, QR харуулж, сервер талын баталгаажуулалтыг (poll) хүлээнэ. */
export function PayModal({ productKey, targetId, opened, onClose }: { productKey: string; targetId?: string; opened: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const product = useProducts().data?.find((p) => p.key === productKey);
  const [pay, setPay] = useState<PaymentView | null>(null);
  const [left, setLeft] = useState(0);
  const [view, setView] = useState<'qr' | 'banks'>('qr');
  const keyRef = useRef('');
  const retries = useRef(0);

  const create = useMutation({
    mutationFn: () => { keyRef.current ||= `${productKey}-${targetId ?? 'u'}-${Math.random().toString(36).slice(2, 10)}`; return api<PaymentView>('/payments', { method: 'POST', body: { productKey, targetId, idempotencyKey: keyRef.current } }); },
    onSuccess: (p) => {
      // Цонх нээгдмэгц «хугацаа дууссан» гэж харуулахгүй: үхсэн нэхэмжлэх ирвэл шууд шинийг үүсгэж QR гаргана (хамгийн ихдээ 2 удаа).
      if (['expired', 'cancelled', 'failed'].includes(p.status) && retries.current < 2) { retries.current += 1; keyRef.current = ''; create.mutate(); return; }
      setPay(p);
    },
  });
  useEffect(() => { if (opened && !pay && !create.isPending && !create.error) create.mutate(); }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!opened) { setPay(null); setView('qr'); create.reset(); keyRef.current = ''; retries.current = 0; } }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = (p: PaymentView) => { setPay(p); if (p.status === 'paid') qc.invalidateQueries(); };
  const verify = useMutation({ mutationFn: (id: string) => api<PaymentView>(`/payments/${id}/verify`, { method: 'POST' }), onSuccess: done });
  // QPay давтан шалгахыг хориглодог: 3 сек poll манай бүртгэлийг уншина; «Төлбөр шалгах» нь QPay-аас нэг удаа асууна
  const [notYet, setNotYet] = useState(false);
  const check = useMutation({ mutationFn: (id: string) => api<PaymentView>(`/payments/${id}/verify?manual=1`, { method: 'POST' }), onSuccess: (p) => { done(p); setNotYet(p.status === 'pending'); } });

  useEffect(() => { // 3 секунд тутам сервер талаас төлвийг шалгана
    if (!pay || pay.status !== 'pending') return;
    const h = setInterval(() => verify.mutate(pay.id), 3000);
    const c = setInterval(() => setLeft(new Date(pay.expiresAt).getTime() - Date.now()), 1000);
    setLeft(new Date(pay.expiresAt).getTime() - Date.now());
    return () => { clearInterval(h); clearInterval(c); };
  }, [pay?.id, pay?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = async () => { if (pay?.status === 'pending') await api(`/payments/${pay.id}/cancel`, { method: 'POST' }).catch(() => undefined); onClose(); };
  const err = create.error instanceof ApiError ? create.error : null;
  /** Банкны апп руу энэ табаараа шууд шилжинэ (шинэ таб нээвэл утсан дээр «өөр апп нээх үү» гэж асуудаг). */
  const openBank = (link: string, bank: string) => { setView('qr'); notify({ title: PAY.bankOpening.replace('{bank}', bank), message: PAY.bankOpeningHint }); window.location.assign(link); };

  return (
    <Dialog open={opened} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-h-[94dvh] max-w-md gap-0 overflow-y-auto p-0" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="flex-row items-center gap-3 border-b bg-muted/20 p-4 pr-12 sm:p-5 sm:pr-14">
          <LogoMark className="size-8" />
          <DialogTitle className="text-h4">{product?.title ?? PAY.title}</DialogTitle>
          <DialogDescription className="sr-only">{PAY.scan}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-4 sm:p-6">
          {!pay && !err && <div className="grid justify-items-center gap-3 py-10 text-center" role="status"><Loader2 className="size-8 animate-spin text-primary" aria-hidden /><p className="text-body-sm text-muted-foreground">{PAY.creating}</p></div>}
          {err && (
            <div className="grid justify-items-center gap-3 py-6 text-center">
              <span className={cn('grid size-12 place-items-center rounded-full', err.code === 'ALREADY_OWNED' ? 'bg-success-soft text-success-soft-foreground' : 'bg-destructive/10 text-destructive')}>{err.code === 'ALREADY_OWNED' ? <CheckCircle2 className="size-6" aria-hidden /> : <AlertCircle className="size-6" aria-hidden />}</span>
              <div role="alert"><h3 className="text-h4">{err.code === 'ALREADY_OWNED' ? PAY.alreadyOwned : PAY.errorTitle}</h3><p className="mt-1 text-body-sm text-muted-foreground">{err.message}</p></div>
              {err.code !== 'ALREADY_OWNED' && <Button size="sm" onClick={() => { create.reset(); create.mutate(); }}>{PAY.retryError}</Button>}
            </div>
          )}

          {pay?.status === 'pending' && view === 'banks' && (
            <div className="grid gap-3.5">
              <div className="flex items-center justify-between border-b pb-2.5">
                <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setView('qr')}><ArrowLeft />{PAY.backToQr}</Button>
                <span className="font-mono text-caption text-muted-foreground">{PAY.banksTotal.replace('{n}', String(pay.urls.length))}</span>
              </div>
              <ul className="grid grid-cols-4 gap-1.5">
                {pay.urls.map((b) => (
                  <li key={b.name} className="min-w-0">
                    <button type="button" onClick={() => openBank(b.link, b.description || b.name)} className="group flex w-full min-w-0 flex-col items-center gap-1 rounded-xl border bg-card p-2 text-center transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white p-1">
                        {b.logo ? <img src={b.logo} alt="" className="size-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <Building2 className="size-4 text-primary" aria-hidden />}
                      </span>
                      <span className="line-clamp-2 w-full break-words text-[0.625rem] font-semibold leading-tight">{b.description || b.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pay?.status === 'pending' && view === 'qr' && (
            <>
              <div className="grid justify-items-center gap-1 rounded-2xl border border-primary/20 bg-primary/10 p-3.5 text-center">
                <p className="text-h2 font-extrabold tracking-tight text-primary">{mnt(pay.amount)}</p>
                <p className="flex items-center justify-center gap-2 text-caption text-muted-foreground" role="status">
                  {pay.invoiceNumber && <><span className="font-mono">№ {pay.invoiceNumber}</span><span aria-hidden>·</span></>}
                  <span className="flex items-center gap-1 font-semibold text-accent"><Clock className="size-3" aria-hidden />{fmtLeft(left)}</span>
                </p>
              </div>
              <div className="grid justify-items-center gap-2 rounded-2xl border bg-white p-3 text-black sm:p-5">
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-2">
                  {pay.qrImage ? <img src={pay.qrImage} alt="QPay QR" className="size-[min(13rem,27dvh)] rounded-xl object-contain sm:size-56" /> : <p className="grid size-[min(13rem,27dvh)] place-items-center text-body-sm text-gray-500 sm:size-56">{PAY.noQr}</p>}
                </div>
                <p className="text-center text-body-sm font-bold">{PAY.scanTitle}</p>
                <p className="text-center text-caption text-gray-500">{PAY.scanHint}</p>
              </div>
              <div className="grid gap-2">
                {pay.urls?.length > 0 && <Button variant="outline" className="h-auto border-primary/30 bg-primary/10 py-3 text-primary hover:bg-primary/15 md:hidden" onClick={() => setView('banks')}><Smartphone />{PAY.payByBank}<ChevronRight /></Button>}
                <Button className="h-auto py-3.5" disabled={check.isPending} onClick={() => check.mutate(pay.id)}>{check.isPending ? <><Loader2 className="animate-spin" />{PAY.checking}</> : <><CheckCircle2 />{PAY.check}</>}</Button>
                {notYet && <p className="text-center text-body-sm text-muted-foreground" role="status">{PAY.notYet}</p>}
              </div>
            </>
          )}

          {pay?.status === 'paid' && (
            <div className="grid justify-items-center gap-4 py-4 text-center">
              <span className="grid size-16 place-items-center rounded-full border-2 border-success bg-success-soft text-success-soft-foreground"><CheckCircle2 className="size-8" aria-hidden /></span>
              <div className="grid gap-1.5"><Badge variant="success" className="mx-auto text-body-sm">{PAY.paidTitle}</Badge><h3 className="text-h3">{mnt(pay.amount)}</h3><p className="mx-auto max-w-sm text-body-sm text-muted-foreground">{PAY.paidHint}</p></div>
              {pay.invoiceNumber && <div className="flex w-full justify-between rounded-xl border bg-muted/40 p-3 text-caption"><span className="text-muted-foreground">{PAY.invoiceNo}</span><span className="font-mono font-semibold">{pay.invoiceNumber}</span></div>}
              <Button className="w-full" onClick={onClose}>{PAY.close}</Button>
            </div>
          )}

          {pay && ['expired', 'cancelled', 'failed'].includes(pay.status) && (
            <div className="grid justify-items-center gap-4 py-6 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">{pay.status === 'failed' ? <AlertCircle className="size-6" aria-hidden /> : <Clock className="size-6" aria-hidden />}</span>
              <div role="alert"><h3 className="text-h4">{pay.status === 'failed' ? PAY.failedTitle : PAY.expiredTitle}</h3><p className="mt-1 text-body-sm text-muted-foreground">{pay.status === 'failed' ? PAY.failedHint : PAY.expiredHint}</p></div>
              <Button size="sm" onClick={() => { keyRef.current = ''; setPay(null); setView('qr'); create.reset(); create.mutate(); }}>{PAY.retry}</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Төлбөрийн цонхыг хуудаснаас ТУСДАА, дээд түвшинд (Providers) байрлуулна. Төлсний дараа хуудас шинэчлэгдэж «Нээх» товч,
 * түгжээтэй самбар алга болдог тул цонх хуудасны дотор байвал «амжилттай» мэдэгдэл өөрөө хаагдчихдаг байсан.
 * Одоо цонхыг зөвхөн хэрэглэгч өөрөө хаана.
 */
interface PayTarget { productKey: string; targetId?: string }
const PayCtx = createContext<{ open: (t: PayTarget) => void } | null>(null);
export function PayProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<PayTarget | null>(null);
  const last = useRef<PayTarget>({ productKey: '' });
  if (target) last.current = target;
  return (
    <PayCtx.Provider value={{ open: setTarget }}>
      {children}
      <PayModal productKey={last.current.productKey} targetId={last.current.targetId} opened={!!target} onClose={() => setTarget(null)} />
    </PayCtx.Provider>
  );
}
export function usePay() {
  const c = useContext(PayCtx);
  if (!c) throw new Error('usePay нь PayProvider-ийн дотор ашиглагдана');
  return c;
}

/** Нээх товч + төлбөрийн цонх. Premium = Gold тэмдэглэгээ. */
export function UnlockButton({ productKey, targetId, label, priceMnt }: { productKey: string; targetId?: string; label?: string; variant?: string; priceMnt?: number }) {
  const { data: me } = useMe();
  const base = useProducts().data?.find((x) => x.key === productKey);
  const { open } = usePay();
  if (!base) return null;
  /** Улсын үнэ сургуулийн тооноос хамаарна → хуудас сервер тооцсон үнийг дамжуулна (бүтээгдэхүүний priceMnt нь нэгж үнэ). */
  const p = { ...base, priceMnt: priceMnt ?? base.priceMnt };
  return (
    <>
      {me
        ? <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => open({ productKey, targetId })}><Lock />{label ?? PAY.unlock} · {mnt(p.priceMnt)}</Button>
        : <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link href="/login">{t.s.auth.loginToPay} · {mnt(p.priceMnt)}</Link></Button>}
    </>
  );
}

/** Төлөөгүй тестийн үр дүн: агуулга серверээс огт ирдэггүй тул зөвхөн нээх хүсэлт харуулна */
export function LockBanner({ attemptId }: { attemptId: string }) {
  return (
    <Card className="flex flex-wrap items-start justify-between gap-4 border-accent/40 bg-gold-soft/50 p-5 sm:p-6">
      <div className="max-w-xl space-y-1.5">
        <h2 className="flex items-center gap-2 text-h3"><Lock className="size-5" aria-hidden />{t.s.result.lockedTitle}</h2>
        <p className="text-body-sm">{t.s.result.lockedText}</p>
        <p className="text-body-sm text-muted-foreground">{t.s.result.retakeFree}</p>
      </div>
      <UnlockButton productKey="test_result" targetId={attemptId} label={t.s.result.unlock} />
    </Card>
  );
}

export function RoadmapView({ phases, title }: { phases: { phase: string; title: string; steps: { text: string; href?: string; label?: string; from?: string }[] }[]; title?: string }) {
  return (
    <div className="grid gap-4">
      {title && <h2 className="text-h2">{title}</h2>}
      {phases.map((ph) => (
        <Card key={ph.phase} className="p-5"><h3 className="mb-3 text-h4">{ph.title}</h3>
          <ol className="grid gap-2.5">{ph.steps.map((s, i) => <li key={i} className="flex items-start gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-caption font-bold text-primary-foreground">{i + 1}</span><p className="text-body-sm">{s.text} {s.href && <Link href={s.href} className="font-medium text-primary underline underline-offset-2 dark:text-secondary">{s.label ?? '→'}</Link>}</p></li>)}</ol></Card>
      ))}
      <p className="text-caption text-muted-foreground">{PAY.roadmapNote}</p>
    </div>
  );
}
