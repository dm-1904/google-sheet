import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { SeoArticleIndexItem } from '../types/post';
import '../css/PostCard.css';
import { formatCategoryLabel } from '../lib/category';

type Props = {
  post: SeoArticleIndexItem;
};

const PostCardComponent = ({ post }: Props) => {
  const dateValue = post.publish_date || post.update_date;
  const date = dateValue ? new Date(dateValue).toLocaleDateString() : 'Unknown date';
  const title = post.h1 || post.title_tag || post.slug;
  const summary = post.intro_lede || post.meta_description;
  const href = `/blog/${post.slug}`;
  const categoryLabel = formatCategoryLabel(post.category_slug);

  return (
    <article className="post-card">
      <p className="post-card__meta">
        <span className="post-card__category">{categoryLabel}</span> · {date}
      </p>
      <h2 className="post-card__title">
        <Link to={href}>{title}</Link>
      </h2>
      <p className="post-card__summary">{summary}</p>
    </article>
  );
};

export const PostCard = memo(PostCardComponent);
