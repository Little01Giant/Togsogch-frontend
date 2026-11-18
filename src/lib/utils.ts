import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn-ийн стандарт className нэгтгэгч */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
