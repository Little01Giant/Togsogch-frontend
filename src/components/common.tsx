'use client';
import { ReactNode, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { fmtDate, t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { STALE_MONTHS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/brand/logo-mark';
import { Button } from '@/components/ui/button';
import { Badge, Skeleton } from '@/components/ui/data-display';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/overlays';

/* ───────── Төлвүүд: loading / empty / error / success ───────── */
export function Loading({ label = t.common.loading, className }: { label?: string; className?: string }) {
  return <div role="status" className={cn('flex flex-col items-center gap-2 py-12 text-muted-foreground', className)}><Loader2 className="size-6 animate-spin" aria-hidden /><span className="text-body-sm">{label}</span></div>;
}

export function EmptyState({ title = t.common.empty, hint, action, icon, className }: { title?: string; hint?: string; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center gap-2 py-12 text-center', className)}>
      {icon ? <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div> : <LogoMark body className="size-32" />}
      <p className="text-h4">{title}</p>
      {hint && <p className="text-body-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  const msg = error instanceof ApiError ? error.message : t.errors.generic;
  return (
    <div role="alert" className={cn('my-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive-soft p-4 text-destructive-soft-foreground', className)}>
      <LogoMark className="size-16 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{t.common.error}</p><p className="text-body-sm">{msg}</p></div>
        {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>{t.common.retry}</Button>}</div>
    </div>
  );
}

export function SuccessState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div role="status" className="mx-auto flex max-w-md flex-col items-center gap-2 py-10 text-center">
      <LogoMark body className="size-32" />
      <p className="text-h4">{title}</p>{hint && <p className="text-body-sm text-muted-foreground">{hint}</p>}{action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Loading / Error / Empty / Success төлвүүдийг нэг дор шийднэ */
export function StateBoundary({ isLoading, error, isEmpty, onRetry, emptyTitle, emptyHint, skeleton, children }: {
  isLoading?: boolean; error?: unknown; isEmpty?: boolean; onRetry?: () => void; emptyTitle?: string; emptyHint?: string; skeleton?: ReactNode; children: ReactNode;
}) {
  if (isLoading) return <>{skeleton ?? <Loading />}</>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} hint={emptyHint} />;
  return <>{children}</>;
}

export const CardSkeleton = ({ className }: { className?: string }) => <Skeleton className={cn('h-56 rounded-lg', className)} />;

/** Баталгаажуулах диалог (устгах зэрэг буцаашгүй үйлдэлд) */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = t.common.delete, onConfirm, loading, destructive = true }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; confirmLabel?: string; onConfirm: () => void; loading?: boolean; destructive?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction destructive={destructive} disabled={loading} onClick={(e) => { e.preventDefault(); onConfirm(); }}>{loading && <Loader2 className="size-4 animate-spin" />}{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ───────── Эх сурвалж / баталгаажуулалтын тэмдэглэгээ ───────── */
type Src = { sourceName?: string | null; sourceUrl?: string | null; verifiedAt?: string | null; lastUpdatedAt?: string | null; verificationStatus?: string | null; academicYear?: string | null } | null;
export function isStale(source?: Src) {
  const ref = source?.verifiedAt ?? source?.lastUpdatedAt;
  return !source?.verifiedAt || (ref ? (Date.now() - new Date(ref).getTime()) / (30 * 24 * 3600 * 1000) > STALE_MONTHS : true) || source?.verificationStatus === 'outdated';
}
/** `hideStatus` үед «Баталгаажуулах шаардлагатай» тэмдэг харагдахгүй; эх сурвалжийн нэрс жагсаалтаар, холбоос нь нэг тод товчоор. */
export function SourceBadge({ source, compact, hideStatus }: { source?: Src; compact?: boolean; hideStatus?: boolean }) {
  const stale = isStale(source);
  const names = (source?.sourceName ?? '').split(';').map((s) => s.trim()).filter(Boolean);
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? names : names.slice(0, 2);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {source?.lastUpdatedAt && <span className="text-caption text-muted-foreground">{t.source.lastUpdated}: {fmtDate(source.lastUpdatedAt)}</span>}
        {!hideStatus && <Badge variant={stale ? 'warning' : 'success'}>{stale ? t.source.needsVerification : t.source.verified}</Badge>}
      </div>
      {!compact && names.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-caption text-muted-foreground">{t.source.label}:</span>
          {shown.map((n) => <Badge key={n} variant="outline" className="h-auto max-w-full whitespace-normal px-2 py-0.5 text-left text-caption font-normal">{n}</Badge>)}
          {names.length > 2 && (
            <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="rounded-sm text-caption font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-secondary">
              {expanded ? t.source.showLess : `${t.source.showAll} (+${names.length - 2})`}
            </button>
          )}
        </div>
      )}
      {!compact && source?.sourceUrl && (
        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded-sm text-body-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-secondary">
          {t.source.openPrimary}<ExternalLink className="size-4" aria-hidden />
        </a>
      )}
    </div>
  );
}

const GLOSSARY_TERMS = Object.keys(t.glossary).sort((a, b) => b.length - a.length);
const GLOSSARY_RE = new RegExp(GLOSSARY_TERMS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const isWordChar = (ch?: string) => !!ch && /[A-Za-z0-9]/.test(ch);

/** Текстэд тааралдсан нэр томьёо, товчлолын ард (эхний тохиолдолд) тайлбарыг хаалтанд нэмж харуулна. */
export function glossTerms(text: string): string[] {
  const found: string[] = [];
  for (const m of text.matchAll(GLOSSARY_RE)) {
    const i = m.index ?? 0;
    if (!isWordChar(text[i - 1]) && !isWordChar(text[i + m[0].length])) found.push(m[0]);
  }
  return found;
}

/** `skip` — өмнөх өгүүлбэрт аль хэдийн тайлбарлагдсан нэр томьёо (давтахгүй). */
export function GlossText({ text, skip }: { text: string; skip?: ReadonlySet<string> }) {
  const seen = new Set<string>(skip);
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(GLOSSARY_RE)) {
    const i = m.index ?? 0;
    const end = i + m[0].length;
    if (isWordChar(text[i - 1]) || isWordChar(text[end]) || seen.has(m[0])) continue;
    seen.add(m[0]);
    parts.push(text.slice(last, end), <span key={i} className="text-muted-foreground"> ({t.glossary[m[0]]})</span>);
    last = end;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

export const NoData =() => <span className="italic text-muted-foreground">{t.common.noData}</span>;

/** Windows дээр emoji туг үсэг болдог тул зургаар харуулна; ачаалагдахгүй бол улсын код. */
export function Flag({ code, size = 20 }: { code?: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!code) return null;
  if (failed) return <span className="inline-block font-semibold text-muted-foreground" style={{ minWidth: size, fontSize: size * 0.6 }}>{code}</span>;
  
  return <img src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`} alt={code} width={size} height={Math.round(size * 0.75)} className="inline-block rounded-[2px] object-cover align-middle" loading="lazy" onError={() => setFailed(true)} />;
}
