import { t } from '@/i18n';
import { Field, getPath } from './config';

export function validate(fields: Field[], data: any): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    const v = getPath(data, f.name);
    if (f.required && (v === undefined || v === null || v === '')) errs[f.name] = t.validation.required;
    if (f.type === 'group' && Array.isArray(v)) v.forEach((it, i) => f.fields!.forEach((sf) => { if (sf.required && (it[sf.name] === undefined || it[sf.name] === '')) errs[`${f.name}.${i}.${sf.name}`] = t.validation.required; }));
  }
  return errs;
}
