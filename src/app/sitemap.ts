import type { MetadataRoute } from 'next';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
const ROUTES = ['', '/assessments', '/careers', '/countries', '/universities', '/compare', '/eligibility', '/future-careers', '/privacy', '/terms'];

/** Нийтийн статик хуудсууд. NEXT_PUBLIC_SITE_URL тохируулаагүй бол хоосон (буруу домэйн зарлахгүй). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE) return [];
  return ROUTES.map((r) => ({ url: `${SITE}${r}`, changeFrequency: 'weekly' as const }));
}
