import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { fetchPostBySlug } from "../api/posts";

export const BlogPost = () => {
  const { slug } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug ?? ""),
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
        <Link to="/">Back to all posts</Link>
      </main>
    );
  }

  if (!data) {
    return <p>Post not found.</p>;
  }

  const publishedAt = data.publishedAt
    ? new Date(data.publishedAt).toLocaleDateString()
    : "Unknown date";

  return (
    <main>
      <Helmet>
        <title>{data.title}</title>
        <meta
          name="description"
          content={data.metaDescription || data.title}
        />
      </Helmet>
      <header>
        <h1>{data.title}</h1>
        <p>
          <strong>Author:</strong> {data.author || "Unknown"}
        </p>
        <p>
          <strong>Published:</strong> {publishedAt}
        </p>
      </header>

      {data.heroImageUrl ? (
        <img
          src={data.heroImageUrl}
          alt={data.heroImageAlt || data.title}
          style={{ width: "100%", maxWidth: 720, borderRadius: 8 }}
        />
      ) : null}

      <section>
        <h2>Article</h2>
        {/*
          SECURITY: this uses trusted HTML from your private Google Sheet.
          Never render untrusted user content with dangerouslySetInnerHTML.
        */}
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml ?? "" }} />
      </section>

      <p>
        <Link to="/">← Back to all posts</Link>
      </p>
    </main>
  );
};
