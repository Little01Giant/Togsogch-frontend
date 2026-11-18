import { mn, Dict } from './mn';

/** Одоогоор зөвхөн Монгол. Англи нэмэхдээ en.ts үүсгэж locale-аар сонгоно. */
export const LOCALE = 'mn-MN';
export const CURRENCY = 'MNT';
export const TIMEZONE = 'Asia/Ulaanbaatar';

export function useT(): Dict { return mn; }
export const t = mn;

/** YYYY-MM-DD (Монголд түгээмэл, нэг утгатай) */
export const fmtDate = (d?: string | Date | null) =>
  d ? new Intl.DateTimeFormat('sv-SE', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d)) : null;
export const fmtNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);
export const fmtUsd = (n: number) => `${fmtNumber(Math.round(n))} USD`;
