import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAllPosts } from '../services/sheetsCms.js';

type StaticSitemapEntry = {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
};

const STATIC_SITEMAP_ENTRIES: StaticSitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
  { path: '/neighborhood-guides', changefreq: 'weekly', priority: '0.8' },
  {
    path: '/neighborhood-guides/retirement-communities',
    changefreq: 'weekly',
    priority: '0.7',
  },
];

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const normalizeBaseUrl = (value: string): string => value.trim().replace(/\/$/, '');

const toAbsoluteUrl = (value: string, baseUrl: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalizedPath}`;
};

const isNoIndexDirective = (value?: string): boolean => {
  return /(^|,)\s*noindex\s*(,|$)/i.test(value ?? '');
};

const toIsoDate = (value?: string): string | undefined => {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
};

export const seoRouter = Router();

seoRouter.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const envBaseUrl = normalizeBaseUrl(process.env.SITE_BASE_URL ?? '');
    const requestBaseUrl = normalizeBaseUrl(`${req.protocol}://${req.get('host') ?? ''}`);
    const baseUrl = envBaseUrl || requestBaseUrl;

    if (!baseUrl) {
      res.status(500).type('text/plain').send('SITE_BASE_URL is required to generate sitemap');
      return;
    }

    const posts = await getAllPosts();
    const postEntries = posts
      .filter((post) => !isNoIndexDirective(post.meta_robots))
      .map((post) => {
        const loc = toAbsoluteUrl(post.canonical_url || `/blog/${post.slug}`, baseUrl);
        const lastmod = toIsoDate(post.update_date || post.publish_date);
        return {
          loc,
          lastmod,
          changefreq: 'monthly',
          priority: '0.7',
        };
      })
      .filter((entry) => Boolean(entry.loc));

    const staticEntries = STATIC_SITEMAP_ENTRIES.map((entry) => ({
      loc: toAbsoluteUrl(entry.path, baseUrl),
      changefreq: entry.changefreq,
      priority: entry.priority,
      lastmod: undefined,
    }));

    const allEntries = [...staticEntries, ...postEntries];

    const urlNodes = allEntries
      .map((entry) => {
        const parts = [
          `<loc>${escapeXml(entry.loc)}</loc>`,
          entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '',
          `<changefreq>${entry.changefreq}</changefreq>`,
          `<priority>${entry.priority}</priority>`,
        ]
          .filter(Boolean)
          .join('');
        return `<url>${parts}</url>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlNodes}</urlset>`;

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=900');
    res.type('application/xml').send(xml);
  } catch (error) {
    console.error('Unable to generate sitemap:', error);
    res.status(500).type('text/plain').send('Unable to generate sitemap');
  }
});
