# Neighborhood Guides Implementation Notes

## Files Added

- `client/src/components/GuideCard.tsx`
- `client/src/css/NeighborhoodGuides.css`
- `client/src/lib/neighborhoodGuides.ts`
- `client/src/pages/NeighborhoodGuideDetailPage.tsx`
- `client/src/pages/RetirementCommunitiesPage.tsx`
- `client/src/pages/RetirementCommunityDetailPage.tsx`
- `client/public/images/neighborhood-guides/.gitkeep`
- `client/public/images/retirement-communities/.gitkeep`

## Files Modified

- `client/src/pages/NeighborhoodGuidesPage.tsx`
- `client/src/routes/AppRoutes.tsx`

## Main Route

- `/neighborhood-guides`

## City Guide Routes

- `/neighborhood-guides/surprise`
- `/neighborhood-guides/glendale`
- `/neighborhood-guides/peoria`
- `/neighborhood-guides/goodyear`
- `/neighborhood-guides/buckeye`

## Retirement Hub Route

- `/neighborhood-guides/retirement-communities`

## Retirement Community Routes

- `/neighborhood-guides/retirement-communities/sun-city`
- `/neighborhood-guides/retirement-communities/sun-city-west`
- `/neighborhood-guides/retirement-communities/sun-city-grand`
- `/neighborhood-guides/retirement-communities/pebblecreek`
- `/neighborhood-guides/retirement-communities/trilogy-at-vistancia`
- `/neighborhood-guides/retirement-communities/victory-at-verrado`
- `/neighborhood-guides/retirement-communities/corte-bella`
- `/neighborhood-guides/retirement-communities/arizona-traditions`
- `/neighborhood-guides/retirement-communities/sun-city-festival`
- `/neighborhood-guides/retirement-communities/sun-village`
- `/neighborhood-guides/retirement-communities/cantamia-at-estrella`
- `/neighborhood-guides/retirement-communities/sundance-active-adult`

## Image Files You Still Need to Add

Place these files in `client/public` exactly as listed.

### Main Neighborhood Guides

- `/images/neighborhood-guides/surprise.jpg`
- `/images/neighborhood-guides/retirement-communities.jpg`
- `/images/neighborhood-guides/glendale.jpg`
- `/images/neighborhood-guides/peoria.jpg`
- `/images/neighborhood-guides/goodyear.jpg`
- `/images/neighborhood-guides/buckeye.jpg`

### Retirement Communities

- `/images/retirement-communities/sun-city.jpg`
- `/images/retirement-communities/sun-city-west.jpg`
- `/images/retirement-communities/sun-city-grand.jpg`
- `/images/retirement-communities/pebblecreek.jpg`
- `/images/retirement-communities/trilogy-at-vistancia.jpg`
- `/images/retirement-communities/victory-at-verrado.jpg`
- `/images/retirement-communities/corte-bella.jpg`
- `/images/retirement-communities/arizona-traditions.jpg`
- `/images/retirement-communities/sun-city-festival.jpg`
- `/images/retirement-communities/sun-village.jpg`
- `/images/retirement-communities/cantamia-at-estrella.jpg`
- `/images/retirement-communities/sundance-active-adult.jpg`

## Placeholder Replacement Guide

### Replace Main Hub or Retirement Hub Tile Content

1. Open `client/src/lib/neighborhoodGuides.ts`.
2. Update each `description` string as your real copy is ready.
3. Keep `path` and `slug` values stable unless you intentionally want URL changes.
4. Replace image files in `client/public/images/...` with real images using the same file names.

### Replace City Placeholder Pages with Real Content

1. Option A: Keep dynamic placeholders and expand `NeighborhoodGuideDetailPage.tsx` to pull content by slug.
2. Option B: Create dedicated page files per city and route them explicitly in `AppRoutes.tsx`.

### Replace Retirement Community Placeholder Pages with Real Content

1. Option A: Keep dynamic placeholder route and expand `RetirementCommunityDetailPage.tsx` by slug.
2. Option B: Create dedicated community page files and route each explicitly in `AppRoutes.tsx`.

## Notes

- Existing nav and footer remain unchanged because all new pages render inside `SiteLayout`.
- If an expected guide image is missing, cards currently fall back to `/arizona-home-1.jpg`.
