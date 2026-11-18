'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/common';
import { useMe } from '@/lib/auth';
import Login from '@/features/login-form';

export default function LoginPage() {
  const { data: me, isLoading } = useMe();
  const router = useRouter();
  useEffect(() => { if (me) router.replace('/'); }, [me, router]);
  if (isLoading || me) return <Loading />;
  return <Login />;
}
