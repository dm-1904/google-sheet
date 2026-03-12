import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { fetchPostBySlug } from '../api/posts';
import {
  buildStructuredData,
  getCanonicalUrl,
  getRobotsMetaContent,
  parseBreadcrumbItems,
  parseInternalLinks,
} from '../lib/structuredData';
import type { SeoArticle } from '../types/post';
import '../css/BlogPost.css';

const formatDate = (value?: string): string => {
  if (!value) {
    return 'Unknown date';
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const getDisplayTitle = (article: SeoArticle): string => {
  return article.h1 || article.title_tag || article.slug;
};

const isExternalUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const BlogPost = () => {
  const { slug } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (!slug) {
    return <p>Invalid slug.</p>;
  }

  if (isLoading) {
    return <p>Loading post...</p>;
  }

  if (isError) {
    return (
      <main>
        <p>Failed to load post: {(error as Error).message}</p>
        <Link to="/blog">Back to all posts</Link>
      </main>
    );
  }

  if (!data) {
    return <p>Post not found.</p>;
  }

  const title = getDisplayTitle(data);
  const canonicalUrl = getCanonicalUrl(data);
  const robotsContent = getRobotsMetaContent(data);
  const publishedAt = formatDate(data.publish_date);
  const updatedAt = formatDate(data.update_date);
  const internalLinks = parseInternalLinks(data.internal_links_json);
  const breadcrumbItems = parseBreadcrumbItems(data.breadcrumb_json);
  const breadcrumbs =
    breadcrumbItems.length > 0
      ? breadcrumbItems
      : [
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: title, url: `/blog/${data.slug}` },
        ];

  return (
    <main className="blog-post">
      <Helmet>
        <title>{data.title_tag || title}</title>
        <meta name="description" content={data.meta_description || title} />
        <meta name="robots" content={robotsContent} />
        <link rel="canonical" href={canonicalUrl} />
        {buildStructuredData(data).map((schema, index) => (
          <script key={`schema-${index}`} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <nav aria-label="Breadcrumb">
        <ol className="blog-post__breadcrumbs">
          {breadcrumbs.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              {index < breadcrumbs.length - 1 ? (
                isExternalUrl(item.url) ? (
                  <a href={item.url}>{item.name}</a>
                ) : (
                  <Link to={item.url}>{item.name}</Link>
                )
              ) : (
                item.name
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="blog-post__header">
        <h1>{title}</h1>
        <p className="blog-post__meta">
          Published: {publishedAt}
          {data.update_date ? ` · Updated: ${updatedAt}` : ''}
          {data.primary_city || data.primary_state
            ? ` · ${[data.primary_city, data.primary_state].filter(Boolean).join(', ')}`
            : ''}
        </p>
      </header>

      {data.featured_image_url ? (
        <img
          src={data.featured_image_url}
          alt={data.featured_image_alt || title}
          className="blog-post__hero-image"
        />
      ) : null}

      {data.intro_lede ? <p className="blog-post__lede">{data.intro_lede}</p> : null}

      <section className="blog-post__content">
        <div dangerouslySetInnerHTML={{ __html: data.content_body }} />
      </section>

      {internalLinks.length > 0 ? (
        <section className="blog-post__internal-links">
          <h2>Related Internal Links</h2>
          <ul>
            {internalLinks.map((item, index) => (
              <li key={`${item.url}-${index}`}>
                <a href={item.url}>{item.anchor}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p>
        <Link to="/blog">← Back to all posts</Link>
      </p>
    </main>
  );
};
