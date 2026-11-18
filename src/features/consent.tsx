'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { Me, useMe } from '@/lib/auth';
import { Loading } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Alert, Card } from '@/components/ui/data-display';
import { Form } from '@/components/ui/form';
import Login from './login-form';
import { ConsentFields, ConsentValues, consentDefaults, consentSchema, clearConsentDraft, readConsentDraft } from './consent-shared';

function ConsentForm() {
  const qc = useQueryClient();
  const form = useForm<ConsentValues>({ resolver: zodResolver(consentSchema), defaultValues: consentDefaults });
  const m = useMutation({ mutationFn: (v: ConsentValues) => api('/users/me/consent', { method: 'PUT', body: v }), onSuccess: () => { clearConsentDraft(); qc.invalidateQueries({ queryKey: ['me'] }); } });
  // Нэвтрэх хуудсан дээр зөвшөөрлөө аль хэдийн өгсөн бол дахин асуухгүй, шууд хадгална (амжилттай болтол ноорогийг устгахгүй).
  const draft = useRef<ConsentValues | null | undefined>(undefined);
  if (draft.current === undefined) draft.current = typeof window === 'undefined' ? null : readConsentDraft();
  useEffect(() => { if (draft.current) m.mutate(draft.current, { onError: () => clearConsentDraft() }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (draft.current && !m.isError) return <Loading />;
  return (
    <PageContainer size="form" className="py-12">
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => m.mutate(v))} className="grid gap-4" noValidate>
            <h1 className="text-h2">{t.auth.consentTitle}</h1>
            <p className="text-body-sm text-muted-foreground">{t.auth.consentHint}</p>
            <ConsentFields form={form} />
            {m.error && <Alert variant="destructive">{(m.error as Error).message}</Alert>}
            <Button type="submit" size="lg" fullWidth loading={m.isPending}>{t.common.next}</Button>
          </form>
        </Form>
      </Card>
    </PageContainer>
  );
}

/** Нэвтрээгүй бол нэвтрүүлж, нууцлалын зөвшөөрөл өгөөгүй бол зөвшөөрүүлж дараа нь агуулгыг үзүүлнэ. */
export function RequireUser({ children }: { children: (me: Me) => ReactNode }) {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <Loading />;
  if (!me) return <Login />;
  if (!me.consent?.privacyAcceptedAt) return <ConsentForm />;
  return <>{children(me)}</>;
}
