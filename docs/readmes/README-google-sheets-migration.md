# Google Sheets SEO CMS (Minimal Schema)

## Integration Method

The server reads Google Sheets using a **service account** with:

- `https://www.googleapis.com/auth/spreadsheets.readonly`

No write permission is required.

## Where To Paste New Credentials / IDs

### Server (`server/.env`)

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=NEW_GOOGLE_SHEET_ID
GOOGLE_SHEETS_TAB_NAME=Content
GOOGLE_SHEETS_RANGE=A1:ZZ
SITE_BASE_URL=https://www.your-domain.com

# Choose one auth option:
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/new-service-account.json
# or
# GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Client (`client/.env`)

```bash
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=https://www.your-domain.com
VITE_SITE_NAME=Desert Valley Home Search
```

## Required Google Sheet Headers (Row 1)

Use these columns only:

```text
status
slug
canonical_url
publish_date
update_date
title_tag
meta_description
meta_robots
h1
intro_lede
content_body
featured_image_url
featured_image_alt
category_slug
internal_links_json
breadcrumb_json
schema_primary_type
schema_enable_article
schema_enable_breadcrumb
schema_enable_faq
primary_city
primary_state
```

Minimum required for parsing:

```text
status | slug | title_tag | meta_description | content_body
```

## JSON Columns

These should contain valid JSON arrays when used:

- `internal_links_json`
- `breadcrumb_json`

If JSON is malformed, the app falls back safely and skips that section.

## Google Sheet Sharing (Read-Only)

1. Open your new Google Sheet.
2. Click **Share**.
3. Add your service account `client_email` as **Viewer**.
4. Do not grant Editor.
5. Keep the scope read-only (already enforced in server code).

## Verify

1. `npm run build`
2. `npm run dev`
3. Visit `/blog` and `/blog/:slug`
4. Confirm page head has: title, description, robots, canonical
5. Confirm JSON-LD includes Article + Breadcrumb (and FAQ only when enabled)
