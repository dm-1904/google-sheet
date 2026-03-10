import { Link } from 'react-router-dom';
import type { Post } from '../types/post';
import '../css/PostCard.css';

type Props = {
  post: Post;
};

export const PostCard = ({ post }: Props) => {
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Unknown date';

  return (
    <article className="post-card">
      {post.heroImageUrl ? (
        <img
          src={post.heroImageUrl}
          alt={post.heroImageAlt || post.title}
          className="post-card__image"
        />
      ) : null}
      <p className="post-card__meta">
        {post.category || 'Uncategorized'} · {date}
      </p>
      <h2 className="post-card__title">
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p>{post.metaDescription}</p>
    </article>
  );
};
