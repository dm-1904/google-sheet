import type { SeoArticle } from '../types/post';
import { toAbsoluteUrl } from './seo';

type SchemaObject = Record<string, unknown>;

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type InternalLinkItem = {
  anchor: string;
  url: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const ARTICLE_AUTHOR_NAME = 'Damon Ryon';
const ARTICLE_PUBLISHER_NAME = 'Deal Landers Arizona Realty';

const cleanObject = (input: SchemaObject): SchemaObject => {
  const output: SchemaObject = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (Array.isArray(value) && value.length === 0) {
      return;
    }
    output[key] = value;
  });
  return output;
};

const tryParseJson = (value?: string): unknown => {
  if (!value?.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const parseBreadcrumbItems = (raw?: string): BreadcrumbItem[] => {
  const parsed = tryParseJson(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const items: BreadcrumbItem[] = [];
  parsed.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const row = item as Record<string, unknown>;
    const name = String(row.name ?? row.title ?? row.label ?? '').trim();
    const url = String(row.url ?? row.path ?? '').trim();
    if (!name || !url) {
      return;
    }
    items.push({ name, url });
  });

  return items;
};

export const parseInternalLinks = (raw?: string): InternalLinkItem[] => {
  const parsed = tryParseJson(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const toAnchorFromUrl = (url: string): string => {
    const cleaned = url.trim().replace(/^https?:\/\/[^/]+/i, '');
    const lastSegment = cleaned.split('/').filter(Boolean).pop() ?? cleaned;
    const text = lastSegment.replace(/[-_]+/g, ' ').trim();
    if (!text) {
      return 'Related Link';
    }
    return text
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const links: InternalLinkItem[] = [];
  parsed.forEach((item) => {
    if (typeof item === 'string') {
      const url = item.trim();
      if (!url) {
        return;
      }
      links.push({ anchor: toAnchorFromUrl(url), url });
      return;
    }

    if (!item || typeof item !== 'object') {
      return;
    }
    const row = item as Record<string, unknown>;
    const url = String(row.url ?? row.href ?? '').trim();
    if (!url) {
      return;
    }
    const anchor = String(row.anchor ?? row.text ?? row.label ?? '').trim() || toAnchorFromUrl(url);
    links.push({ anchor, url });
  });

  return links;
};

const extractFaqItems = (article: SeoArticle): FaqItem[] => {
  if (!article.schema_enable_faq) {
    return [];
  }

  const fromJson = tryParseJson(article.content_body);
  if (Array.isArray(fromJson)) {
    const faqItems: FaqItem[] = [];
    fromJson.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }
      const row = entry as Record<string, unknown>;
      const question = String(row.question ?? row.q ?? '').trim();
      const answer = String(row.answer ?? row.a ?? '').trim();
      if (question && answer) {
        faqItems.push({ question, answer });
      }
    });
    if (faqItems.length > 0) {
      return faqItems;
    }
  }

  const plainText = article.content_body.replace(/<[^>]+>/g, '\n');
  const lines = plainText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const faq: FaqItem[] = [];
  for (let index = 0; index < lines.length - 1; index += 1) {
    const questionMatch = /^Q[:\-]\s*(.+)$/i.exec(lines[index]);
    const answerMatch = /^A[:\-]\s*(.+)$/i.exec(lines[index + 1]);
    if (!questionMatch || !answerMatch) {
      continue;
    }
    faq.push({ question: questionMatch[1], answer: answerMatch[1] });
    index += 1;
  }

  return faq;
};

const getDisplayTitle = (article: SeoArticle): string => {
  return article.h1 || article.title_tag || article.slug;
};

export const getCanonicalUrl = (article: SeoArticle): string => {
  const fallback = `/blog/${article.slug}`;
  return toAbsoluteUrl(article.canonical_url || fallback);
};

export const getRobotsMetaContent = (article: SeoArticle): string => {
  return article.meta_robots?.trim() || 'index,follow';
};

const buildArticleSchema = (article: SeoArticle, canonicalUrl: string): SchemaObject => {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': article.schema_primary_type || 'BlogPosting',
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    headline: getDisplayTitle(article),
    description: article.meta_description || article.intro_lede || getDisplayTitle(article),
    datePublished: article.publish_date || undefined,
    dateModified: article.update_date || article.publish_date || undefined,
    inLanguage: 'en-US',
    image: article.featured_image_url ? toAbsoluteUrl(article.featured_image_url) : undefined,
    articleSection: article.category_slug || undefined,
    author: cleanObject({
      '@type': 'Person',
      name: ARTICLE_AUTHOR_NAME,
    }),
    publisher: cleanObject({
      '@type': 'Organization',
      name: ARTICLE_PUBLISHER_NAME,
    }),
  });
};

const buildBreadcrumbSchema = (article: SeoArticle, canonicalUrl: string): SchemaObject => {
  const breadcrumbItems = parseBreadcrumbItems(article.breadcrumb_json);
  const fallbackItems: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: getDisplayTitle(article), url: canonicalUrl },
  ];

  const sourceItems = breadcrumbItems.length > 0 ? breadcrumbItems : fallbackItems;
  const itemListElement = sourceItems.map((item, index) =>
    cleanObject({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    }),
  );

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  });
};

const buildFaqSchema = (faqItems: FaqItem[]): SchemaObject => {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) =>
      cleanObject({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }),
    ),
  });
};

export const buildStructuredData = (article: SeoArticle): SchemaObject[] => {
  const canonicalUrl = getCanonicalUrl(article);
  const schemas: SchemaObject[] = [];

  if (article.schema_enable_article ?? true) {
    schemas.push(buildArticleSchema(article, canonicalUrl));
  }

  if (article.schema_enable_breadcrumb ?? true) {
    schemas.push(buildBreadcrumbSchema(article, canonicalUrl));
  }

  const faqItems = extractFaqItems(article);
  if ((article.schema_enable_faq ?? false) && faqItems.length > 0) {
    schemas.push(buildFaqSchema(faqItems));
  }

  return schemas;
};
