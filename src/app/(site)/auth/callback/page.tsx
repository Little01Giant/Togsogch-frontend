'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/common';
import { t } from '@/i18n';

export default function AuthCallback() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => { qc.invalidateQueries({ queryKey: ['me'] }).then(() => router.replace('/')); }, [qc, router]);
  return <Loading label={t.auth.callbackWorking} />;
}
