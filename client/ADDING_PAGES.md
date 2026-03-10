# Adding Pages Safely

Use this checklist when bringing pages from another React app into this project.

## 1) Keep app bootstrap files untouched

Do **not** copy over these files from your old app:

- `src/main.tsx`
- `src/App.tsx`
- any old router/provider setup

This project already wires providers in `src/main.tsx` (React Query, Helmet, Router).

## 2) Copy only page-level code

For each page from your old app:

1. Copy the page component into `src/pages/` (or a subfolder).
2. Copy reusable UI pieces into `src/components/`.
3. Copy helper logic into `src/api/`, `src/types/`, or a new `src/lib/` folder.
4. Move static assets into `public/` or co-locate in `src/assets/`.

## 3) Fix imports after copy

- Convert old absolute imports (for example `@/components/...`) to this project's paths.
- Remove imports for libraries that are not installed yet.
- If the old page used a different router API, convert it to `react-router-dom@6`.

## 4) Register the new route

Add the route in `src/routes/AppRoutes.tsx`:

```tsx
import { YourPage } from '../pages/YourPage';

<Route path="/your-path" element={<YourPage />} />;
```

Then optionally add a nav link in `src/layouts/SiteLayout.tsx`.

## 5) Install missing dependencies in `client`

If copied files require packages not currently in `client/package.json`, install them with:

```bash
npm install -w client <package-name>
```

## 6) Verify before moving to the next page

Run:

```bash
npm run build -w client
```

Only continue after the build passes.

## Current route structure

- `src/routes/AppRoutes.tsx` is the single place for route registration.
- `src/layouts/SiteLayout.tsx` wraps shared layout/nav.
- `src/pages/` contains page components.
