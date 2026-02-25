# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

// BEGIN README FILE FROM CODEX

# Google Sheets Blog CMS (Beginner Friendly)

This project lets you manage blog posts inside a Google Sheet, and show them in a website.

- **Backend** (`/server`): reads your Google Sheet and exposes API endpoints.
- **Frontend** (`/client`): displays blog list + blog detail pages.

---

## 1) Entire file structure

```text
.
├── .gitignore
├── .gitkeep
├── README.md
├── package.json
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── api/
│       │   └── posts.ts
│       ├── components/
│       │   └── PostCard.tsx
│       ├── pages/
│       │   ├── BlogIndex.tsx
│       │   └── BlogPost.tsx
│       └── types/
│           └── post.ts
└── server/
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── routes/
        │   └── posts.ts
        ├── services/
        │   └── sheetsCms.ts
        └── types/
            └── post.ts
```

---

## 2) Install required tools first (one-time)

If you know nothing about code, do these first:

1. Install **Node.js LTS** (version 20+ recommended):
   - https://nodejs.org/
2. Install **Git**:
   - https://git-scm.com/downloads
3. (Optional but recommended) Install **VS Code**:
   - https://code.visualstudio.com/

Then confirm in terminal:

```bash
node -v
npm -v
git --version
```

---

## 3) Create your Google Sheet correctly

Create a Google Sheet with one tab named exactly:

- `Posts`

In row 1, add this header row exactly (same spelling/casing):

```text
slug | title | metaDescription | heroImageUrl | heroImageAlt | category | tags | publishedAt | author | contentHtml
```

### Example row (row 2)

```text
first-post | My First SEO Post | Simple meta description | https://picsum.photos/800/400 | Hero image alt text | Real Estate | Surprise AZ, West Valley, VA loan | 2026-02-25 | Jane Doe | <h2>Intro</h2><p>This is my first post from Google Sheets.</p>
```

Rules:

- `slug` must be unique and URL-safe (example: `first-post`).
- `tags` is comma-separated text.
- `publishedAt` should be `YYYY-MM-DD` or another parseable date.
- Rows missing `slug` or `title` are ignored by server.

---

## 4) Create Google Cloud project + service account (non-coder steps)

1. Open Google Cloud Console:
   - https://console.cloud.google.com/
2. Create a **new project** (top bar project dropdown → New Project).
3. In that project, enable API:
   - **APIs & Services** → **Library** → search **Google Sheets API** → **Enable**.
4. Create service account:
   - **IAM & Admin** → **Service Accounts** → **Create Service Account**.
5. After creation, open that service account:
   - Go to **Keys** tab → **Add key** → **Create new key** → choose **JSON**.
6. A JSON file downloads. Keep it safe (do not share it publicly).

---

## 5) Share your Google Sheet with service account email

1. Copy service account email (looks like `name@project-id.iam.gserviceaccount.com`).
2. Open your Google Sheet.
3. Click **Share**.
4. Paste service account email.
5. Give **Viewer** access.
6. Click **Send**.

If you skip this, your API will fail with permission errors.

---

## 6) Configure environment files

### Server env

1. In `/server`, copy `.env.example` to `.env`.
2. Put your values in `server/.env`:

```bash
SERVER_PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Posts
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your-service-account.json
```

How to get `SPREADSHEET_ID`:

- From sheet URL:
  - `https://docs.google.com/spreadsheets/d/<THIS_PART_IS_ID>/edit...`

Alternative auth option:

- Instead of `GOOGLE_APPLICATION_CREDENTIALS`, you can set `GOOGLE_SERVICE_ACCOUNT_KEY` with raw JSON.

### Client env

1. In `/client`, copy `.env.example` to `.env`.
2. Put this value:

```bash
VITE_API_URL=http://localhost:4000
```

---

## 7) Install dependencies

From project root:

```bash
npm install
```

If your company network blocks npm, try from home network or adjust npm registry policy.

---

## 8) Start app

### easiest (one command)

From project root:

```bash
npm run dev
```

This starts:

- Server: `http://localhost:4000`
- Client: `http://localhost:5173`

### OR use two terminals

Terminal A:

```bash
npm run dev -w server
```

Terminal B:

```bash
npm run dev -w client
```

---

## 9) Test in browser

1. Open `http://localhost:5173/`.
2. You should see blog post list.
3. Click one post.
4. URL should be like: `http://localhost:5173/blog/first-post`.
5. You should see full article HTML rendered.

---

## 10) API endpoints (what frontend uses)

- `GET http://localhost:4000/api/posts`
  - returns all posts sorted by newest first
  - intentionally omits `contentHtml` for lighter list payload
- `GET http://localhost:4000/api/posts/:slug`
  - returns one full post including `contentHtml`

---

## 11) Troubleshooting (very common)

### A) `Post not found`

- Check the sheet row has `slug` and `title`.
- Make sure URL slug exactly matches sheet slug.

### B) Permission/403 from Google

- Confirm sheet is shared with service account email.
- Confirm correct JSON key file path.
- Confirm Google Sheets API is enabled in correct project.

### C) No posts show up

- Confirm tab name is `Posts`.
- Confirm exact header row text.
- Confirm `SPREADSHEET_ID` is correct.

### D) CORS error in browser

- Confirm `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`.
- Restart server after `.env` changes.

---

## 12) Security note

- Keep service account JSON on server machine only.
- Never put Google credentials in `/client` code or env.

---

## Quick verification checklist

- Confirm header row matches spec.
- Share the sheet with the service account email.
- Start server + client.
- Open `/` to see list.
- Click a post to see `/blog/:slug` render HTML.
