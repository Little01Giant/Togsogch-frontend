'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/layout/theme';
import { Toaster } from '@/components/ui/misc';
import { TooltipProvider } from '@/components/ui/overlays';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } } }));
  return (
    <ThemeProvider>
      <QueryClientProvider client={qc}><TooltipProvider delayDuration={200}>{children}</TooltipProvider><Toaster /></QueryClientProvider>
    </ThemeProvider>
  );
}
