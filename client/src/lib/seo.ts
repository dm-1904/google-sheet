type JsonLdObject = Record<string, unknown>;

const DEFAULT_SITE_NAME = 'Desert Valley Home Search';
const DEFAULT_BUSINESS_NAME = 'Deal Landers Arizona Realty';
const DEFAULT_ADDRESS = {
  streetAddress: '17310 W Wildwood St.',
  addressLocality: 'Surprise',
  addressRegion: 'AZ',
  postalCode: '85388',
  addressCountry: 'US',
};

const siteName = (import.meta.env.VITE_SITE_NAME ?? DEFAULT_SITE_NAME).trim() || DEFAULT_SITE_NAME;
const siteBaseUrl = (import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/$/, '');

export type BreadcrumbLink = {
  name: string;
  url: string;
};

export const getSiteName = (): string => siteName;

export const getSiteBaseUrl = (): string => siteBaseUrl;

export const toAbsoluteUrl = (value: string): string => {
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

export const buildBreadcrumbListSchema = (items: BreadcrumbLink[]): JsonLdObject => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
};

export const buildRealEstateAgentSchema = (): JsonLdObject | null => {
  const url = toAbsoluteUrl('/');
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${url}#real-estate-agent`,
    name: DEFAULT_BUSINESS_NAME,
    url,
    telephone: '+1-623-295-8169',
    address: {
      '@type': 'PostalAddress',
      ...DEFAULT_ADDRESS,
    },
    areaServed: [
      { '@type': 'City', name: 'Surprise' },
      { '@type': 'AdministrativeArea', name: 'West Valley of Phoenix' },
      { '@type': 'City', name: 'Peoria' },
      { '@type': 'City', name: 'Goodyear' },
      { '@type': 'City', name: 'Buckeye' },
    ],
  };
};

export const buildWebSiteSchema = (): JsonLdObject | null => {
  const url = toAbsoluteUrl('/');
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}#website`,
    name: siteName,
    url,
  };
};
