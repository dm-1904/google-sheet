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
  | 'primary_city'
>;
