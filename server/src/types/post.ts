export interface SeoArticle {
  status: string;
  slug: string;
  canonical_url: string;
  publish_date: string;
  update_date?: string;
  title_tag: string;
  meta_description: string;
  meta_robots?: string;
  h1: string;
  excerpt?: string;
  intro_lede?: string;
  content_body: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  category_slug?: string;
  related_slugs?: string;
  internal_links_json?: string;
  breadcrumb_json?: string;
  faq_json?: string;
  schema_primary_type?: string;
  schema_enable_article?: boolean;
  schema_enable_breadcrumb?: boolean;
  schema_enable_faq?: boolean;
  primary_city?: string;
  primary_state?: string;
}

export type SeoArticleIndexItem = Pick<
  SeoArticle,
  | 'status'
  | 'slug'
  | 'canonical_url'
  | 'publish_date'
  | 'update_date'
  | 'title_tag'
  | 'meta_description'
  | 'h1'
  | 'excerpt'
  | 'intro_lede'
  | 'featured_image_url'
  | 'featured_image_alt'
  | 'category_slug'
>;

export const SEO_ARTICLE_HEADERS = [
  'status',
  'slug',
  'canonical_url',
  'publish_date',
  'update_date',
  'title_tag',
  'meta_description',
  'meta_robots',
  'h1',
  'excerpt',
  'intro_lede',
  'content_body',
  'featured_image_url',
  'featured_image_alt',
  'category_slug',
  'related_slugs',
  'internal_links_json',
  'breadcrumb_json',
  'faq_json',
  'schema_primary_type',
  'schema_enable_article',
  'schema_enable_breadcrumb',
  'schema_enable_faq',
  'primary_city',
  'primary_state',
] as const;

export const REQUIRED_HEADERS = ['status', 'slug', 'title_tag', 'meta_description', 'content_body'] as const;
