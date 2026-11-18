'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/data-display';
import { Checkbox, Input, Label, Textarea } from '@/components/ui/form-controls';
import { Field } from '@/components/ui/form';
import { Combobox, MultiSelect, SimpleSelect, TagsInput } from '@/components/ui/select';
import { DatePicker, NumberInput } from '@/components/ui/misc';
import { Field as FieldDef, getPath, setPath } from './config';
import { validate } from './validate';
export { validate };

function RefSelect({ f, value, onChange, error }: { f: FieldDef; value: any; onChange: (v: any) => void; error?: string }) {
  const { data } = useQuery<{ items: any[] }>({ queryKey: ['admin-ref', f.ref!.resource], queryFn: () => api(`/admin/${f.ref!.resource}`, { query: { pageSize: 100 } }) });
  return <Combobox invalid={!!error} value={value ? String(value._id ?? value) : undefined} onChange={onChange} options={(data?.items ?? []).map((i) => ({ value: i._id, label: i[f.ref!.labelKey] }))} placeholder={t.common.all} searchPlaceholder={t.common.search} emptyText={t.common.empty} />;
}

function JsonField({ value, onChange, error }: { value: any; onChange: (v: any) => void; error?: string }) {
  const [text, setText] = useState(JSON.stringify(value ?? {}, null, 2));
  const [err, setErr] = useState<string>();
  return <><Textarea rows={6} className="font-mono text-xs" value={text} aria-invalid={!!(err ?? error)} onChange={(e) => { setText(e.target.value); try { onChange(JSON.parse(e.target.value || '{}')); setErr(undefined); } catch { setErr('JSON буруу байна'); } }} />{(err ?? error) && <p role="alert" className="mt-1 text-caption font-medium text-destructive">{err ?? error}</p>}</>;
}

export function FieldInput({ f, value, onChange, error }: { f: FieldDef; value: any; onChange: (v: any) => void; error?: string }) {
  const wrap = (child: React.ReactNode) => <Field label={f.label} description={f.hint} error={error} required={f.required}>{child}</Field>;
  switch (f.type) {
    case 'text': return wrap(<Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />);
    case 'textarea': return wrap(<Textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />);
    case 'number': return wrap(<NumberInput value={value} onValueChange={onChange} />);
    case 'select': return wrap(<SimpleSelect clearable options={f.options ?? []} value={value} onValueChange={onChange} />);
    case 'multiselect': return wrap(<MultiSelect options={f.options ?? []} value={value ?? []} onChange={onChange} placeholder={t.common.all} searchPlaceholder={t.common.search} emptyText={t.common.empty} />);
    case 'tags': return wrap(<TagsInput value={value ?? []} onChange={onChange} />);
    case 'checkbox': return <div className="flex items-center gap-2.5 pt-7"><Checkbox id={`cb-${f.name}`} checked={!!value} onCheckedChange={(c) => onChange(!!c)} /><Label htmlFor={`cb-${f.name}`} className="cursor-pointer font-normal">{f.label}</Label></div>;
    case 'date': return wrap(<DatePicker value={value} onChange={(v) => onChange(v ? new Date(v).toISOString() : undefined)} />);
    case 'ref': return wrap(<RefSelect f={f} value={value} onChange={onChange} error={error} />);
    case 'json': return wrap(<JsonField value={value} onChange={onChange} error={error} />);
    case 'group': {
      const items: any[] = value ?? [];
      return (
        <div className="grid gap-2"><p className="text-label">{f.label}</p>{f.hint && <p className="text-caption text-muted-foreground">{f.hint}</p>}
          {items.map((it, i) => (
            <Card key={i} className="bg-muted/40 p-3"><div className="mb-2 flex justify-end"><Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={t.common.delete} onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 /></Button></div>
              <div className="grid gap-3 sm:grid-cols-2">{f.fields!.map((sf) => <FieldInput key={sf.name} f={sf} value={it[sf.name]} onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [sf.name]: v } : x)))} />)}</div></Card>
          ))}
          <div><Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, {}])}><Plus />{t.common.create}</Button></div>
        </div>
      );
    }
  }
}

export function FieldForm({ fields, data, onChange, errors }: { fields: FieldDef[]; data: any; onChange: (d: any) => void; errors: Record<string, string> }) {
  const sections: Record<string, FieldDef[]> = {};
  fields.forEach((f) => (sections[f.section ?? ''] ??= []).push(f));
  return (
    <div className="grid gap-6">
      {Object.entries(sections).map(([name, fs]) => (
        <section key={name} className="grid gap-3">
          {name && <h3 className="border-b pb-1.5 text-label text-muted-foreground">{name}</h3>}
          <div className="grid gap-4 sm:grid-cols-2">
            {fs.map((f) => <div key={f.name} className={['group', 'textarea', 'json'].includes(f.type) ? 'sm:col-span-2' : undefined}><FieldInput f={f} value={getPath(data, f.name)} onChange={(v) => onChange(setPath(data, f.name, v))} error={errors[f.name]} /></div>)}
          </div>
        </section>
      ))}
    </div>
  );
}
