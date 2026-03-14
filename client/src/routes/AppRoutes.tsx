import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../layouts/SiteLayout';
import { HomePage } from '../pages/HomePage';
import { PropertiesPage } from '../pages/PropertiesPage';

const AboutPage = lazy(() =>
  import('../pages/AboutPage').then(({ AboutPage }) => ({ default: AboutPage })),
);
const BlogIndex = lazy(() =>
  import('../pages/BlogIndex').then(({ BlogIndex }) => ({ default: BlogIndex })),
);
const BlogPost = lazy(() =>
  import('../pages/BlogPost').then(({ BlogPost }) => ({ default: BlogPost })),
);
const LetsConnectPage = lazy(() =>
  import('../pages/LetsConnectPage').then(({ LetsConnectPage }) => ({
    default: LetsConnectPage,
  })),
);
const NeighborhoodGuideDetailPage = lazy(() =>
  import('../pages/NeighborhoodGuideDetailPage').then(({ NeighborhoodGuideDetailPage }) => ({
    default: NeighborhoodGuideDetailPage,
  })),
);
const NeighborhoodGuidesPage = lazy(() =>
  import('../pages/NeighborhoodGuidesPage').then(({ NeighborhoodGuidesPage }) => ({
    default: NeighborhoodGuidesPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then(({ NotFoundPage }) => ({ default: NotFoundPage })),
);
const RetirementCommunitiesPage = lazy(() =>
  import('../pages/RetirementCommunitiesPage').then(({ RetirementCommunitiesPage }) => ({
    default: RetirementCommunitiesPage,
  })),
);
const RetirementCommunityDetailPage = lazy(() =>
  import('../pages/RetirementCommunityDetailPage').then(({ RetirementCommunityDetailPage }) => ({
    default: RetirementCommunityDetailPage,
  })),
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/neighborhood-guides" element={<NeighborhoodGuidesPage />} />
        <Route
          path="/neighborhood-guides/retirement-communities"
          element={<RetirementCommunitiesPage />}
        />
        <Route
          path="/neighborhood-guides/retirement-communities/:communitySlug"
          element={<RetirementCommunityDetailPage />}
        />
        <Route path="/neighborhood-guides/:areaSlug" element={<NeighborhoodGuideDetailPage />} />
        <Route path="/lets-connect" element={<LetsConnectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
