'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { Checkbox, Label } from '@/components/ui/form-controls';
import { Flag } from '@/components/common';
import { byMongolianPriority } from '@/lib/country-order';

const U = t.universities;
export interface FilterApi { values: Record<string, string>; list: (k: string) => string[]; set: (p: Record<string, string | string[] | number | boolean | undefined>) => void }

/** `available` өгөгдсөн бол зөвхөн өгөгдөлтэй сонголтыг харуулна; нэг ч сонголт үлдэхгүй бол бүлгийг нууна (хоосон үр дүн өгдөг шүүлтүүр хэрэггүй). */
function CheckGroup({ name, label, map, f, available }: { name: string; label: string; map: Record<string, string>; f: FilterApi; available?: string[] }) {
  const value = f.list(name);
  const entries = Object.entries(map).filter(([v]) => !available || available.includes(v) || value.includes(v));
  if (!entries.length) return null;
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-label">{label}</legend>
      {entries.map(([v, l]) => {
        const id = `f-${name}-${v}`;
        return (
          <div key={v} className="flex min-h-7 items-center gap-2.5">
            <Checkbox id={id} checked={value.includes(v)} onCheckedChange={(c) => f.set({ [name]: c ? [...value, v] : value.filter((x) => x !== v) })} />
            <Label htmlFor={id} className="cursor-pointer font-normal">{l}</Label>
          </div>
        );
      })}
    </fieldset>
  );
}

/** Улс: тугтай жагсаалт; ~5 улс харагдаж, цааш нь жагсаалт дотроо гүйлгэнэ. Олон улс сонгож болно. */
function CountryList({ countries, f }: { countries: { slug: string; code?: string | null; nameMn: string }[]; f: FilterApi }) {
  const value = f.list('country');
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-label">{U.country}</legend>
      <div className="max-h-[15.5rem] overflow-y-auto rounded-md border bg-background/40 p-1 [scrollbar-width:thin]" tabIndex={0} role="group" aria-label={U.country}>
        {byMongolianPriority(countries).map((c) => {
          const id = `f-country-${c.slug}`;
          return (
            <div key={c.slug} className="flex min-h-9 items-center gap-2.5 rounded-sm px-2 hover:bg-muted/60">
              <Checkbox id={id} checked={value.includes(c.slug)} onCheckedChange={(on) => f.set({ country: on ? [...value, c.slug] : value.filter((x) => x !== c.slug) })} />
              <Label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 font-normal"><Flag code={c.code} size={20} /><span className="truncate">{c.nameMn}</span></Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Бүх шүүлтүүр хамт ажиллана (URL query-тэй синхрон). Desktop-д сайдбар, mobile-д Sheet дотор. */
export function UniversityFilters({ f }: { f: FilterApi }) {
  const { data: meta } = useQuery<{ countries: { slug: string; code?: string | null; nameMn: string }[]; cities: string[]; available?: Record<'degree' | 'type' | 'subject' | 'ranking' | 'scholarship', string[]> }>({ queryKey: ['filter-meta'], queryFn: () => api('/meta/filters'), staleTime: 300_000 });
  /** Мета ачаалагдтал бүгдийг харуулна (анивчихгүй); ачаалагдсаны дараа зөвхөн өгөгдөлтэйг */
  const av = meta?.available;
  return (
    <div className="grid gap-5">
      <CountryList countries={meta?.countries ?? []} f={f} />
      <CheckGroup f={f} name="type" label={U.type} map={U.labelsType} available={av?.type} />
      <CheckGroup f={f} name="ranking" label={U.ranking} map={Object.fromEntries(['QS_WORLD', 'QS_ASIA', 'THE_WORLD', 'THE_ASIA', 'ARWU'].map((k) => [k, U.labelsRanking[k]]))} available={av?.ranking} />
    </div>
  );
}
