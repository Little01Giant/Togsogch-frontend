'use client';
import * as React from 'react';
import { Controller, FormProvider, useFormContext, useFormState, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Slot } from '@radix-ui/react-slot';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './form-controls';

/* ───────── react-hook-form холбоотой (shadcn Form) ───────── */
export const Form = FormProvider;

type FieldCtx = { name: string };
const FormFieldContext = React.createContext<FieldCtx>({} as FieldCtx);
type ItemCtx = { id: string };
const FormItemContext = React.createContext<ItemCtx>({} as ItemCtx);

export function FormField<T extends FieldValues = FieldValues, N extends FieldPath<T> = FieldPath<T>>(props: ControllerProps<T, N>) {
  return <FormFieldContext.Provider value={{ name: props.name }}><Controller {...props} /></FormFieldContext.Provider>;
}

function useFormField() {
  const { name } = React.useContext(FormFieldContext);
  const { id } = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const state = useFormState({ name });
  const fs = getFieldState(name, state);
  return { id, name, error: fs.error, formItemId: `${id}-item`, formDescriptionId: `${id}-desc`, formMessageId: `${id}-msg` };
}

export const FormItem = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => {
  const id = React.useId();
  return <FormItemContext.Provider value={{ id }}><div className={cn('grid gap-1.5', className)} {...p} /></FormItemContext.Provider>;
};
export const FormLabel = ({ className, children, required, ...p }: React.ComponentProps<typeof Label> & { required?: boolean }) => {
  const { error, formItemId } = useFormField();
  return <Label htmlFor={formItemId} className={cn(error && 'text-destructive', className)} {...p}>{children}{required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}</Label>;
};
export const FormControl = (props: React.ComponentProps<typeof Slot>) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return <Slot id={formItemId} aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId} aria-invalid={!!error} {...props} />;
};
export const FormDescription = ({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn('text-caption text-muted-foreground', className)} {...p} />;
};
export const FormMessage = ({ className, children, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;
  if (!body) return null;
  return <p id={formMessageId} role="alert" className={cn('flex items-center gap-1 text-caption font-medium text-destructive', className)} {...p}><AlertCircle className="size-3.5" aria-hidden />{body}</p>;
};

/* ───────── RHF-гүй формд: Field (label + тайлбар + алдаа) ───────── */
export function Field({ label, description, error, required, htmlFor, children, className }: { label?: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode; required?: boolean; htmlFor?: string; children: React.ReactNode; className?: string }) {
  const auto = React.useId();
  const id = htmlFor ?? auto;
  const child = React.isValidElement(children) && !htmlFor
    ? React.cloneElement(children as React.ReactElement<any>, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-err` : description ? `${id}-desc` : undefined })
    : children;
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label && <Label htmlFor={id} className={cn(error && 'text-destructive')}>{label}{required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}</Label>}
      {child}
      {description && !error && <p id={`${id}-desc`} className="text-caption text-muted-foreground">{description}</p>}
      {error && <p id={`${id}-err`} role="alert" className="flex items-center gap-1 text-caption font-medium text-destructive"><AlertCircle className="size-3.5" aria-hidden />{error}</p>}
    </div>
  );
}
