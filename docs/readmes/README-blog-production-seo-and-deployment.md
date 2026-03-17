# Blog Production SEO and Deployment Guide

This guide is written for non-developers. Follow the steps exactly.

## 1. What `SITE_BASE_URL` is and why it matters

`SITE_BASE_URL` is your real website address.

Example:

- `https://www.desertvalleyhomesearch.com`

Why this matters:

- Google needs absolute canonical URLs (full URLs, not just `/blog/post-slug`).
- Open Graph tags also need absolute URLs for social sharing.
- If `SITE_BASE_URL` is wrong or missing, SEO tags can be wrong.

## 2. Exactly where to set `SITE_BASE_URL`

Set it in your server environment variables.

Local development file:

- `server/.env`

Production hosting environment:

- Your hosting dashboard environment variable settings.

Use this exact format:

- Include `https://`
- No trailing slash

Correct:

- `https://www.desertvalleyhomesearch.com`

Incorrect:

- `www.desertvalleyhomesearch.com`
- `https://www.desertvalleyhomesearch.com/`

## 3. Required environment variables for production blog SEO

In `server/.env` (and production env settings), set:

1. `SITE_BASE_URL=https://www.yourdomain.com`
2. `STATIC_BLOG_REQUIRE_ABSOLUTE_URLS=1`
3. `BLOG_REVALIDATE_REQUIRE_SECRET=1`
4. `BLOG_REVALIDATE_SECRET=<long-random-secret>`
5. `SERVE_STATIC_BLOG_PAGES=1`
6. `GOOGLE_SHEETS_SPREADSHEET_ID=<your-sheet-id>`
7. Google credentials:
   - `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/key.json`
   - or `GOOGLE_SERVICE_ACCOUNT_KEY={...}`

Optional but recommended:

1. `DEPLOY_BUILD_HOOK_URL=<your-host-build-hook>`
2. `GOOGLE_SHEETS_TAB_NAME=posts`
3. `GOOGLE_SHEETS_RANGE=A1:Z`

## 4. How static blog generation works

When you run the generation command, the project creates real HTML pages:

- `client/public/blog/index.html`
- `client/public/blog/<slug>/index.html`
- `client/public/blog-static.css`

Command:

```bash
npm run generate:blog-static
```

Success looks like this:

- Terminal says static blog generation completed.
- You can open the folders above and see files.

## 5. Build and deployment flow

Use this command from project root:

```bash
npm run build
```

This does all 3 steps in order:

1. Generates static blog HTML from Google Sheets
2. Builds server code
3. Builds client code

Important:

- If `SITE_BASE_URL` is missing and `STATIC_BLOG_REQUIRE_ABSOLUTE_URLS=1`, build will fail on purpose.
- This prevents bad canonical/OG tags from being deployed.

## 6. How production serves generated blog pages

If you run the Node server in production:

- `/blog` and `/blog/:slug` are served from generated static files first.
- Static assets are served from `client/dist` first (then `client/public` fallback).
- Server checks `client/dist/blog` first, then `client/public/blog` as fallback.
- Controlled by `SERVE_STATIC_BLOG_PAGES=1`.

If you use static hosting/CDN:

1. Deploy the built client output (`client/dist`).
2. Confirm `client/dist/blog/index.html` and `client/dist/blog/<slug>/index.html` exist in deployed files.
3. Make sure host rewrites do NOT force `/blog/*` directly to SPA `index.html`.

## 7. How to confirm canonical and OG tags after deployment

For a live post URL, example:

- `https://www.yourdomain.com/blog/moving-to-surprise-arizona`

Check in browser:

1. Open the page.
2. Right-click -> View Page Source.
3. Find:
   - `<link rel="canonical" href="https://...">`
   - `<meta property="og:url" content="https://...">`
   - `<meta property="og:image" content="https://...">`

All should be full absolute URLs with your real domain.

## 8. Google Sheets update flow (how content changes reach the site)

You have two options.

### Option A: Build-based update flow (simple and reliable)

1. Edit your Google Sheet row.
2. Save sheet changes.
3. Trigger a new site build/deploy.
4. Build regenerates static blog pages.

### Option B: Revalidation endpoint flow (faster updates)

1. Send a `POST` request to:
   - `/api/blog/revalidate`
2. Include header:
   - `x-revalidate-secret: <BLOG_REVALIDATE_SECRET>`
3. Endpoint regenerates blog pages.
4. If `DEPLOY_BUILD_HOOK_URL` is set, it also triggers a deploy build hook.

Status check endpoint:

- `GET /api/blog/revalidate/status`

This tells you if secret and deploy hook are configured.

## 9. Publishing a new blog post from Google Sheets

1. Add a new row in your sheet.
2. Set required fields:
   - `status=published`
   - `slug`
   - `title_tag`
   - `meta_description`
   - `content_body`
3. Add recommended fields:
   - `canonical_url`
   - `publish_date`
   - `update_date`
   - `h1`
   - `featured_image_url`
   - `featured_image_alt`
   - `category_slug`
   - `primary_city`
4. Optional SEO enhancers:
   - `related_slugs`
   - `internal_links_json`
   - `faq_json`
5. Trigger build/revalidate flow.
6. Open the live URL and verify content appears.

## 10. How related posts work

Related posts are chosen in this order:

1. `related_slugs` (if provided)
2. Same `category_slug`
3. Same `primary_city`
4. Most recent other posts

How to get stronger internal linking:

1. Use consistent `category_slug` values (same spelling/case pattern).
2. Use consistent `primary_city` values.
3. Add `related_slugs` on important posts.
4. Add `internal_links_json` with useful anchor text.

## 11. Troubleshooting

### A) Blog page is not updating

1. Confirm the row is `status=published`.
2. Confirm slug is correct and unique.
3. Run build or revalidate flow again.
4. Hard refresh browser (`Cmd+Shift+R` on Mac).
5. Check server logs for Google API/permission errors.

### B) Canonical URL is wrong or relative

1. Check `SITE_BASE_URL` in production env.
2. Ensure it starts with `https://` and has no trailing slash.
3. Rebuild/revalidate.
4. Re-check page source.

### C) OG URL/image is wrong

1. Verify `SITE_BASE_URL`.
2. Verify `featured_image_url` value in sheet.
3. Confirm image path exists (for local images: `client/public/images/blog/...`).
4. Rebuild/revalidate and inspect page source tags.

### D) Blog route is showing SPA/CSR output instead of generated HTML

1. Confirm generated files exist in deploy artifact (`dist/blog/...`).
2. If using Node server, set `SERVE_STATIC_BLOG_PAGES=1`.
3. Check hosting rewrites so `/blog` and `/blog/:slug` are not always redirected to SPA `index.html`.
4. Re-deploy.

### E) Missing related posts

1. Add `related_slugs` explicitly.
2. If not using `related_slugs`, ensure matching `category_slug` values.
3. If categories differ, ensure `primary_city` is filled consistently.

### F) FAQ not showing or FAQ schema missing

1. Ensure `faq_json` is valid JSON array:
   - `[{"question":"...","answer":"..."}]`
2. Set `schema_enable_faq=true`.
3. Confirm FAQ is visible on page.
4. Rebuild/revalidate.

## 12. Quick post-deployment checklist

1. Open `/blog` and one `/blog/:slug` URL.
2. Confirm content loads without waiting on client fetch-only behavior.
3. Confirm canonical tag is absolute with your domain.
4. Confirm `og:url` and `og:image` are absolute.
5. Confirm related posts section appears.
6. Confirm FAQ section/schema appears when FAQ exists.
7. Confirm a Google Sheet edit appears after rebuild/revalidate.
