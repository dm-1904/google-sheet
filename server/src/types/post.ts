export type Post = {
  slug: string;
  title: string;
  metaDescription: string;
  heroImageUrl: string;
  heroImageAlt: string;
  category: string;
  tags: string;
  publishedAt: string;
  author: string;
  contentHtml: string;
};

export const REQUIRED_HEADERS = [
  'slug',
  'title',
  'metaDescription',
  'heroImageUrl',
  'heroImageAlt',
  'category',
  'tags',
  'publishedAt',
  'author',
  'contentHtml'
] as const;
