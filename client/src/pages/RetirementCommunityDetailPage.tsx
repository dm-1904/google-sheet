import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import '../css/NeighborhoodGuides.css';
import { getRetirementCommunityBySlug } from '../lib/neighborhoodGuides';

export const RetirementCommunityDetailPage = () => {
  const { communitySlug } = useParams();
  const community = getRetirementCommunityBySlug(communitySlug);

  if (!community) {
    return (
      <main className="guide-detail-page">
        <h1>Retirement Community Guide Not Found</h1>
        <p>That retirement community guide route does not exist yet.</p>
        <Link className="guide-detail-page__back-link" to="/neighborhood-guides/retirement-communities">
          ← Back to Retirement Communities
        </Link>
      </main>
    );
  }

  return (
    <main className="guide-detail-page">
      <Helmet>
        <title>{community.title} Guide | Retirement Communities</title>
        <meta
          name="description"
          content={`Placeholder retirement community guide for ${community.title}. Full amenities, housing, and local market insights will be added soon.`}
        />
      </Helmet>

      <h1>{community.title}</h1>
      <div className="guide-detail-page__body">
        <p>
          This retirement community guide for {community.title} is being built out and will later include
          lifestyle details, amenities, housing insights, and local market information.
        </p>
        <p className="guide-detail-page__note">Full retirement community guide content will be added later.</p>
      </div>
      <Link className="guide-detail-page__back-link" to="/neighborhood-guides/retirement-communities">
        ← Back to Retirement Communities
      </Link>
    </main>
  );
};
