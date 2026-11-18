'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { Checkbox, Label } from '@/components/ui/form-controls';
import { MultiSelect } from '@/components/ui/select';
import { Field } from '@/components/ui/form';

const U = t.universities;
export interface FilterApi { values: Record<string, string>; list: (k: string) => string[]; set: (p: Record<string, any>) => void }

function CheckGroup({ name, label, map, f }: { name: string; label: string; map: Record<string, string>; f: FilterApi }) {
  const value = f.list(name);
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-label">{label}</legend>
      {Object.entries(map).map(([v, l]) => {
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

/** Бүх шүүлтүүр хамт ажиллана (URL query-тэй синхрон). Desktop-д сайдбар, mobile-д Sheet дотор. */
export function UniversityFilters({ f }: { f: FilterApi }) {
  const { data: meta } = useQuery<{ countries: { slug: string; nameMn: string }[]; cities: string[] }>({ queryKey: ['filter-meta'], queryFn: () => api('/meta/filters') });
  return (
    <div className="grid gap-5">
      <Field label={U.country}><MultiSelect options={(meta?.countries ?? []).map((c) => ({ value: c.slug, label: c.nameMn }))} value={f.list('country')} onChange={(v) => f.set({ country: v })} placeholder={t.common.all} searchPlaceholder={t.common.search} emptyText={t.common.empty} /></Field>
      <CheckGroup f={f} name="degree" label={U.degree} map={U.labelsDegree} />
      <CheckGroup f={f} name="type" label={U.type} map={U.labelsType} />
      <CheckGroup f={f} name="subject" label={U.subject} map={U.labelsSubject} />
      <CheckGroup f={f} name="ranking" label={U.ranking} map={Object.fromEntries(['QS_WORLD', 'QS_ASIA', 'THE_WORLD', 'THE_ASIA', 'ARWU'].map((k) => [k, U.labelsRanking[k]]))} />
      <CheckGroup f={f} name="scholarship" label={U.scholarship} map={U.labelsScholarship} />
    </div>
  );
}
