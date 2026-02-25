<<<<<<< ours
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { fetchPostBySlug } from "../api/posts";
=======
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { fetchPostBySlug } from '../api/posts';
>>>>>>> theirs

export const BlogPost = () => {
  const { slug } = useParams();

  const { data, isLoading, isError, error } = useQuery({
<<<<<<< ours
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug ?? ""),
    enabled: Boolean(slug),
=======
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug ?? ''),
    enabled: Boolean(slug)
>>>>>>> theirs
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
        <Link to="/">Back to all posts</Link>
      </main>
    );
  }

  if (!data) {
    return <p>Post not found.</p>;
  }

<<<<<<< ours
  const publishedAt = data.publishedAt
    ? new Date(data.publishedAt).toLocaleDateString()
    : "Unknown date";
=======
  const publishedAt = data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : 'Unknown date';
>>>>>>> theirs

  return (
    <main>
      <Helmet>
        <title>{data.title}</title>
<<<<<<< ours
        <meta
          name="description"
          content={data.metaDescription || data.title}
        />
=======
        <meta name="description" content={data.metaDescription || data.title} />
>>>>>>> theirs
      </Helmet>
      <header>
        <h1>{data.title}</h1>
        <p>
<<<<<<< ours
          <strong>Author:</strong> {data.author || "Unknown"}
=======
          <strong>Author:</strong> {data.author || 'Unknown'}
>>>>>>> theirs
        </p>
        <p>
          <strong>Published:</strong> {publishedAt}
        </p>
      </header>

      {data.heroImageUrl ? (
        <img
          src={data.heroImageUrl}
          alt={data.heroImageAlt || data.title}
<<<<<<< ours
          style={{ width: "100%", maxWidth: 720, borderRadius: 8 }}
=======
          style={{ width: '100%', maxWidth: 720, borderRadius: 8 }}
>>>>>>> theirs
        />
      ) : null}

      <section>
        <h2>Article</h2>
        {/*
          SECURITY: this uses trusted HTML from your private Google Sheet.
          Never render untrusted user content with dangerouslySetInnerHTML.
        */}
<<<<<<< ours
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml ?? "" }} />
=======
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml ?? '' }} />
>>>>>>> theirs
      </section>

      <p>
        <Link to="/">← Back to all posts</Link>
      </p>
    </main>
  );
};
