import Link from 'next/link';
import { t } from '@/i18n';
import { LogoMark } from '@/components/brand/logo-mark';
import { PageContainer } from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';

/** 404: ирвэс гунигтай, нүүр хуудас руу буцах товчтой */
export default function NotFound() {
  return (
    <PageContainer size="form" className="flex flex-col items-center gap-4 py-16 text-center">
      <LogoMark body className="size-44" />
      <h1 className="text-h2 font-extrabold">{t.errors.notFound}</h1>
      <Link href="/" className={buttonVariants({ size: 'lg' })}>{t.nav.home}</Link>
    </PageContainer>
  );
}
