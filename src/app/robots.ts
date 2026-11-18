import type { MetadataRoute } from 'next';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/profile', '/dashboard'] }],
    ...(SITE ? { sitemap: `${SITE}/sitemap.xml` } : {}),
  };
}
