import { Helmet } from 'react-helmet-async';
import { getSiteName, toAbsoluteUrl } from '../lib/seo';

type JsonLdObject = Record<string, unknown>;

type SeoHeadProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  robots?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  structuredData?: JsonLdObject[];
};

const DEFAULT_OG_IMAGE = '/arizona-home-1.jpg';

export const SeoHead = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  robots = 'index,follow',
  noindex = false,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  publishedTime,
  modifiedTime,
  articleSection,
  structuredData = [],
}: SeoHeadProps) => {
  const canonicalHref = canonicalUrl
    ? toAbsoluteUrl(canonicalUrl)
    : canonicalPath
      ? toAbsoluteUrl(canonicalPath)
      : '';
  const robotsDirective = noindex ? 'noindex,follow' : robots;
  const ogUrl = canonicalHref || toAbsoluteUrl('/');
  const ogImageUrl = toAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE);
  const siteName = getSiteName();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsDirective} />
      {canonicalHref ? <link rel="canonical" href={canonicalHref} /> : null}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImageUrl} />
      {ogImageAlt ? <meta property="og:image:alt" content={ogImageAlt} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {ogType === 'article' && publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      {ogType === 'article' && modifiedTime ? (
        <meta property="article:modified_time" content={modifiedTime} />
      ) : null}
      {ogType === 'article' && articleSection ? (
        <meta property="article:section" content={articleSection} />
      ) : null}

      {structuredData.map((schema, index) => (
        <script key={`seo-schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
