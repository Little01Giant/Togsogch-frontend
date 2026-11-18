'use client';
import Link from 'next/link';
import { Scale } from 'lucide-react';
import { t } from '@/i18n';
import { useCompare } from '@/lib/compare';
import { Button } from '@/components/ui/button';
import { PageContainer } from './page-container';

export function CompareBar() {
  const { ids, clear } = useCompare();
  if (!ids.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-sticky border-t bg-primary py-2.5 text-primary-foreground shadow-md" role="region" aria-label={t.compare.title}>
      <PageContainer>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm"><Scale className="size-4" aria-hidden />{t.compare.title}: {ids.length} {t.compare.selected}</span>
          <span className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={clear}>{t.common.clear}</Button>
            {ids.length >= 2 ? <Button asChild variant="secondary" size="sm"><Link href={`/compare?ids=${ids.join(',')}`}>{t.compare.open}</Link></Button> : <Button variant="secondary" size="sm" disabled>{t.compare.open}</Button>}
          </span>
        </div>
      </PageContainer>
    </div>
  );
}
