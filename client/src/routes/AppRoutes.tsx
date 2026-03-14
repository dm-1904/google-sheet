import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../layouts/SiteLayout';
import { AboutPage } from '../pages/AboutPage';
import { BlogIndex } from '../pages/BlogIndex';
import { BlogPost } from '../pages/BlogPost';
import { HomePage } from '../pages/HomePage';
import { LetsConnectPage } from '../pages/LetsConnectPage';
import { NeighborhoodGuideDetailPage } from '../pages/NeighborhoodGuideDetailPage';
import { NeighborhoodGuidesPage } from '../pages/NeighborhoodGuidesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PropertiesPage } from '../pages/PropertiesPage';
import { RetirementCommunitiesPage } from '../pages/RetirementCommunitiesPage';
import { RetirementCommunityDetailPage } from '../pages/RetirementCommunityDetailPage';

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
