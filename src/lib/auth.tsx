'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from './api';

export interface Me {
  id: string; email: string; name: string; picture?: string; role: 'user' | 'admin' | 'super_admin';
  profile: Record<string, unknown>; consent: { privacyAcceptedAt?: string; isMinor?: boolean };
}

export function useMe() {
  return useQuery<Me | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try { return await api<Me>('/auth/me'); } catch (e) { if (e instanceof ApiError && e.status === 401) return null; throw e; }
    },
    staleTime: 60_000, retry: false,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    qc.setQueryData(['me'], null);
    qc.clear();
    window.location.href = '/';
  };
}

export const isAdmin = (me?: Me | null) => !!me && (me.role === 'admin' || me.role === 'super_admin');
