import { PageContainer } from '@/components/layout/page-container';
import { t } from '@/i18n';

export default function Privacy() {
  return (
    <PageContainer size="narrow" className="py-8 md:py-12">
      <h1 className="mb-4 text-h1">{t.legal.privacyTitle}</h1>
      <ul className="list-disc space-y-3 pl-5 text-body">{t.legal.privacy.map((p) => <li key={p}>{p}</li>)}</ul>
    </PageContainer>
  );
}
