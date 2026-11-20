/** `/universities/:slug` хариуны төрөл (backend `catalog.service` payload-той тохирно). */
export type UniCategory = 'tuition' | 'english' | 'procedure';

import type { ComponentProps } from 'react';
import type { SourceBadge } from '@/components/common';
import type { MediaCredits } from '@/components/education/media-credits';
import type { Tuition } from '@/components/education/tuition-display';

export interface UniTuition extends Tuition {
  level: string;
  faculty?: string | null;
  feeType?: string | null;
  otherFees?: string | null;
  sourceUrl?: string | null;
}

export interface UniEnglishTest { test: string; minScore?: string | null; note?: string | null }
export interface UniRule { text: string; sourceName?: string | null; sourceUrl?: string | null; verifiedAt?: string | null }
export interface UniLink { url: string; title?: string | null }

export interface UniPaid {
  tuition: UniTuition[];
  english: UniEnglishTest[];
  englishUrl?: string | null;
  languageRules: UniRule[];
  procedure: { steps: string[]; links: UniLink[] };
}

export interface UniRanking { provider: string; year: number; rank?: number | null; rankText?: string | null; subject?: string | null; sourceUrl?: string | null }

export interface UniTuitionEstimateItem { currency: string; n?: number | null; min: number; median: number; max: number }
export interface UniTuitionEstimate { items: UniTuitionEstimateItem[]; sourceName?: string | null; sourceUrl?: string | null }

export interface UniCountry {
  id: string;
  nameMn: string;
  code?: string | null;
  universityCount?: number;
  /** Улсыг бүтнээр нээх үнэ: сервер тооцсон (нээгдэх сургуулийн тоо × нэгж үнэ) */
  unlockPrice?: { schools: number; unitMnt: number; priceMnt: number };
  livingCostMonthlyUsd?: { min?: number | null; max?: number | null } | null;
  tuitionEstimate?: UniTuitionEstimate | null;
  source?: { sourceName?: string | null; sourceUrl?: string | null } | null;
}

export interface UniDetail {
  id: string;
  name: string;
  nameMn?: string | null;
  city?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  images?: string[];
  media?: ComponentProps<typeof MediaCredits>['media'];
  source?: ComponentProps<typeof SourceBadge>['source'];
  rankings?: UniRanking[];
  country: UniCountry & { code?: string | null };
  access: UniAccess;
  paid: UniPaid;
}

export interface UniAccess { unlocked: boolean; categories: { key: UniCategory; available: boolean }[] }
