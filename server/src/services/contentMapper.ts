import type { SeoArticle, SeoArticleIndexItem } from '../types/post.js';
import { REQUIRED_HEADERS } from '../types/post.js';

const TRUE_VALUES = new Set(['true', '1', 'yes', 'y', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'n', 'off']);
const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const US_DATE_ONLY_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const ALLOWED_SCHEMA_PRIMARY_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle']);
const PLACEHOLDER_CANONICAL_HOSTS = new Set([
  'yourdomain.com',
  'www.yourdomain.com',
  'example.com',
  'www.example.com',
]);

const normalizeHeaderKey = (value: string): string => {
  return value
    .trim()
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
};

const toIsoDateOnly = (year: number, month: number, day: number): string => {
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return '';
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const normalizeDate = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const isoDateOnlyMatch = ISO_DATE_ONLY_PATTERN.exec(trimmed);
  if (isoDateOnlyMatch) {
    return toIsoDateOnly(
      Number(isoDateOnlyMatch[1]),
      Number(isoDateOnlyMatch[2]),
      Number(isoDateOnlyMatch[3]),
    );
  }

  const usDateOnlyMatch = US_DATE_ONLY_PATTERN.exec(trimmed);
  if (usDateOnlyMatch) {
    const isoDate = toIsoDateOnly(
      Number(usDateOnlyMatch[3]),
      Number(usDateOnlyMatch[1]),
      Number(usDateOnlyMatch[2]),
    );
    return isoDate || trimmed;
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

const normalizeFeaturedImageUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('images/')) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith('blog/')) {
    return `/images/${trimmed}`;
  }

  return `/images/blog/${trimmed}`;
};

const isPlaceholderCanonicalUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return PLACEHOLDER_CANONICAL_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
};

const buildCanonicalUrl = (canonicalUrl: string, slug: string): string => {
  const explicitCanonical = canonicalUrl.trim();
  if (explicitCanonical && !isPlaceholderCanonicalUrl(explicitCanonical)) {
    return explicitCanonical;
  }

  const baseUrl = (process.env.SITE_BASE_URL ?? '').trim().replace(/\/$/, '');
  const path = `/blog/${slug}`;
  return baseUrl ? `${baseUrl}${path}` : path;
};

const normalizeSchemaPrimaryType = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return ALLOWED_SCHEMA_PRIMARY_TYPES.has(trimmed) ? trimmed : '';
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

const sanitizeLinkUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '#';
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return '#';
};

const renderInlineMarkdown = (value: string): string => {
  let output = escapeHtml(value);

  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, url: string) => `<a href="${sanitizeLinkUrl(url)}">${label}</a>`,
  );
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  output = output.replace(/_([^_]+)_/g, '<em>$1</em>');

  return output;
};

const stripHtml = (value: string): string => {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

const resolveExcerpt = (explicitExcerpt: string, introLede: string, contentBody: string): string => {
  const fromExplicit = explicitExcerpt.trim();
  if (fromExplicit) {
    return fromExplicit;
  }

  const fromLede = introLede.trim();
  if (fromLede) {
    return fromLede;
  }

  const plainTextContent = stripHtml(contentBody);
  if (!plainTextContent) {
    return '';
  }

  return truncateText(plainTextContent, 190);
};

const normalizeInlineHeadingMarkdown = (value: string): string => {
  if (value.includes('\n') || !value.includes('## ')) {
    return value;
  }

  const sections = value
    .split(/\s(?=##\s)/)
    .map((section) => section.trim())
    .filter(Boolean);

  if (sections.length <= 1) {
    return value;
  }

  const sentenceStarterWords = [
    'The',
    'One',
    'Many',
    'Several',
    'Some',
    'For',
    'Residents',
    'Families',
    'Outdoor',
    'Other',
  ];

  const starterPattern = new RegExp(
    `^(.+?)\\s+(${sentenceStarterWords.join('|')})\\b([\\s\\S]*)$`,
  );

  return sections
    .map((section) => {
      const body = section.replace(/^##\s*/, '').trim();
      if (!body) {
        return '';
      }

      const questionMatch = /^(.+?\?)\s+(.+)$/.exec(body);
      if (questionMatch) {
        return `## ${questionMatch[1].trim()}\n\n${questionMatch[2].trim()}`;
      }

      const starterMatch = starterPattern.exec(body);
      if (starterMatch && starterMatch[1].trim().split(/\s+/).length >= 3) {
        const heading = starterMatch[1].trim();
        const paragraph = `${starterMatch[2]}${starterMatch[3]}`.trim();
        return paragraph ? `## ${heading}\n\n${paragraph}` : `## ${heading}`;
      }

      const isSentenceMatch = /^(.+?)\s+([A-Z][a-z]+)\s+is\s+(.+)$/.exec(body);
      if (isSentenceMatch && isSentenceMatch[1].trim().split(/\s+/).length >= 3) {
        const heading = isSentenceMatch[1].trim();
        const paragraph = `${isSentenceMatch[2]} is ${isSentenceMatch[3]}`.trim();
        return `## ${heading}\n\n${paragraph}`;
      }

      return `## ${body}`;
    })
    .filter(Boolean)
    .join('\n\n');
};

const markdownToHtml = (value: string): string => {
  const normalizedInput = normalizeInlineHeadingMarkdown(value).replace(/\r\n/g, '\n');
  const lines = normalizedInput.split('\n');
  const html: string[] = [];

  let inUnorderedList = false;
  let inOrderedList = false;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }
    const paragraph = paragraphBuffer.map((line) => renderInlineMarkdown(line)).join('<br />');
    html.push(`<p>${paragraph}</p>`);
    paragraphBuffer = [];
  };

  const closeLists = () => {
    if (inUnorderedList) {
      html.push('</ul>');
      inUnorderedList = false;
    }
    if (inOrderedList) {
      html.push('</ol>');
      inOrderedList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeLists();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      closeLists();
      const level = Math.max(2, headingMatch[1].length);
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const unorderedListMatch = /^[-*]\s+(.+)$/.exec(line);
    if (unorderedListMatch) {
      flushParagraph();
      if (inOrderedList) {
        html.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        html.push('<ul>');
        inUnorderedList = true;
      }
      html.push(`<li>${renderInlineMarkdown(unorderedListMatch[1])}</li>`);
      continue;
    }

    const orderedListMatch = /^\d+\.\s+(.+)$/.exec(line);
    if (orderedListMatch) {
      flushParagraph();
      if (inUnorderedList) {
        html.push('</ul>');
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        html.push('<ol>');
        inOrderedList = true;
      }
      html.push(`<li>${renderInlineMarkdown(orderedListMatch[1])}</li>`);
      continue;
    }

    const blockquoteMatch = /^>\s+(.+)$/.exec(line);
    if (blockquoteMatch) {
      flushParagraph();
      closeLists();
      html.push(`<blockquote>${renderInlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeLists();

  return html.join('\n');
};

const toSafeRenderableHtml = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  return looksLikeHtml ? sanitizeTrustedHtml(trimmed) : markdownToHtml(trimmed);
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

const sortIndexByDateDesc = (left: SeoArticleIndexItem, right: SeoArticleIndexItem): number => {
  const leftDate = new Date(left.publish_date || left.update_date || '').getTime();
  const rightDate = new Date(right.publish_date || right.update_date || '').getTime();
  const leftSafe = Number.isNaN(leftDate) ? 0 : leftDate;
  const rightSafe = Number.isNaN(rightDate) ? 0 : rightDate;
  return rightSafe - leftSafe;
};

const dedupeIndexBySlug = (articles: SeoArticleIndexItem[]): SeoArticleIndexItem[] => {
  const seen = new Set<string>();
  const unique: SeoArticleIndexItem[] = [];

  for (const article of articles) {
    if (seen.has(article.slug)) {
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
  const excerpt = getField(row, 'excerpt').trim();
  const introLede = getField(row, 'intro_lede').trim();
  const featuredImageUrl = normalizeFeaturedImageUrl(getField(row, 'featured_image_url'));
  const featuredImageAlt = getField(row, 'featured_image_alt').trim();
  const categorySlug = getField(row, 'category_slug').trim();
  const relatedSlugs = getField(row, 'related_slugs').trim();
  const internalLinksJson = getField(row, 'internal_links_json').trim();
  const breadcrumbJson = getField(row, 'breadcrumb_json').trim();
  const faqJson = getField(row, 'faq_json').trim();
  const schemaPrimaryType = normalizeSchemaPrimaryType(getField(row, 'schema_primary_type'));
  const primaryCity = getField(row, 'primary_city').trim();
  const primaryState = getField(row, 'primary_state').trim();

  const contentBody = toSafeRenderableHtml(getField(row, 'content_body'));

  const article: SeoArticle = {
    status,
    slug,
    canonical_url: buildCanonicalUrl(getField(row, 'canonical_url'), slug),
    publish_date: normalizeDate(getField(row, 'publish_date')),
    title_tag: getField(row, 'title_tag').trim(),
    meta_description: getField(row, 'meta_description').trim(),
    h1: getField(row, 'h1').trim() || getField(row, 'title_tag').trim(),
    content_body: contentBody,
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
  const resolvedExcerpt = resolveExcerpt(excerpt, introLede, contentBody);
  if (resolvedExcerpt) {
    article.excerpt = resolvedExcerpt;
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
  if (relatedSlugs) {
    article.related_slugs = relatedSlugs;
  }
  if (internalLinksJson) {
    article.internal_links_json = internalLinksJson;
  }
  if (breadcrumbJson) {
    article.breadcrumb_json = breadcrumbJson;
  }
  if (faqJson) {
    article.faq_json = faqJson;
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

export const mapSheetValuesToSeoArticleIndexItems = (values: string[][]): SeoArticleIndexItem[] => {
  if (values.length === 0) {
    return [];
  }

  const [rawHeaders, ...rows] = values;
  const headers = rawHeaders.map((header) => normalizeHeaderKey(String(header)));
  validateHeaders(headers);

  const mapped = rows
    .map((row) => {
      const rowMap = asRowMap(headers, row);
      const status = getField(rowMap, 'status').trim();
      const slug = getField(rowMap, 'slug').trim();
      const titleTag = getField(rowMap, 'title_tag').trim();
      const metaDescription = getField(rowMap, 'meta_description').trim();

      if (!slug || !titleTag || !metaDescription || !isPublishedStatus(status)) {
        return null;
      }

      const publishDate = normalizeDate(getField(rowMap, 'publish_date'));
      const updateDate = normalizeDate(getField(rowMap, 'update_date'));
      const introLede = getField(rowMap, 'intro_lede').trim();
      const excerpt = getField(rowMap, 'excerpt').trim();
      const featuredImageUrl = normalizeFeaturedImageUrl(getField(rowMap, 'featured_image_url'));
      const featuredImageAlt = getField(rowMap, 'featured_image_alt').trim();
      const categorySlug = getField(rowMap, 'category_slug').trim();
      const primaryCity = getField(rowMap, 'primary_city').trim();
      const contentBody = toSafeRenderableHtml(getField(rowMap, 'content_body'));

      const item: SeoArticleIndexItem = {
        status,
        slug,
        canonical_url: buildCanonicalUrl(getField(rowMap, 'canonical_url'), slug),
        publish_date: publishDate,
        title_tag: titleTag,
        meta_description: metaDescription,
        h1: getField(rowMap, 'h1').trim() || titleTag,
      };

      if (updateDate) {
        item.update_date = updateDate;
      }
      if (introLede) {
        item.intro_lede = introLede;
      }
      const resolvedExcerpt = resolveExcerpt(excerpt, introLede, contentBody);
      if (resolvedExcerpt) {
        item.excerpt = resolvedExcerpt;
      }
      if (featuredImageUrl) {
        item.featured_image_url = featuredImageUrl;
      }
      if (featuredImageAlt) {
        item.featured_image_alt = featuredImageAlt;
      }
      if (categorySlug) {
        item.category_slug = categorySlug;
      }
      if (primaryCity) {
        item.primary_city = primaryCity;
      }

      return item;
    })
    .filter((item): item is SeoArticleIndexItem => Boolean(item))
    .sort(sortIndexByDateDesc);

  return dedupeIndexBySlug(mapped);
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
    excerpt: article.excerpt,
    intro_lede: article.intro_lede,
    featured_image_url: article.featured_image_url,
    featured_image_alt: article.featured_image_alt,
    category_slug: article.category_slug,
    primary_city: article.primary_city,
  };
};
