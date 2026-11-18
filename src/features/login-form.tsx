'use client';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ConsentFields, ConsentValues, consentDefaults, consentSchema, saveConsentDraft } from './consent-shared';
import { GoogleMark } from '@/components/brand/google-mark';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { LogoMark } from '@/components/brand/logo-mark';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Alert, Card } from '@/components/ui/data-display';

const A = t.s.auth;

/** Нэвтрэлт зөвхөн Google-ээр. Нэвтрээгүйгээр сайтыг үзэж болно; төлбөр, нээлт нэвтрэлт шаардана. */
export default function Login({ reason }: { reason?: string }) {
  const cfg = useQuery<{ googleEnabled: boolean }>({ queryKey: ['auth-config'], queryFn: () => api('/auth/config') });
  const form = useForm<ConsentValues>({ resolver: zodResolver(consentSchema), defaultValues: consentDefaults });
  return (
    <PageContainer size="form" className="py-12">
      <Card className="grid gap-4 p-6 sm:p-8">
        <div><LogoMark body className="mb-2 size-32" /><h1 className="text-h2 font-extrabold">{A.tabLogin}</h1><p className="mt-1 text-body-sm text-muted-foreground">{A.loginSubtitle}</p><p className="mt-2 text-caption italic text-muted-foreground">«{t.brand.slogan}»</p></div>
        {reason && <Alert variant="info">{reason}</Alert>}
        <Form {...form}><div className="grid gap-3"><ConsentFields form={form} /></div></Form>
        <Button size="lg" fullWidth disabled={!cfg.data?.googleEnabled} onClick={form.handleSubmit((v) => { saveConsentDraft(v); window.location.href = '/api/v1/auth/google'; })}><GoogleMark className="size-6" />{t.auth.google}</Button>
        {cfg.data && !cfg.data.googleEnabled && <p className="text-caption text-muted-foreground">{t.auth.googleDisabled}</p>}
      </Card>
    </PageContainer>
  );
}
