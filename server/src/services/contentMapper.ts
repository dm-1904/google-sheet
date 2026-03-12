import type { SeoArticle, SeoArticleIndexItem } from '../types/post.js';
import { REQUIRED_HEADERS } from '../types/post.js';

const TRUE_VALUES = new Set(['true', '1', 'yes', 'y', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'n', 'off']);

const normalizeHeaderKey = (value: string): string => {
  return value
    .trim()
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
};

const normalizeDate = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return parsed.toISOString();
};

const parseBoolean = (value: string, fallback = false): boolean => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (TRUE_VALUES.has(normalized)) {
    return true;
  }
  if (FALSE_VALUES.has(normalized)) {
    return false;
  }
  return fallback;
};

const validateHeaders = (headers: string[]): void => {
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required sheet headers: ${missingHeaders.join(', ')}`);
  }
};

const asRowMap = (headers: string[], row: string[]): Record<string, string> => {
  return headers.reduce<Record<string, string>>((acc, header, index) => {
    acc[header] = row[index] ?? '';
    return acc;
  }, {});
};

const getField = (row: Record<string, string>, key: string): string => {
  return row[key] ?? '';
};

const normalizePath = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const buildCanonicalUrl = (canonicalUrl: string, slug: string): string => {
  const explicitCanonical = canonicalUrl.trim();
  if (explicitCanonical) {
    return explicitCanonical;
  }

  const baseUrl = (process.env.SITE_BASE_URL ?? '').trim().replace(/\/$/, '');
  const path = `/blog/${slug}`;
  return baseUrl ? `${baseUrl}${path}` : path;
};

const sanitizeTrustedHtml = (value: string): string => {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|link|meta)[^>]*?>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])javascript:[^'"]*\2/gi, ' $1="#"');
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const plainTextToHtml = (value: string): string => {
  const chunks = value
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    return '';
  }

  return chunks
    .map((chunk) => `<p>${escapeHtml(chunk).replace(/\n/g, '<br />')}</p>`)
    .join('\n');
};

const toSafeRenderableHtml = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  return looksLikeHtml ? sanitizeTrustedHtml(trimmed) : plainTextToHtml(trimmed);
};

const isPublishedStatus = (status: string): boolean => {
  const normalized = status.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return ['published', 'live', 'public'].includes(normalized);
};

const sortByDateDesc = (left: SeoArticle, right: SeoArticle): number => {
  const leftDate = new Date(left.publish_date || left.update_date || '').getTime();
  const rightDate = new Date(right.publish_date || right.update_date || '').getTime();
  const leftSafe = Number.isNaN(leftDate) ? 0 : leftDate;
  const rightSafe = Number.isNaN(rightDate) ? 0 : rightDate;
  return rightSafe - leftSafe;
};

const dedupeBySlug = (articles: SeoArticle[]): SeoArticle[] => {
  const seen = new Set<string>();
  const unique: SeoArticle[] = [];

  for (const article of articles) {
    if (seen.has(article.slug)) {
      console.warn(`Duplicate slug "${article.slug}" found in sheet. Keeping latest row only.`);
      continue;
    }

    seen.add(article.slug);
    unique.push(article);
  }

  return unique;
};

const toSeoArticle = (row: Record<string, string>): SeoArticle => {
  const status = getField(row, 'status').trim();
  const slug = getField(row, 'slug').trim();

  const updateDate = normalizeDate(getField(row, 'update_date'));
  const metaRobots = getField(row, 'meta_robots').trim();
  const introLede = getField(row, 'intro_lede').trim();
  const featuredImageUrl = getField(row, 'featured_image_url').trim();
  const featuredImageAlt = getField(row, 'featured_image_alt').trim();
  const categorySlug = getField(row, 'category_slug').trim();
  const internalLinksJson = getField(row, 'internal_links_json').trim();
  const breadcrumbJson = getField(row, 'breadcrumb_json').trim();
  const schemaPrimaryType = getField(row, 'schema_primary_type').trim();
  const primaryCity = getField(row, 'primary_city').trim();
  const primaryState = getField(row, 'primary_state').trim();

  const article: SeoArticle = {
    status,
    slug,
    canonical_url: buildCanonicalUrl(getField(row, 'canonical_url'), slug),
    publish_date: normalizeDate(getField(row, 'publish_date')),
    title_tag: getField(row, 'title_tag').trim(),
    meta_description: getField(row, 'meta_description').trim(),
    h1: getField(row, 'h1').trim() || getField(row, 'title_tag').trim(),
    content_body: toSafeRenderableHtml(getField(row, 'content_body')),
  };

  if (updateDate) {
    article.update_date = updateDate;
  }
  if (metaRobots) {
    article.meta_robots = metaRobots;
  }
  if (introLede) {
    article.intro_lede = introLede;
  }
  if (featuredImageUrl) {
    article.featured_image_url = featuredImageUrl;
  }
  if (featuredImageAlt) {
    article.featured_image_alt = featuredImageAlt;
  }
  if (categorySlug) {
    article.category_slug = categorySlug;
  }
  if (internalLinksJson) {
    article.internal_links_json = internalLinksJson;
  }
  if (breadcrumbJson) {
    article.breadcrumb_json = breadcrumbJson;
  }
  if (schemaPrimaryType) {
    article.schema_primary_type = schemaPrimaryType;
  }
  article.schema_enable_article = parseBoolean(getField(row, 'schema_enable_article'), true);
  article.schema_enable_breadcrumb = parseBoolean(getField(row, 'schema_enable_breadcrumb'), true);
  article.schema_enable_faq = parseBoolean(getField(row, 'schema_enable_faq'), false);
  if (primaryCity) {
    article.primary_city = primaryCity;
  }
  if (primaryState) {
    article.primary_state = primaryState;
  }

  return article;
};

export const mapSheetValuesToSeoArticles = (values: string[][]): SeoArticle[] => {
  if (values.length === 0) {
    return [];
  }

  const [rawHeaders, ...rows] = values;
  const headers = rawHeaders.map((header) => normalizeHeaderKey(String(header)));
  validateHeaders(headers);

  const mapped = rows
    .map((row) => toSeoArticle(asRowMap(headers, row)))
    .filter((article) => article.slug && article.title_tag && article.meta_description && isPublishedStatus(article.status))
    .sort(sortByDateDesc);

  return dedupeBySlug(mapped);
};

export const toSeoArticleIndexItem = (article: SeoArticle): SeoArticleIndexItem => {
  return {
    status: article.status,
    slug: article.slug,
    canonical_url: article.canonical_url,
    publish_date: article.publish_date,
    update_date: article.update_date,
    title_tag: article.title_tag,
    meta_description: article.meta_description,
    h1: article.h1,
    intro_lede: article.intro_lede,
    featured_image_url: article.featured_image_url,
    featured_image_alt: article.featured_image_alt,
    category_slug: article.category_slug,
  };
};
