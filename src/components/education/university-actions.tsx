'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck, Scale } from 'lucide-react';
import { api } from '@/lib/api';
import { useMe } from '@/lib/auth';
import { useCompare } from '@/lib/compare';
import { COMPARE_MAX } from '@/lib/constants';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Hint } from '@/components/ui/overlays';
import { notify } from '@/components/ui/misc';

const U = t.universities;

export function useSavedIds() {
  const { data: me } = useMe();
  return useQuery<string[]>({ queryKey: ['savedIds'], queryFn: () => api('/saved/universities/ids'), enabled: !!me });
}

export function SaveButton({ id, withLabel }: { id: string; withLabel?: boolean }) {
  const { data: me } = useMe();
  const { data: ids = [] } = useSavedIds();
  const qc = useQueryClient();
  const saved = ids.includes(id);
  const m = useMutation({
    mutationFn: () => (saved ? api(`/saved/universities/${id}`, { method: 'DELETE' }) : api(`/saved/universities/${id}`, { method: 'POST', body: {} })),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savedIds'] }); qc.invalidateQueries({ queryKey: ['saved'] }); },
    onError: (e: any) => notify({ color: 'red', message: e.message }),
  });
  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = saved ? U.unsave : U.save;
  const click = () => (me ? m.mutate() : notify({ color: 'orange', message: t.common.loginRequired }));
  if (withLabel) return <Button variant={saved ? 'default' : 'outline'} loading={m.isPending} onClick={click} aria-pressed={saved}><Icon />{label}</Button>;
  return <Hint label={label}><Button variant={saved ? 'default' : 'outline'} size="icon" loading={m.isPending} onClick={click} aria-label={label} aria-pressed={saved}>{!m.isPending && <Icon />}</Button></Hint>;
}

export function CompareButton({ id, withLabel }: { id: string; withLabel?: boolean }) {
  const c = useCompare();
  const on = c.has(id);
  const click = () => { if (!c.toggle(id)) notify({ color: 'orange', message: `${U.compareLimit.replace('4', String(COMPARE_MAX))}` }); };
  const label = on ? U.compareRemove : U.compareAdd;
  if (withLabel) return <Button variant={on ? 'secondary' : 'outline'} onClick={click} aria-pressed={on}><Scale />{label}</Button>;
  return <Hint label={label}><Button variant={on ? 'secondary' : 'outline'} size="icon" onClick={click} aria-label={label} aria-pressed={on}><Scale /></Button></Hint>;
}
