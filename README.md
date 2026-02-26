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
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Posts

# Option 1: inline JSON key
# GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Option 2: file path (recommended for local dev)
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

### Client (`client/.env`)

```bash
VITE_API_URL=http://localhost:4000
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

Tab name defaults to `Posts`. Header row must include:

```text
slug | title | metaDescription | heroImageUrl | heroImageAlt | category | tags | publishedAt | author | contentHtml
```

Rows missing `slug` or `title` are ignored.
