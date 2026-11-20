/** Тестийн үр дүнгийн хариуны төрлүүд (backend `assessments` үр дүнтэй тохирно). */

export interface CareerMatch { slug: string; nameMn: string; nameEn?: string; score: number }
export interface CategoryCareer { slug: string; nameMn: string; absoluteScore: number }
export interface CategoryMatch { slug: string; nameMn: string; careerCount: number; absoluteScore: number; careers: CategoryCareer[] }
export interface LeastMatch extends CareerMatch { why: string[]; breakdown?: Record<string, number | undefined> }
export interface NamedScore { key?: string; name: string; score: number | null }

export interface ResultSchool { slug: string; name: string; city?: string | null; country?: { code?: string; nameMn?: string } | null }
export interface ResultFooter { method?: { note?: string; weights?: Record<string, number> }; disclaimer?: string }
type Breakdown = Record<string, number | null> | null;

export interface MastersField {
  slug: string; nameMn: string; nameEn: string; typeLabel: string; score: number; description?: string;
  why: string[]; breakdown: Breakdown; prerequisites?: string[]; competencies?: string[]; commonExams?: string[]; uniSubject?: string;
  universities?: ResultSchool[]; countries?: { slug: string; code?: string; nameMn: string; preferred?: boolean }[];
}
export interface MastersResultData extends ResultFooter {
  summary?: string; completedAt?: string;
  profile?: { bachelorArea?: string; years?: number | string; goal?: string };
  knowledgeGaps?: string[]; byType?: Record<string, string[]>; typeLabels: Record<string, string>; programNote?: string;
  fieldMatches?: MastersField[];
}

export interface LanguageCountryMatch {
  slug: string; code?: string; nameMn: string; nameEn: string; score: number; why: string[]; breakdown: Breakdown;
  pros: string[]; cons: string[]; costTier?: string | null; languages?: string[];
  livingCostMonthlyUsd?: { min?: number | null; max?: number | null } | null;
  tuitionRange?: string | null; languagePrepInfo?: string | null; scholarshipInfo?: string | null; languagePrepUniversities?: string | null;
  visaLinks?: { url: string; title: string }[];
}
export interface LanguageResultData extends ResultFooter { countryMatches?: LanguageCountryMatch[] }

export interface CityMeta { langPrepWorkNote?: string; budgetM?: [number, number]; postGradVisa?: string }
export interface DreamCity {
  id: string; nameMn: string; countryCode: string; countryMn: string; score: number;
  why: string[]; breakdown: Record<string, number>; meta?: CityMeta;
  universities?: { slug: string; name: string; city?: string | null }[];
}
export interface CityResultData {
  universityGate?: { career: boolean; masters: boolean; mode: 'master' | 'bachelor' | 'none' };
  readiness?: { priorMissing?: boolean; low?: boolean };
  languagePrep?: { languageMn: string; durationMn?: string };
  dreamCities?: DreamCity[];
  method?: { note?: string; weights?: Record<string, number> };
  disclaimer?: string;
}

export interface CareerResultData {
  completedAt?: string;
  riasec?: Record<string, number | null>;
  hollandCode?: string;
  summary?: string;
  quality?: { reducedConfidence?: boolean; missingAnswers?: number };
  counselorFlags?: { key: string; text: string }[];
  notes?: string[];
  strengths?: { key: string; name: string }[];
  careerMatches?: CareerMatch[];
  categoryMatches?: CategoryMatch[];
  personality?: NamedScore[];
  cognitive?: NamedScore[];
  environment?: { label: string };
  subjectsFocus?: { key: string; name: string }[];
  skillGaps?: { key: string; name: string; user: number | string; required: number | string; careers: string[] }[];
  leastMatches?: LeastMatch[];
  method?: { note?: string };
  disclaimer?: string;
}
