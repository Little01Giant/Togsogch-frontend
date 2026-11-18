'use client';
import * as React from 'react';
import { ThemeProvider as NextThemes, useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/overlays';

/** Dark — анхдагч (шинэ хэрэглэгчид). Хэрэглэгч Light/System сонгож болно; сонголт нь хөтөч дээр хадгалагдана. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemes attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>{children}</NextThemes>;
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const items = [{ v: 'light', label: 'Light', icon: Sun }, { v: 'dark', label: 'Dark', icon: Moon }, { v: 'system', label: 'System', icon: Monitor }];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Өнгөний горим"><Sun className="size-[18px] dark:hidden" /><Moon className="hidden size-[18px] dark:block" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">{items.map((i) => <DropdownMenuItem key={i.v} active={theme === i.v} onSelect={() => setTheme(i.v)}><i.icon />{i.label}</DropdownMenuItem>)}</DropdownMenuContent>
    </DropdownMenu>
  );
}
