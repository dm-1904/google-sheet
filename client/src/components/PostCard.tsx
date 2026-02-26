import { Link } from 'react-router-dom';
import type { Post } from '../types/post';

type Props = {
  post: Post;
};

export const PostCard = ({ post }: Props) => {
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Unknown date';

  return (
    <article style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      {post.heroImageUrl ? (
        <img
          src={post.heroImageUrl}
          alt={post.heroImageAlt || post.title}
          style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 4 }}
        />
      ) : null}
      <p style={{ marginTop: 8, marginBottom: 4, color: '#666' }}>
        {post.category || 'Uncategorized'} · {date}
      </p>
      <h2 style={{ marginTop: 0 }}>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p>{post.metaDescription}</p>
    </article>
  );
};
