import * as React from 'react';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/brand/logo-mark';
import type { MascotMood } from '@/components/brand/mascot';

const WIDTH = { default: 'max-w-[1280px]', narrow: 'max-w-3xl', form: 'max-w-xl', wide: 'max-w-[1440px]' } as const;

/** Нэгдсэн агуулгын өргөн + хөндлөн зай (gutter). Desktop дээр ~1280px. */
export function PageContainer({ size = 'default', className, children, as: As = 'div' }: { size?: keyof typeof WIDTH; className?: string; children: React.ReactNode; as?: React.ElementType }) {
  return <As className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', WIDTH[size], className)}>{children}</As>;
}

/** Хуудасны гарчигийн блок: гарчиг + тайлбар + (баруун талд) үйлдэл */
export function PageHeader({ title, description, actions, mascot, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; mascot?: MascotMood; className?: string }) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-6', className)}>
      <div className="min-w-0 max-w-2xl"><h1 className="text-h1 font-extrabold">{title}</h1>{description && <p className="mt-1.5 text-body text-muted-foreground">{description}</p>}</div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      {mascot && <LogoMark className="hidden size-20 shrink-0 sm:block" />}
    </div>
  );
}

export function Section({ eyebrow, title, description, href, cta, children, className }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; href?: string; cta?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('mt-8 md:mt-12', className)}>
      <PageContainer>
        <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
          <div className="min-w-0 max-w-2xl">{eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}<h2 className="text-h2">{title}</h2>{description && <p className="mt-1.5 text-body text-muted-foreground">{description}</p>}</div>
          {href && <div className="shrink-0">{cta}</div>}
        </div>
        {children}
      </PageContainer>
    </section>
  );
}
