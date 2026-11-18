'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { t } from '@/i18n';
import { Checkbox } from '@/components/ui/form-controls';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const consentSchema = z.object({
  privacyAccepted: z.literal(true, { error: t.validation.required }),
  termsAccepted: z.literal(true, { error: t.validation.required }),
  isMinor: z.boolean(),
  parentalConsentConfirmed: z.boolean(),
}).refine((v) => !v.isMinor || v.parentalConsentConfirmed, { path: ['parentalConsentConfirmed'], message: t.validation.required });
export type ConsentValues = z.infer<typeof consentSchema>;

/** Нууцлал, нөхцөл өгөгдмөлөөр чагтлагдсан; «18 нас хүрээгүй» нь мэдүүлэг тул чагтлаагүй. */
export const consentDefaults: ConsentValues = { privacyAccepted: true, termsAccepted: true, isMinor: false, parentalConsentConfirmed: false };

const DRAFT_KEY = 'consent-draft';
/** Нэвтрэх хуудсан дээр өгсөн зөвшөөрлийг Google-ийн redirect-ээр дамжуулж хадгална (зөвхөн энэ табд). */
export function saveConsentDraft(v: ConsentValues) { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* хадгалж чадаагүй бол нэвтэрсний дараа дахин асууна */ } }
export function clearConsentDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }
export function readConsentDraft(): ConsentValues | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const parsed = raw ? consentSchema.safeParse(JSON.parse(raw)) : null;
    return parsed?.success ? parsed.data : null;
  } catch { return null; }
}

function CheckField({ form, name, label }: { form: UseFormReturn<ConsentValues>; name: keyof ConsentValues; label: ReactNode }) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem><div className="flex items-start gap-3"><FormControl><Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-0.5" /></FormControl><FormLabel className="cursor-pointer font-normal leading-snug">{label}</FormLabel></div><FormMessage /></FormItem>
    )} />
  );
}

export function ConsentFields({ form }: { form: UseFormReturn<ConsentValues> }) {
  return (
    <>
      <CheckField form={form} name="privacyAccepted" label={<>{t.auth.privacyAccept} (<Link href="/privacy" target="_blank" className="text-primary underline dark:text-secondary">{t.legal.privacyTitle}</Link>)</>} />
      <CheckField form={form} name="termsAccepted" label={<>{t.auth.termsAccept} (<Link href="/terms" target="_blank" className="text-primary underline dark:text-secondary">{t.legal.termsTitle}</Link>)</>} />
    </>
  );
}
