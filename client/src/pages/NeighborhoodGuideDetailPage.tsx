import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import '../css/NeighborhoodGuides.css';
import { getCityNeighborhoodGuideBySlug } from '../lib/neighborhoodGuides';

export const NeighborhoodGuideDetailPage = () => {
  const { areaSlug } = useParams();
  const guide = getCityNeighborhoodGuideBySlug(areaSlug);

  if (!guide) {
    return (
      <main className="guide-detail-page">
        <h1>Neighborhood Guide Not Found</h1>
        <p>That neighborhood guide route does not exist yet.</p>
        <Link className="guide-detail-page__back-link" to="/neighborhood-guides">
          ← Back to Neighborhood Guides
        </Link>
      </main>
    );
  }

  return (
    <main className="guide-detail-page">
      <Helmet>
        <title>{guide.title} Neighborhood Guide | West Valley Real Estate</title>
        <meta
          name="description"
          content={`Placeholder neighborhood guide for ${guide.title}. Full local lifestyle, housing, and community insights will be added soon.`}
        />
      </Helmet>

      <h1>{guide.title}</h1>
      <Link className="guide-detail-page__back-link" to="/neighborhood-guides">
        ← Back to Neighborhood Guides
      </Link>
      <div className="guide-detail-page__body">
        <p>
          This neighborhood guide for {guide.title} is being built out and will include local lifestyle
          information, housing insights, and community details.
        </p>
        <p className="guide-detail-page__note">Full neighborhood guide content will be added later.</p>
      </div>
    </main>
  );
};
