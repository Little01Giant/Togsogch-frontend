'use client';
import * as React from 'react';
import { LogoMark } from '@/components/brand/logo-mark';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/overlays';

export interface Cheer { emoji: string; text: string; sub: string }

const AUTO_CLOSE_MS = 3000;

/** Хэсэг дуусах бүрт гарах урам өгөх modal: 3 секундын дараа өөрөө хаагдана. Radix Dialog нь арын scroll-ыг түгжинэ. */
export function CheerModal({ cheer, onClose }: { cheer: Cheer | null; onClose: () => void }) {
  React.useEffect(() => {
    if (!cheer) return;
    const id = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(id);
  }, [cheer, onClose]);
  return (
    <Dialog open={!!cheer} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xs justify-items-center py-8 text-center">
        <LogoMark body className="anim-pop size-32" />
        <DialogTitle>{cheer?.text}</DialogTitle>
        <DialogDescription>{cheer?.sub}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
