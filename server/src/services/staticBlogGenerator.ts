import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSheetValues } from '../lib/googleSheets.js';
import type { SeoArticle, SeoArticleIndexItem } from '../types/post.js';
import { mapSheetValuesToSeoArticleIndexItems, mapSheetValuesToSeoArticles } from './contentMapper.js';

const THIS_FILE = fileURLToPath(import.meta.url);
const SERVER_SRC_DIR = path.resolve(path.dirname(THIS_FILE), '..');
const SERVER_DIR = path.resolve(SERVER_SRC_DIR, '..');
const REPO_ROOT = path.resolve(SERVER_DIR, '..');
const CLIENT_DIR = path.join(REPO_ROOT, 'client');

const DEFAULT_SITE_NAME = 'Desert Valley Home Search';
const DEFAULT_PAGE_DESCRIPTION =
  'Local real estate guides, market updates, and relocation insights for Surprise Arizona and the West Valley.';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Neighborhood Guides', href: '/neighborhood-guides' },
  { label: "Let's Connect", href: '/lets-connect' },
];

const FOOTER_MENU_ITEMS = NAV_ITEMS;

const BLOG_CSS_SOURCE_FILES = [
  path.join(CLIENT_DIR, 'src/css/SiteLayout.css'),
  path.join(CLIENT_DIR, 'src/css/footer.css'),
  path.join(CLIENT_DIR, 'src/css/BlogIndex.css'),
  path.join(CLIENT_DIR, 'src/css/PostCard.css'),
  path.join(CLIENT_DIR, 'src/css/BlogPost.css'),
];

type JsonObject = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  url: string;
};

type InternalLinkItem = {
  anchor: string;
  url: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type GenerateStaticBlogOptions = {
  outputDir?: string;
  cssOutputPath?: string;
  siteName?: string;
  siteBaseUrl?: string;
};

type StaticGenerationResult = {
  outputDir: string;
  cssOutputPath: string;
  postCount: number;
  categoryCount: number;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const normalizeBaseUrl = (value: string): string => value.trim().replace(/\/$/, '');

const isAbsoluteHttpUrl = (value: string): boolean => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

const shouldRequireAbsoluteSeoUrls = (): boolean => {
  return parseBoolean(process.env.STATIC_BLOG_REQUIRE_ABSOLUTE_URLS, true);
};

const getSiteBaseUrl = (override?: string): string => {
  const candidates = [
    override,
    process.env.SITE_BASE_URL,
    process.env.VITE_SITE_URL,
    process.env.CLIENT_ORIGIN,
  ]
    .map((value) => normalizeBaseUrl(value ?? ''))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (isAbsoluteHttpUrl(candidate)) {
      return candidate;
    }
  }

  if (shouldRequireAbsoluteSeoUrls()) {
    throw new Error(
      [
        'Static blog generation requires an absolute site URL for canonical and OG tags.',
        'Set SITE_BASE_URL (recommended) or VITE_SITE_URL to a full URL like https://www.example.com.',
        'If you intentionally want relative URLs for local testing, set STATIC_BLOG_REQUIRE_ABSOLUTE_URLS=0.',
      ].join(' '),
    );
  }

  return '';
};

const toAbsoluteUrl = (value: string, siteBaseUrl: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return siteBaseUrl ? `${siteBaseUrl}${normalizedPath}` : normalizedPath;
};

const getCanonicalUrl = (article: SeoArticle, siteBaseUrl: string): string => {
  const fallback = `/blog/${article.slug}`;
  return toAbsoluteUrl(article.canonical_url || fallback, siteBaseUrl);
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const escapeAttribute = (value: string): string => escapeHtml(value);

const normalizeCategory = (value?: string): string => value?.trim().toLowerCase() ?? '';

const formatCategoryLabel = (value?: string): string => {
  const trimmed = value
    ?.trim()
    .replace(/^category(?:[\s_-]+|$)/i, '')
    .trim();
  if (!trimmed) {
    return 'Uncategorized';
  }

  return trimmed
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatCityLabel = (value?: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

const getCardSnippet = (post: SeoArticleIndexItem, postBody?: string): string => {
  const explicit = post.excerpt?.trim();
  if (explicit) {
    return explicit;
  }

  const fromLede = post.intro_lede?.trim();
  if (fromLede) {
    return fromLede;
  }

  if (postBody) {
    const fromBody = stripHtml(postBody);
    if (fromBody) {
      return truncateText(fromBody, 190);
    }
  }

  return post.meta_description;
};

const formatCmsDate = (value?: string): string => {
  if (!value?.trim()) {
    return 'Unknown date';
  }

  const trimmed = value.trim();
  const isoDateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoDateOnlyMatch) {
    const formatted = new Date(
      Date.UTC(Number(isoDateOnlyMatch[1]), Number(isoDateOnlyMatch[2]) - 1, Number(isoDateOnlyMatch[3])),
    );
    return formatted.toLocaleDateString(undefined, { timeZone: 'UTC' });
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toLocaleDateString();
};

const parseJson = (value?: string): unknown => {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const parseBreadcrumbItems = (raw?: string): BreadcrumbItem[] => {
  const parsed = parseJson(raw);
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

const parseInternalLinks = (raw?: string): InternalLinkItem[] => {
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const links: InternalLinkItem[] = [];
  parsed.forEach((item) => {
    if (typeof item === 'string') {
      const url = item.trim();
      if (!url) {
        return;
      }
      links.push({ anchor: url.replace(/^https?:\/\/[^/]+/i, '').replace(/[-_/]+/g, ' ').trim() || 'Related link', url });
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
    const anchor = String(row.anchor ?? row.text ?? row.label ?? '').trim() || 'Related link';
    links.push({ anchor, url });
  });

  return links;
};

const parseFaqItemsFromJson = (raw?: string): FaqItem[] => {
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const faq: FaqItem[] = [];
  parsed.forEach((entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }
    const row = entry as Record<string, unknown>;
    const question = String(row.question ?? row.q ?? '').trim();
    const answer = String(row.answer ?? row.a ?? '').trim();
    if (question && answer) {
      faq.push({ question, answer });
    }
  });

  return faq;
};

const parseFaqFromContentBody = (contentBody: string): FaqItem[] => {
  const plainText = contentBody.replace(/<[^>]+>/g, '\n');
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

const getVisibleFaqItems = (article: SeoArticle): FaqItem[] => {
  const fromFaqJson = parseFaqItemsFromJson(article.faq_json);
  if (fromFaqJson.length > 0) {
    return fromFaqJson;
  }

  const fromBodyJson = parseFaqItemsFromJson(article.content_body);
  if (fromBodyJson.length > 0) {
    return fromBodyJson;
  }

  return parseFaqFromContentBody(article.content_body);
};

const parseRelatedSlugs = (raw?: string): string[] => {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = parseJson(trimmed);
  if (Array.isArray(parsed)) {
    return parsed
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);
  }

  return trimmed
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
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

const buildArticleSchemas = (
  article: SeoArticle,
  canonicalUrl: string,
  faqItems: FaqItem[],
  breadcrumbs: BreadcrumbItem[],
  siteBaseUrl: string,
): JsonObject[] => {
  const schemas: JsonObject[] = [];
  const title = article.h1 || article.title_tag || article.slug;

  if (article.schema_enable_article ?? true) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': article.schema_primary_type || 'BlogPosting',
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      headline: title,
      description: article.meta_description || article.excerpt || article.intro_lede || title,
      datePublished: article.publish_date || undefined,
      dateModified: article.update_date || article.publish_date || undefined,
      inLanguage: 'en-US',
      image: article.featured_image_url ? toAbsoluteUrl(article.featured_image_url, siteBaseUrl) : undefined,
      articleSection: article.category_slug || undefined,
      author: {
        '@type': 'Person',
        name: 'Damon Ryon',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Deal Landers Arizona Realty',
      },
    });
  }

  if (article.schema_enable_breadcrumb ?? true) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: toAbsoluteUrl(item.url, siteBaseUrl),
      })),
    });
  }

  if ((article.schema_enable_faq ?? false) && faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return schemas;
};

const renderHead = ({
  title,
  description,
  canonicalUrl,
  robots,
  siteName,
  ogType,
  ogImageUrl,
  ogImageAlt,
  publishedTime,
  modifiedTime,
  articleSection,
  structuredData,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  siteName: string;
  ogType: 'website' | 'article';
  ogImageUrl: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  structuredData?: JsonObject[];
}): string => {
  const jsonLdScripts = (structuredData ?? [])
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favicon.png?v=2" />
    <link rel="shortcut icon" type="image/png" href="/favicon.png?v=2" />
    <link rel="apple-touch-icon" href="/favicon.png?v=2" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttribute(description)}" />
    <meta name="robots" content="${escapeAttribute(robots)}" />
    <link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${escapeAttribute(siteName)}" />
    <meta property="og:title" content="${escapeAttribute(title)}" />
    <meta property="og:description" content="${escapeAttribute(description)}" />
    <meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />
    <meta property="og:image" content="${escapeAttribute(ogImageUrl)}" />
    ${ogImageAlt ? `<meta property="og:image:alt" content="${escapeAttribute(ogImageAlt)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttribute(title)}" />
    <meta name="twitter:description" content="${escapeAttribute(description)}" />
    <meta name="twitter:image" content="${escapeAttribute(ogImageUrl)}" />
    ${publishedTime ? `<meta property="article:published_time" content="${escapeAttribute(publishedTime)}" />` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeAttribute(modifiedTime)}" />` : ''}
    ${articleSection ? `<meta property="article:section" content="${escapeAttribute(articleSection)}" />` : ''}
    <link rel="stylesheet" href="/blog-static.css" />
    ${jsonLdScripts}
  `.trim();
};

const renderNav = (): string => {
  return `
    <header class="nav-header">
      <div class="nav-box">
        <div class="nav-img-box">
          <a href="/" class="nav-logo-link" aria-label="Go to home page">
            <img src="/nav/DesertValleyHomeSearch-com.png" alt="Desert Valley Home Search Logo" class="nav-logo-img" width="1280" height="312" />
          </a>
          <div class="nav-name-img-box">
            <img src="/nav/Presented-by.png" alt="Presented by" class="presented-by" width="640" height="205" />
            <img src="/nav/Damon-Ryon-2.png" alt="Damon Ryon" class="name-img-logo" width="800" height="365" />
          </div>
          <img src="/nav/Damon-P.jpg" alt="Damon portrait" class="damon-picture" width="420" height="588" />
        </div>
        <button type="button" class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-navigation">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>
        <nav id="site-navigation" class="nav-link-box" aria-label="Main navigation">
          ${NAV_ITEMS.map((item) => `<a href="${item.href}" class="nav-link">${item.label}</a>`).join('')}
        </nav>
      </div>
    </header>
  `.trim();
};

const renderFooter = (): string => {
  const year = new Date().getFullYear();
  const lastUpdated = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  return `
    <span class="footer-underline"></span>
    <footer class="footer">
      <div class="footer-content">
        <h3 class="footer-menu">Menu</h3>
        <div class="footer-menu">
          ${FOOTER_MENU_ITEMS.map((item) => `<a href="${item.href}" class="footer-menu-item nav-link">${item.label}</a>`).join('')}
        </div>
        <div class="footer-logo">
          <img src="/broker-logo-transparent.png" alt="Deal Landers Arizona Realty broker logo" class="footer-broker-logo" loading="lazy" decoding="async" />
        </div>
        <div class="broker-address">
          <span>Deal Landers Arizona Realty<br />17310 W Wildwood St.<br />Surprise, AZ 85388<br />623-295-8169</span>
        </div>
        <div class="ryon-group-logo">
          <img src="/nav/ryon-group.png" alt="Ryon Group logo" loading="lazy" decoding="async" />
        </div>
        <div class="footer-realtor-logos">
          <img src="/equal-housing-opportunity.png" alt="Equal housing opportunity logo" class="footer-equal-housing-logo" loading="lazy" decoding="async" />
          <img src="/MLS-clear.png" alt="MLS logo" class="footer-mls-logo" loading="lazy" decoding="async" />
        </div>
        <div class="footer-disc">
          <a href="/terms-of-use">TERMS OF USE</a>
          <a href="/privacy-policy">PRIVACY POLICY</a>
          <a href="/dmca">DMCA</a>
        </div>
      </div>
    </footer>
    <div class="footer-disc-statement">
      <p>© ${year} Arizona Regional Multiple Listing Service • All Rights Reserved • Last updated: ${escapeHtml(lastUpdated)}.</p>
    </div>
  `.trim();
};

const renderLayout = ({
  headMarkup,
  mainMarkup,
  extraScript = '',
}: {
  headMarkup: string;
  mainMarkup: string;
  extraScript?: string;
}): string => {
  return `<!doctype html>
<html lang="en">
  <head>
    ${headMarkup}
  </head>
  <body>
    <div class="site-layout">
      ${renderNav()}
      <main class="site-layout__content">
        ${mainMarkup}
      </main>
      ${renderFooter()}
    </div>
    <script>
      (() => {
        const toggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav-link-box');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', () => {
          const isOpen = nav.classList.toggle('open');
          toggle.classList.toggle('open', isOpen);
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      })();
      ${extraScript}
    </script>
  </body>
</html>`;
};

const toPostPath = (slug: string): string => `/blog/${slug}`;

const buildIndexPageHtml = ({
  posts,
  postBodiesBySlug,
  siteBaseUrl,
  siteName,
}: {
  posts: SeoArticleIndexItem[];
  postBodiesBySlug: Map<string, string>;
  siteBaseUrl: string;
  siteName: string;
}): string => {
  const cities = Array.from(
    new Set(posts.map((post) => post.primary_city?.trim()).filter((value): value is string => Boolean(value))),
  ).sort((left, right) =>
    left.localeCompare(right, undefined, {
      sensitivity: 'base',
    }),
  );

  const categories = Array.from(
    new Set(posts.map((post) => post.category_slug?.trim()).filter((value): value is string => Boolean(value))),
  ).sort((left, right) =>
    left.localeCompare(right, undefined, {
      sensitivity: 'base',
    }),
  );

  const cardsMarkup = posts
    .map((post) => {
      const date = formatCmsDate(post.publish_date || post.update_date);
      const title = post.h1 || post.title_tag || post.slug;
      const summary = getCardSnippet(post, postBodiesBySlug.get(post.slug));
      const categoryLabel = formatCategoryLabel(post.category_slug);
      const categoryValue = normalizeCategory(post.category_slug);
      const cityValue = normalizeCategory(post.primary_city);
      return `
        <article class="post-card" data-post-category="${escapeAttribute(categoryValue || 'uncategorized')}" data-post-city="${escapeAttribute(cityValue || 'unknown')}">
          <p class="post-card__meta">
            <span class="post-card__category">${escapeHtml(categoryLabel)}</span> · ${escapeHtml(date)}
          </p>
          <h2 class="post-card__title">
            <a href="${toPostPath(post.slug)}">${escapeHtml(title)}</a>
          </h2>
          <p class="post-card__summary">${escapeHtml(summary)}</p>
        </article>
      `.trim();
    })
    .join('\n');

  const filterMarkup = `
    <section class="blog-index__filters" aria-label="Filter posts by city and category">
      <div class="blog-index__filter-group">
        <p class="blog-index__filter-label">Filter by City:</p>
        <div class="blog-index__filter-list">
          <a href="#all" class="blog-index__filter-chip" data-filter-group="city" data-filter-value="all">All</a>
          ${cities
            .map((city) => {
              const normalized = normalizeCategory(city);
              return `<a href="#city=${encodeURIComponent(normalized)}" class="blog-index__filter-chip" data-filter-group="city" data-filter-value="${escapeAttribute(normalized)}">${escapeHtml(formatCityLabel(city))}</a>`;
            })
            .join('')}
        </div>
      </div>
      <div class="blog-index__filter-group">
        <p class="blog-index__filter-label">Filter by Category:</p>
        <div class="blog-index__filter-list">
          <a href="#all" class="blog-index__filter-chip" data-filter-group="category" data-filter-value="all">All</a>
          ${categories
            .map((category) => {
              const normalized = normalizeCategory(category);
              return `<a href="#category=${encodeURIComponent(normalized)}" class="blog-index__filter-chip" data-filter-group="category" data-filter-value="${escapeAttribute(normalized)}">${escapeHtml(formatCategoryLabel(category))}</a>`;
            })
            .join('')}
        </div>
      </div>
    </section>
  `.trim();

  const mainMarkup = `
    <main class="blog-index">
      <h1>Surprise &amp; West Valley Real Estate Blog</h1>
      <p>Local market insights, neighborhood guides, and relocation advice for buyers and sellers in the West Valley.</p>
      ${filterMarkup}
      <p id="blog-index-empty-state" style="display:none;">No posts found for this filter combination.</p>
      ${cardsMarkup}
    </main>
  `.trim();

  const canonicalUrl = toAbsoluteUrl('/blog', siteBaseUrl);
  const headMarkup = renderHead({
    title: 'Surprise & West Valley Real Estate Blog | Desert Valley Home Search',
    description: 'Read local real estate guides, market insights, and moving tips for Surprise Arizona and the West Valley of Phoenix.',
    canonicalUrl,
    robots: 'index,follow',
    siteName,
    ogType: 'website',
    ogImageUrl: toAbsoluteUrl('/arizona-home-1.jpg', siteBaseUrl),
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Surprise & West Valley Real Estate Blog',
        url: canonicalUrl,
      },
    ],
  });

  const filterScript = `
    (() => {
      const chips = Array.from(document.querySelectorAll('[data-filter-group][data-filter-value]'));
      const cards = Array.from(document.querySelectorAll('[data-post-category][data-post-city]'));
      const emptyState = document.getElementById('blog-index-empty-state');

      const parseFromHash = () => {
        const hash = decodeURIComponent(window.location.hash.replace(/^#/, '').trim());
        if (!hash || hash === 'all') {
          return { city: 'all', category: 'all' };
        }

        const params = new URLSearchParams(hash);
        return {
          city: (params.get('city') || 'all').trim().toLowerCase() || 'all',
          category: (params.get('category') || 'all').trim().toLowerCase() || 'all',
        };
      };

      const toHash = (state) => {
        const params = new URLSearchParams();
        if (state.city !== 'all') {
          params.set('city', state.city);
        }
        if (state.category !== 'all') {
          params.set('category', state.category);
        }
        const query = params.toString();
        return query ? '#' + query : '#all';
      };

      const applyFilter = (state) => {
        let visibleCount = 0;
        cards.forEach((card) => {
          const cardCategory = card.getAttribute('data-post-category') || '';
          const cardCity = card.getAttribute('data-post-city') || '';
          const categoryMatches = state.category === 'all' || cardCategory === state.category;
          const cityMatches = state.city === 'all' || cardCity === state.city;
          const visible = categoryMatches && cityMatches;
          card.style.display = visible ? '' : 'none';
          if (visible) visibleCount += 1;
        });

        chips.forEach((chip) => {
          const group = chip.getAttribute('data-filter-group');
          const value = chip.getAttribute('data-filter-value') || 'all';
          const selectedValue = group === 'city' ? state.city : state.category;
          chip.classList.toggle('is-active', selectedValue === value);
        });

        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? '' : 'none';
        }
      };

      chips.forEach((chip) => {
        chip.addEventListener('click', (event) => {
          event.preventDefault();
          const group = chip.getAttribute('data-filter-group');
          const value = (chip.getAttribute('data-filter-value') || 'all').toLowerCase();
          const next = parseFromHash();
          if (group === 'city') {
            next.city = value;
          } else if (group === 'category') {
            next.category = value;
          }
          window.location.hash = toHash(next);
        });
      });

      applyFilter(parseFromHash());
      window.addEventListener('hashchange', () => applyFilter(parseFromHash()));
    })();
  `;

  return renderLayout({ headMarkup, mainMarkup, extraScript: filterScript });
};

const buildPostPageHtml = ({
  article,
  postIndex,
  siteBaseUrl,
  siteName,
}: {
  article: SeoArticle;
  postIndex: SeoArticleIndexItem[];
  siteBaseUrl: string;
  siteName: string;
}): string => {
  const title = article.h1 || article.title_tag || article.slug;
  const description = article.meta_description || article.excerpt || article.intro_lede || title;
  const canonicalUrl = getCanonicalUrl(article, siteBaseUrl);
  const robots = article.meta_robots?.trim() || 'index,follow';
  const breadcrumbs = parseBreadcrumbItems(article.breadcrumb_json);
  const fallbackBreadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: title, url: toPostPath(article.slug) },
  ];
  const breadcrumbItems = breadcrumbs.length > 0 ? breadcrumbs : fallbackBreadcrumbs;

  const faqItems = getVisibleFaqItems(article);
  const internalLinks = parseInternalLinks(article.internal_links_json);

  const indexBySlug = new Map(postIndex.map((post) => [post.slug, post] as const));
  const explicitRelated = parseRelatedSlugs(article.related_slugs)
    .filter((slug) => slug !== article.slug)
    .map((slug) => indexBySlug.get(slug))
    .filter((post): post is SeoArticleIndexItem => Boolean(post));
  const relatedPosts = (() => {
    if (explicitRelated.length > 0) {
      const seen = new Set<string>();
      return explicitRelated.filter((post) => {
        if (seen.has(post.slug)) {
          return false;
        }
        seen.add(post.slug);
        return true;
      });
    }

    const currentCategory = article.category_slug?.trim().toLowerCase();
    if (currentCategory) {
      const sameCategory = postIndex.filter(
        (post) => post.slug !== article.slug && post.category_slug?.trim().toLowerCase() === currentCategory,
      );
      if (sameCategory.length > 0) {
        return sameCategory.slice(0, 3);
      }
    }

    const currentCity = article.primary_city?.trim().toLowerCase();
    if (currentCity) {
      const sameCity = postIndex.filter(
        (post) => post.slug !== article.slug && post.primary_city?.trim().toLowerCase() === currentCity,
      );
      if (sameCity.length > 0) {
        return sameCity.slice(0, 3);
      }
    }

    return postIndex.filter((post) => post.slug !== article.slug).slice(0, 3);
  })();

  const structuredData = buildArticleSchemas(article, canonicalUrl, faqItems, breadcrumbItems, siteBaseUrl);
  const headMarkup = renderHead({
    title: article.title_tag || title,
    description,
    canonicalUrl,
    robots,
    siteName,
    ogType: 'article',
    ogImageUrl: toAbsoluteUrl(article.featured_image_url || '/arizona-home-1.jpg', siteBaseUrl),
    ogImageAlt: article.featured_image_alt || title,
    publishedTime: article.publish_date,
    modifiedTime: article.update_date || article.publish_date,
    articleSection: article.category_slug,
    structuredData,
  });

  const breadcrumbMarkup = `
    <nav aria-label="Breadcrumb">
      <ol class="blog-post__breadcrumbs">
        ${breadcrumbItems
          .map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const label = escapeHtml(item.name);
            if (isLast) {
              return `<li>${label}</li>`;
            }
            return `<li><a href="${escapeAttribute(item.url)}">${label}</a></li>`;
          })
          .join('')}
      </ol>
    </nav>
  `.trim();

  const faqMarkup =
    faqItems.length > 0
      ? `
    <section class="blog-post__faq" aria-label="Frequently Asked Questions">
      <h2>Frequently Asked Questions</h2>
      ${faqItems
        .map(
          (item) => `
        <article class="blog-post__faq-item">
          <h3>${escapeHtml(item.question)}</h3>
          <p>${escapeHtml(item.answer)}</p>
        </article>
      `,
        )
        .join('')}
    </section>
  `
      : '';

  const internalLinksMarkup =
    internalLinks.length > 0
      ? `
    <section class="blog-post__internal-links">
      <h2>Related Internal Links</h2>
      <ul>
        ${internalLinks
          .map((item) => `<li><a href="${escapeAttribute(item.url)}">${escapeHtml(item.anchor)}</a></li>`)
          .join('')}
      </ul>
    </section>
  `
      : '';

  const relatedPostsMarkup =
    relatedPosts.length > 0
      ? `
    <section class="blog-post__related">
      <h2>Related Posts</h2>
      <ul>
        ${relatedPosts
          .map((post) => {
            const postTitle = post.h1 || post.title_tag || post.slug;
            return `<li><a href="${toPostPath(post.slug)}">${escapeHtml(postTitle)}</a></li>`;
          })
          .join('')}
      </ul>
    </section>
  `
      : '';

  const mainMarkup = `
    <main class="blog-post">
      ${breadcrumbMarkup}
      <header class="blog-post__header">
        <h1>${escapeHtml(title)}</h1>
        <p class="blog-post__author">By Damon Ryon</p>
        <p class="blog-post__meta">
          Published: ${escapeHtml(formatCmsDate(article.publish_date))}
          ${article.update_date ? ` · Updated: ${escapeHtml(formatCmsDate(article.update_date))}` : ''}
          ${article.primary_city || article.primary_state ? ` · ${escapeHtml([article.primary_city, article.primary_state].filter(Boolean).join(', '))}` : ''}
        </p>
      </header>
      ${
        article.featured_image_url
          ? `<img src="${escapeAttribute(article.featured_image_url)}" alt="${escapeAttribute(article.featured_image_alt || title)}" class="blog-post__hero-image" loading="eager" decoding="async" />`
          : ''
      }
      ${article.intro_lede ? `<p class="blog-post__lede">${escapeHtml(article.intro_lede)}</p>` : ''}
      <section class="blog-post__content">${article.content_body}</section>
      ${faqMarkup}
      ${internalLinksMarkup}
      ${relatedPostsMarkup}
      <p><a href="/blog">← Back to all posts</a></p>
    </main>
  `.trim();

  return renderLayout({ headMarkup, mainMarkup });
};

const buildCssBundle = async (): Promise<string> => {
  const fileContents = await Promise.all(BLOG_CSS_SOURCE_FILES.map((filePath) => readFile(filePath, 'utf8')));
  const extraCss = `
/* Static blog pages */
.site-layout__content {
  padding: 1rem;
}

.blog-post__content img {
  max-width: 100%;
  height: auto;
}
  `.trim();

  return `${fileContents.join('\n\n')}\n\n${extraCss}\n`;
};

const ensureDir = async (targetDir: string): Promise<void> => {
  await mkdir(targetDir, { recursive: true });
};

const writeHtmlPage = async (targetPath: string, html: string): Promise<void> => {
  await ensureDir(path.dirname(targetPath));
  await writeFile(targetPath, html, 'utf8');
};

export const generateStaticBlogPages = async (
  options: GenerateStaticBlogOptions = {},
): Promise<StaticGenerationResult> => {
  if (String(process.env.SKIP_STATIC_BLOG_GENERATION ?? '').trim() === '1') {
    return {
      outputDir: options.outputDir ?? path.join(CLIENT_DIR, 'public/blog'),
      cssOutputPath: options.cssOutputPath ?? path.join(CLIENT_DIR, 'public/blog-static.css'),
      postCount: 0,
      categoryCount: 0,
    };
  }

  const outputDir = options.outputDir ?? path.join(CLIENT_DIR, 'public/blog');
  const cssOutputPath = options.cssOutputPath ?? path.join(CLIENT_DIR, 'public/blog-static.css');
  const siteBaseUrl = getSiteBaseUrl(options.siteBaseUrl);
  const siteName = options.siteName ?? process.env.VITE_SITE_NAME ?? DEFAULT_SITE_NAME;

  const sheetValues = await fetchSheetValues();
  const posts = mapSheetValuesToSeoArticles(sheetValues);
  const postIndex = mapSheetValuesToSeoArticleIndexItems(sheetValues);
  const postBodyBySlug = new Map(posts.map((post) => [post.slug, post.content_body] as const));

  await rm(outputDir, { recursive: true, force: true });
  await ensureDir(outputDir);

  const indexHtml = buildIndexPageHtml({
    posts: postIndex,
    postBodiesBySlug: postBodyBySlug,
    siteBaseUrl,
    siteName,
  });
  await writeHtmlPage(path.join(outputDir, 'index.html'), indexHtml);

  for (const post of posts) {
    const postHtml = buildPostPageHtml({
      article: post,
      postIndex,
      siteBaseUrl,
      siteName,
    });
    await writeHtmlPage(path.join(outputDir, post.slug, 'index.html'), postHtml);
  }

  const cssBundle = await buildCssBundle();
  await writeFile(cssOutputPath, cssBundle, 'utf8');

  const categories = new Set(
    postIndex.map((post) => post.category_slug?.trim()).filter((value): value is string => Boolean(value)),
  );

  return {
    outputDir,
    cssOutputPath,
    postCount: posts.length,
    categoryCount: categories.size,
  };
};
