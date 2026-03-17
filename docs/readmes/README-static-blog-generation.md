# Static Blog Generation (Google Sheets CMS)

This project now supports static blog page generation from Google Sheets rows.

For a non-technical step-by-step version, use:

- `docs/readmes/README-blog-production-seo-and-deployment.md`

## Architecture Chosen

- Keep existing React + Express architecture.
- Add a static generation layer for blog routes.
- Generate HTML files for:
  - `/blog`
  - `/blog/:slug`
- Keep Google Sheets as source of truth.
- Keep current SPA routes/components as fallback and for interactive app behavior.
- Static `/blog` index supports client-side city + category filtering via URL hash state (no extra indexable URLs).

This approach avoids a full framework migration while giving SEO-first static HTML for blog pages.

## How Generation Works

Generation entrypoint:

- `npm run generate:blog-static`

Implementation:

- Script reads Google Sheets via existing read-only integration.
- It maps/normalizes rows through the current content mapper.
- It requires an absolute site URL (`SITE_BASE_URL`) by default to avoid relative canonical/OG output.
- It writes static files to:
  - `client/public/blog/index.html`
  - `client/public/blog/<slug>/index.html`
  - `client/public/blog-static.css`

## Build Integration

Root build now runs static generation first:

- `npm run build`
  1. `generate:blog-static`
  2. server build
  3. client build

This ensures generated blog pages are always up-to-date at build time.

## Update Flow From Google Sheets

### Default flow (build-time)

1. Edit row in Google Sheets.
2. Trigger your deployment build.
3. Build runs static generation and publishes updated blog HTML.

### On-demand revalidation endpoint

- Endpoint: `POST /api/blog/revalidate`
- Header auth (recommended): `x-revalidate-secret: <BLOG_REVALIDATE_SECRET>`
- Query fallback: `?secret=<BLOG_REVALIDATE_SECRET>`
- Status endpoint: `GET /api/blog/revalidate/status`

What it does:

1. Invalidates server post cache.
2. Regenerates static blog HTML locally.
3. Optionally triggers deploy build hook if `DEPLOY_BUILD_HOOK_URL` is set.

Production note:

- In production, `BLOG_REVALIDATE_SECRET` must be set or the revalidation endpoint returns an error.

## Google Sheet Headers (Current)

Required:

- `status`
- `slug`
- `title_tag`
- `meta_description`
- `content_body`

Recommended:

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
- `related_slugs`
- `internal_links_json`
- `breadcrumb_json`
- `faq_json`
- `schema_primary_type`
- `schema_enable_article`
- `schema_enable_breadcrumb`
- `schema_enable_faq`
- `primary_city`
- `primary_state`

## Excerpt Rule

Card snippet priority:

1. `excerpt`
2. `intro_lede`
3. Derived short text from `content_body`
4. `meta_description` fallback

## Blog Index Filter Behavior

- City filter is shown above category filter.
- Both city and category options are sorted alphabetically.
- Static index uses hash state (example: `#city=surprise&category=buyers`), so no crawlable duplicate query URLs are created.
- SPA index still supports query filters for navigation and uses `noindex,follow` on filtered states.

## Related Posts Rule

Priority:

1. `related_slugs` (explicit)
2. Same-category fallback (`category_slug`, up to 3)
3. Same-city fallback (`primary_city`, up to 3)
4. Latest posts fallback (up to 3)

## FAQ Rule

Visible FAQ + FAQ schema source order:

1. `faq_json` (preferred)
2. JSON content embedded in body (fallback)
3. Q/A pattern parsing from content body (fallback)

FAQ schema is only emitted when `schema_enable_faq=true` and FAQ items exist.

## Internal JSON Formats

### `internal_links_json`

```json
[
  { "anchor": "Best Neighborhoods in Surprise", "url": "/blog/best-neighborhoods-surprise-az" }
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

### `related_slugs`

CSV:

`moving-to-surprise-arizona,best-neighborhoods-surprise-az`

Or JSON array:

`["moving-to-surprise-arizona","best-neighborhoods-surprise-az"]`

### `faq_json`

```json
[
  { "question": "Is Surprise AZ a good place to retire?", "answer": "..." },
  { "question": "How far is Surprise from Phoenix?", "answer": "..." }
]
```

## SEO and Indexation

Should be indexed:

- `/blog`
- `/blog/:slug` (unless `meta_robots` includes `noindex`)

Should not be indexed:

- `/blog?city=...` SPA filter views
- `/blog?category=...` SPA filter views
- `/blog?city=...&category=...` SPA filter views
- Any post with `meta_robots=noindex`

## Environment Variables

Required for generation:

- `GOOGLE_SHEETS_SPREADSHEET_ID`
- Google credentials (`GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_SERVICE_ACCOUNT_KEY`)
- `SITE_BASE_URL` (absolute URL such as `https://www.yourdomain.com`)

Recommended:

- `STATIC_BLOG_REQUIRE_ABSOLUTE_URLS=1` (default behavior: fail generation if absolute site URL is missing)
- `GOOGLE_SHEETS_TAB_NAME`
- `GOOGLE_SHEETS_RANGE` (default now `A1:Z`)
- `SERVE_STATIC_BLOG_PAGES=1` (serve generated static blog pages from the Node server when available)

Optional revalidation/deploy:

- `BLOG_REVALIDATE_REQUIRE_SECRET=1` (recommended, default behavior)
- `BLOG_REVALIDATE_SECRET`
- `DEPLOY_BUILD_HOOK_URL`

Optional local skip:

- `SKIP_STATIC_BLOG_GENERATION=1`

## Limitations

- Blog is now statically generated, but the rest of the site remains SPA.
- Direct browser requests to blog routes should hit generated HTML in static hosting environments.
- When using the Node server, static assets are served from `client/dist` (then `client/public`) and `/blog` + `/blog/:slug` are served from generated blog files.
- If your host does not serve nested `index.html` directories for `/blog/:slug`, configure rewrites accordingly.
