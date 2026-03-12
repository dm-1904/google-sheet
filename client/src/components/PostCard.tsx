import { Link } from 'react-router-dom';
import type { SeoArticleIndexItem } from '../types/post';
import '../css/PostCard.css';

type Props = {
  post: SeoArticleIndexItem;
};

export const PostCard = ({ post }: Props) => {
  const dateValue = post.publish_date || post.update_date;
  const date = dateValue ? new Date(dateValue).toLocaleDateString() : 'Unknown date';
  const title = post.h1 || post.title_tag || post.slug;
  const summary = post.intro_lede || post.meta_description;
  const href = `/blog/${post.slug}`;

  return (
    <article className="post-card">
      {post.featured_image_url ? (
        <img
          src={post.featured_image_url}
          alt={post.featured_image_alt || title}
          className="post-card__image"
        />
      ) : null}
      <p className="post-card__meta">
        {(post.category_slug || 'Uncategorized').toString()} · {date}
      </p>
      <h2 className="post-card__title">
        <Link to={href}>{title}</Link>
      </h2>
      <p>{summary}</p>
    </article>
  );
};
