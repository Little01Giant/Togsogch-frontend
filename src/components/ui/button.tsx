import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[15px] font-extrabold select-none transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--duration-base)] ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 active:translate-y-[3px] [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-brand text-brand-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.22)] hover:brightness-105 active:shadow-none',
        secondary: 'bg-secondary text-secondary-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.22)] hover:brightness-105 active:shadow-none',
        outline: 'border-2 border-input bg-card text-foreground shadow-[0_4px_0_0_var(--input)] hover:bg-muted active:shadow-none',
        ghost: 'text-foreground hover:bg-muted active:translate-y-0',
        destructive: 'bg-destructive text-destructive-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.22)] hover:brightness-105 active:shadow-none',
        link: 'h-auto rounded-sm p-0 font-semibold text-primary underline-offset-4 hover:underline active:translate-y-0 dark:text-secondary',
        soft: 'bg-teal-soft text-teal-soft-foreground hover:brightness-95 active:translate-y-0',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px]',
        default: 'h-11 px-5',
        lg: 'h-14 px-7 text-base',
        icon: 'size-11',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'default', size: 'default', fullWidth: false },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** true үед spinner харуулж, дарагдахгүй болгоно */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);
    if (asChild) return <Comp ref={ref} className={classes} {...props}>{children}</Comp>;
    return (
      <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
