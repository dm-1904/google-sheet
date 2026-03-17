# Blog SEO Architecture (Google Sheets CMS)

This document covers the current blog SEO implementation for this project.

## 1. Current Blog SEO Architecture

- Frontend: React + React Router (CSR).
- Backend: Express API + Google Sheets read-only CMS.
- Blog index route: `/blog`
- Blog detail route: `/blog/:slug`
- Content source: Google Sheets row-based CMS.
- Structured data: JSON-LD generated in the blog post template.
- Sitemap endpoint: `/api/sitemap.xml`
- Robots file: `client/public/robots.txt`

## 2. Google Sheets Blog Fields

### Required fields

- `status`
- `slug`
- `title_tag`
- `meta_description`
- `content_body`

### Strongly recommended fields

- `canonical_url`
- `publish_date`
- `update_date`
- `meta_robots`
- `h1`
- `excerpt`
- `intro_lede`
- `featured_image_url`
- `featured_image_alt`
- `category_slug`
- `internal_links_json`
- `breadcrumb_json`
- `primary_city`
- `primary_state`

### Optional SEO enhancement fields (implemented)

- `related_slugs`
  - Purpose: explicit related-post internal linking.
  - Supported formats:
    - CSV: `moving-to-surprise-arizona,surprise-neighborhood-overview`
    - JSON array: `["moving-to-surprise-arizona","surprise-neighborhood-overview"]`
- `faq_json`
  - Purpose: visible FAQ rendering + FAQPage schema when enabled.
  - JSON array format:
    ```json
    [
      { "question": "Is Surprise AZ a good place to retire?", "answer": "..." },
      { "question": "How far is Surprise from Phoenix?", "answer": "..." }
    ]
    ```

## 3. Metadata Generation

### Blog index (`/blog`)

- Title and description are set in the page template.
- Canonical is `/blog`.
- Category-filtered query views are `noindex,follow`.

### Blog article (`/blog/:slug`)

- Title: `title_tag` (fallback: `h1`/`slug`).
- Description: `meta_description` (fallback: `intro_lede`/title).
- Canonical: `canonical_url` (fallback: `/blog/:slug`).
- Robots: `meta_robots` (fallback: `index,follow`).
- Open Graph/Twitter: uses article title/description and featured image.

## 4. Structured Data Generation

- `BlogPosting`/`Article` schema enabled by `schema_enable_article`.
- `BreadcrumbList` schema enabled by `schema_enable_breadcrumb`.
- `FAQPage` schema enabled by `schema_enable_faq` and only generated when FAQ items exist.
- FAQ source order:
  1. `faq_json`
  2. Fallback parsing from article content/body when possible.

## 5. Internal Linking

- `internal_links_json` renders a visible "Related Internal Links" section.
- `related_slugs` renders a visible "Related Posts" section.
- If `related_slugs` is empty, system falls back to same-category related posts.

## 6. JSON Field Formats

### `internal_links_json`

```json
[
  { "anchor": "Best Neighborhoods in Surprise", "url": "/blog/best-neighborhoods-surprise-az" },
  { "anchor": "Sun City Grand Guide", "url": "/neighborhood-guides/retirement-communities/sun-city-grand" }
]
```

### `breadcrumb_json`

```json
[
  { "name": "Home", "url": "/" },
  { "name": "Blog", "url": "/blog" },
  { "name": "Moving to Surprise Arizona", "url": "/blog/moving-to-surprise-arizona" }
]
```

## 7. Indexation Rules

Should be indexed:

- `/blog`
- `/blog/:slug` where `meta_robots` is not `noindex`

Should not be indexed:

- `/blog?category=...` filtered views (`noindex,follow`)
- Any blog post row where `meta_robots` includes `noindex`

## 8. Adding a New Blog Post (SEO Checklist)

1. Add a new row with required fields.
2. Keep `slug` short, unique, and stable.
3. Write a unique `title_tag` and `meta_description`.
4. Set `h1` aligned with article intent.
5. Add `publish_date` and update `update_date` when revising.
6. Add `featured_image_url` and `featured_image_alt`.
7. Add `internal_links_json` and/or `related_slugs`.
8. Add `breadcrumb_json` for clean navigation context.
9. If FAQ exists, add `faq_json` and set `schema_enable_faq=true`.
10. Set `status=published`.

## 9. Image Requirements

- Place local images in `client/public/images/blog`.
- Use `featured_image_url` as filename or `/images/blog/<filename>`.
- Always set `featured_image_alt`.
- Prefer compressed images (JPG/WebP) for performance.

## 10. Environment/Range Notes

- Default sheet range now supports additional fields: `A1:Z`.
- You can set `GOOGLE_SHEETS_RANGE` wider if needed.

## 11. Known Limitations

- Blog pages are CSR-rendered (not SSR/SSG), so search engines must render JS.
- Related posts depend on available index data and category quality.
- FAQ schema quality depends on valid `faq_json` or parseable content.
