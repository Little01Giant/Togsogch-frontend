'use client';
import * as React from 'react';
import { ThemeProvider as NextThemes } from 'next-themes';

/** Сайт үргэлж Dark горимтой: сонголт, системийн тохиргоо үл нөлөөлнө (forcedTheme). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemes attribute="class" forcedTheme="dark" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>{children}</NextThemes>;
}
