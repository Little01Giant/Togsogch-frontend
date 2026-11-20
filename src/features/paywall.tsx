'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { fmtNumber, t } from '@/i18n';
import { useMe } from '@/lib/auth';
import { Alert, Badge, Card } from '@/components/ui/data-display';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/overlays';

const PAY = t.pay;
export interface Product { key: string; title: string; description?: string; priceMnt: number; scope: string }
interface PaymentView { id: string; status: string; amount: number; currency: string; qrImage: string | null; shortUrl: string | null; urls: { name: string; description?: string; link: string }[]; expiresAt: string; provider: string }

export const mnt = (n: number) => `${fmtNumber(n)} ₮`;
export function useProducts() { return useQuery<Product[]>({ queryKey: ['products'], queryFn: () => api('/payments/products'), staleTime: 300_000 }); }
const fmtLeft = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/** QPay QR төлбөрийн цонх: invoice үүсгэж, QR харуулж, сервер талын баталгаажуулалтыг (poll) хүлээнэ. */
export function PayModal({ productKey, targetId, opened, onClose }: { productKey: string; targetId?: string; opened: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const product = useProducts().data?.find((p) => p.key === productKey);
  const [pay, setPay] = useState<PaymentView | null>(null);
  const [left, setLeft] = useState(0);
  const keyRef = useRef('');

  const create = useMutation({
    mutationFn: () => { keyRef.current ||= `${productKey}-${targetId ?? 'u'}-${Math.random().toString(36).slice(2, 10)}`; return api<PaymentView>('/payments', { method: 'POST', body: { productKey, targetId, idempotencyKey: keyRef.current } }); },
    onSuccess: setPay,
  });
  useEffect(() => { if (opened && !pay && !create.isPending && !create.error) create.mutate(); }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!opened) { setPay(null); create.reset(); keyRef.current = ''; } }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <Dialog open={opened} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader><DialogTitle>{product?.title ?? PAY.title}</DialogTitle><DialogDescription className="sr-only">{PAY.scan}</DialogDescription></DialogHeader>
        <div className="flex flex-col items-center gap-3">
          {!pay && !err && <div className="flex items-center gap-2 py-6 text-body-sm"><Loader2 className="size-4 animate-spin" />{PAY.creating}</div>}
          {err && <Alert variant={err.code === 'ALREADY_OWNED' ? 'success' : 'destructive'} className="w-full">{err.message}</Alert>}
          {pay?.status === 'pending' && (
            <>
              <p className="text-h2">{mnt(pay.amount)}</p>
              {pay.qrImage ? <img src={pay.qrImage} alt="QPay QR" width={240} height={240} className="size-60 rounded-md border bg-white p-2" /> : <p className="text-muted-foreground">{PAY.noQr}</p>}
              <div className="w-full rounded-lg border bg-muted/40 p-3" data-testid="pay-steps">
                <p className="mb-2 text-body-sm font-semibold">{PAY.stepsTitle}</p>
                <ol className="grid gap-2">{PAY.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-caption font-bold text-accent">{i + 1}</span>
                    <span className="min-w-0">{s}</span>
                  </li>))}
                </ol>
                {pay.urls?.length > 0 && <p className="mt-2 text-caption text-muted-foreground md:hidden">{PAY.stepsMobile}</p>}
              </div>
              {pay.urls?.length > 0 && <div className="flex flex-wrap justify-center gap-1.5 md:hidden">{pay.urls.slice(0, 6).map((u) => <Button key={u.name} asChild variant="outline" size="sm"><a href={u.link}>{u.description ?? u.name}</a></Button>)}</div>}
              {pay.shortUrl && <Button asChild variant="link" size="sm"><a href={pay.shortUrl} target="_blank" rel="noopener noreferrer">{PAY.open}</a></Button>}
              <p className="flex items-center gap-2 text-body-sm" role="status"><Loader2 className="size-3.5 animate-spin" />{PAY.waiting} · {fmtLeft(left)}</p>
              <Button variant="outline" size="sm" disabled={check.isPending} onClick={() => check.mutate(pay.id)}>{check.isPending ? <><Loader2 className="animate-spin" />{PAY.checking}</> : PAY.check}</Button>
              {notYet && <p className="text-center text-body-sm text-muted-foreground" role="status">{PAY.notYet}</p>}
              <Button variant="ghost" size="sm" onClick={close}>{t.common.cancel}</Button>
            </>
          )}
          {pay?.status === 'paid' && <><div className="grid size-14 place-items-center rounded-full bg-success-soft text-success-soft-foreground"><CheckCircle2 className="size-7" /></div><Badge variant="success" className="text-body-sm">{PAY.paid}</Badge><p className="text-center text-body-sm">{PAY.paidHint}</p><Button onClick={onClose}>{PAY.close}</Button></>}
          {pay && ['expired', 'cancelled', 'failed'].includes(pay.status) && <><Alert variant="warning" className="w-full">{PAY.expired}</Alert><Button onClick={() => { keyRef.current = ''; setPay(null); create.reset(); create.mutate(); }}>{PAY.retry}</Button></>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Нээх товч + төлбөрийн цонх. Premium = Gold тэмдэглэгээ. */
export function UnlockButton({ productKey, targetId, label, priceMnt }: { productKey: string; targetId?: string; label?: string; variant?: string; priceMnt?: number }) {
  const { data: me } = useMe();
  const base = useProducts().data?.find((x) => x.key === productKey);
  const [open, setOpen] = useState(false);
  if (!base) return null;
  /** Улсын үнэ сургуулийн тооноос хамаарна → хуудас сервер тооцсон үнийг дамжуулна (бүтээгдэхүүний priceMnt нь нэгж үнэ). */
  const p = { ...base, priceMnt: priceMnt ?? base.priceMnt };
  return (
    <>
      {me
        ? <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setOpen(true)}><Lock />{label ?? PAY.unlock} · {mnt(p.priceMnt)}</Button>
        : <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link href="/login">{t.s.auth.loginToPay} · {mnt(p.priceMnt)}</Link></Button>}
      <PayModal productKey={productKey} targetId={targetId} opened={open} onClose={() => setOpen(false)} />
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
