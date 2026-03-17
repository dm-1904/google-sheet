import { Link, useParams } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import '../css/NeighborhoodGuides.css';
import { buildBreadcrumbListSchema } from '../lib/seo';
import { getRetirementCommunityBySlug } from '../lib/neighborhoodGuides';

export const RetirementCommunityDetailPage = () => {
  const { communitySlug } = useParams();
  const community = getRetirementCommunityBySlug(communitySlug);

  if (!community) {
    return (
      <main className="guide-detail-page">
        <SeoHead
          title="Retirement Community Guide Not Found"
          description="The retirement community guide you requested could not be found."
          canonicalPath="/neighborhood-guides/retirement-communities"
          noindex
        />
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
      <SeoHead
        title={`${community.title} Guide | Retirement Communities`}
        description={`Placeholder retirement community guide for ${community.title}. Full amenities, housing, and local market insights will be added soon.`}
        canonicalPath={community.path}
        noindex
        structuredData={[
          buildBreadcrumbListSchema([
            { name: 'Home', url: '/' },
            { name: 'Neighborhood Guides', url: '/neighborhood-guides' },
            {
              name: 'Retirement Communities',
              url: '/neighborhood-guides/retirement-communities',
            },
            { name: community.title, url: community.path },
          ]),
        ]}
      />

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
