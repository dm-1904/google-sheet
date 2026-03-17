import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchPostBySlug, fetchPosts } from '../api/posts';
import { SeoHead } from '../components/SeoHead';
import { formatCmsDate } from '../lib/date';
import {
  buildStructuredData,
  getCanonicalUrl,
  getVisibleFaqItems,
  getRobotsMetaContent,
  parseBreadcrumbItems,
  parseInternalLinks,
} from '../lib/structuredData';
import type { SeoArticle, SeoArticleIndexItem } from '../types/post';
import '../css/BlogPost.css';

const POST_AUTHOR_NAME = 'Damon Ryon';

const getDisplayTitle = (article: SeoArticle): string => {
  return article.h1 || article.title_tag || article.slug;
};

const isExternalUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const parseRelatedSlugs = (value?: string): string[] => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => String(entry ?? '').trim())
        .filter(Boolean);
    }
  } catch {
    // Fall through to delimiter parsing.
  }

  return trimmed
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const BlogPost = () => {
  const { slug } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: ({ signal }) => fetchPostBySlug(slug ?? '', { signal }),
    enabled: Boolean(slug),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const { data: postIndex } = useQuery({
    queryKey: ['posts'],
    queryFn: ({ signal }) => fetchPosts({ signal }),
    staleTime: 60_000,
    refetchOnMount: false,
  });

  const internalLinks = useMemo(
    () => (data ? parseInternalLinks(data.internal_links_json) : []),
    [data?.internal_links_json],
  );
  const title = data ? getDisplayTitle(data) : '';
  const breadcrumbs = useMemo(() => {
    if (!data) {
      return [];
    }
    const breadcrumbItems = parseBreadcrumbItems(data.breadcrumb_json);
    return breadcrumbItems.length > 0
      ? breadcrumbItems
      : [
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: title, url: `/blog/${data.slug}` },
        ];
  }, [data, title]);
  const structuredData = useMemo(() => (data ? buildStructuredData(data) : []), [data]);
  const faqItems = useMemo(() => (data ? getVisibleFaqItems(data) : []), [data]);
  const relatedPosts = useMemo(() => {
    if (!data || !postIndex || postIndex.length === 0) {
      return [];
    }

    const bySlug = new Map(postIndex.map((post) => [post.slug, post] as const));
    const explicitRelated = parseRelatedSlugs(data.related_slugs)
      .filter((relatedSlug) => relatedSlug !== data.slug)
      .map((relatedSlug) => bySlug.get(relatedSlug))
      .filter((post): post is SeoArticleIndexItem => Boolean(post));

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

    const currentCategory = data.category_slug?.trim().toLowerCase();
    if (currentCategory) {
      const sameCategory = postIndex.filter(
        (post) => post.slug !== data.slug && post.category_slug?.trim().toLowerCase() === currentCategory,
      );
      if (sameCategory.length > 0) {
        return sameCategory.slice(0, 3);
      }
    }

    const currentCity = data.primary_city?.trim().toLowerCase();
    if (currentCity) {
      const sameCity = postIndex.filter(
        (post) => post.slug !== data.slug && post.primary_city?.trim().toLowerCase() === currentCity,
      );
      if (sameCity.length > 0) {
        return sameCity.slice(0, 3);
      }
    }

    return postIndex.filter((post) => post.slug !== data.slug).slice(0, 3);
  }, [data, postIndex]);

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

  const canonicalUrl = getCanonicalUrl(data);
  const robotsContent = getRobotsMetaContent(data);
  const publishedAt = formatCmsDate(data.publish_date);
  const updatedAt = formatCmsDate(data.update_date);
  const titleTag = data.title_tag || title;
  const description = data.meta_description || data.intro_lede || title;

  return (
    <main className="blog-post">
      <SeoHead
        title={titleTag}
        description={description}
        canonicalUrl={canonicalUrl}
        robots={robotsContent}
        ogType="article"
        ogImage={data.featured_image_url}
        ogImageAlt={data.featured_image_alt || title}
        publishedTime={data.publish_date}
        modifiedTime={data.update_date || data.publish_date}
        articleSection={data.category_slug}
        structuredData={structuredData}
      />

      <nav aria-label="Breadcrumb">
        <ol className="blog-post__breadcrumbs">
          {breadcrumbs.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              {index < breadcrumbs.length - 1 ? (
                isExternalUrl(item.url) ? (
                  <a href={item.url} rel="noopener noreferrer">
                    {item.name}
                  </a>
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
        <p className="blog-post__author">By {POST_AUTHOR_NAME}</p>
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
          loading="eager"
          decoding="async"
        />
      ) : null}

      {data.intro_lede ? <p className="blog-post__lede">{data.intro_lede}</p> : null}

      <section className="blog-post__content">
        <div dangerouslySetInnerHTML={{ __html: data.content_body }} />
      </section>

      {faqItems.length > 0 ? (
        <section className="blog-post__faq" aria-label="Frequently Asked Questions">
          <h2>Frequently Asked Questions</h2>
          {faqItems.map((item, index) => (
            <article key={`${item.question}-${index}`} className="blog-post__faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>
      ) : null}

      {internalLinks.length > 0 ? (
        <section className="blog-post__internal-links">
          <h2>Related Internal Links</h2>
          <ul>
            {internalLinks.map((item, index) => (
              <li key={`${item.url}-${index}`}>
                {isExternalUrl(item.url) ? (
                  <a href={item.url} rel="noopener noreferrer">
                    {item.anchor}
                  </a>
                ) : (
                  <Link to={item.url}>{item.anchor}</Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="blog-post__related">
          <h2>Related Posts</h2>
          <ul>
            {relatedPosts.map((post) => {
              const relatedTitle = post.h1 || post.title_tag || post.slug;
              return (
                <li key={post.slug}>
                  <Link to={`/blog/${post.slug}`}>{relatedTitle}</Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p>
        <Link to="/blog">← Back to all posts</Link>
      </p>
    </main>
  );
};
