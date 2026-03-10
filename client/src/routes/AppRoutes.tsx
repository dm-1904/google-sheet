import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../layouts/SiteLayout';
import { AboutPage } from '../pages/AboutPage';
import { BlogIndex } from '../pages/BlogIndex';
import { BlogPost } from '../pages/BlogPost';
import { HomePage } from '../pages/HomePage';
import { LetsConnectPage } from '../pages/LetsConnectPage';
import { NeighborhoodGuidesPage } from '../pages/NeighborhoodGuidesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PropertiesPage } from '../pages/PropertiesPage';

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
        <Route path="/lets-connect" element={<LetsConnectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
