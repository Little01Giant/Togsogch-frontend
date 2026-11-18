/**
 * Дизайн токенуудын TypeScript толь (CSS хувьсагчтай нэг эх сурвалж: src/styles/globals.css).
 * Компонентод өнгө хатуу бичихгүй — Tailwind-ийн семантик класс (bg-primary, text-muted-foreground …) ашиглана.
 */
export const BRAND = {
  navy: '#142C4E', teal: '#54D6C5', gold: '#E8A94B', background: '#F4F7FA', surface: '#FFFFFF',
  textSecondary: '#64748B', border: '#E2E8F0', success: '#16A36A', destructive: '#DC5252', info: '#4385C5',
} as const;

export const RADIUS = { sm: 6, md: 10, lg: 14, xl: 20 } as const;
export const CONTAINER = { max: 1280, narrow: 768, form: 560 } as const;
export const BREAKPOINTS = { xs: 480, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export const Z_INDEX = { sticky: 30, header: 40, overlay: 50, modal: 60, toast: 70 } as const;
export const DURATION = { fast: 120, base: 180, slow: 280 } as const;
export const SPACING = { gutter: 16, section: 64, sectionLg: 96 } as const;

export const STALE_MONTHS = 12;
export const COMPARE_MAX = 4;

/** <meta name="theme-color"> CSS хувьсагч ойлгодоггүй тул HEX хэрэгтэй (globals.css-ийн --background-той нийцүүл) */
export const THEME_COLOR = { light: '#FFFFFF', dark: '#131F24' } as const;
