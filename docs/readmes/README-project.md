# Google Sheets Blog CMS

Monorepo with:
- `server/`: Express API that reads posts from Google Sheets
- `client/`: React app that renders post index + detail pages

## Requirements

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Environment

### Server (`server/.env`)

```bash
SERVER_PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SITE_BASE_URL=http://localhost:5173
GOOGLE_SHEETS_SPREADSHEET_ID=NEW_GOOGLE_SHEET_ID
GOOGLE_SHEETS_TAB_NAME=Content
GOOGLE_SHEETS_RANGE=A1:ZZ

# Option 1: inline JSON key
# GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Option 2: file path (recommended for local dev)
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/new-service-account.json
```

### Client (`client/.env`)

```bash
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=Desert Valley Home Search
```

## Run

Start both apps:

```bash
npm run dev
```

Or run independently:

```bash
npm run dev -w server
npm run dev -w client
```

## Build

```bash
npm run build
```

## API

- `GET /api/health`
- `GET /api/posts`
- `GET /api/posts/:slug`

## Google Sheet Header Row

Tab name defaults to `Content`. Header row must include at least:

```text
status | slug | title_tag | meta_description | content_body
```

The app now supports the SEO-first schema fields listed in:
- `GOOGLE_SHEETS_MIGRATION.md`

Rows without `slug`, `title_tag`, `meta_description`, or `content_body` are ignored.
