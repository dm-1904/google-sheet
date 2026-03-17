import { Link } from 'react-router-dom';
import { GuideCard } from '../components/GuideCard';
import { SeoHead } from '../components/SeoHead';
import '../css/NeighborhoodGuides.css';
import { buildBreadcrumbListSchema } from '../lib/seo';
import { RETIREMENT_COMMUNITY_CARDS } from '../lib/neighborhoodGuides';

export const RetirementCommunitiesPage = () => {
  const schema = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: 'Neighborhood Guides', url: '/neighborhood-guides' },
      { name: 'Retirement Communities', url: '/neighborhood-guides/retirement-communities' },
    ]),
  ];

  return (
    <main className="retirement-guides-page">
      <SeoHead
        title="Retirement Communities | West Valley Neighborhood Guides"
        description="Browse retirement community guides across Surprise and the West Valley, including Sun City, Sun City West, PebbleCreek, and more."
        canonicalPath="/neighborhood-guides/retirement-communities"
        structuredData={schema}
      />

      <h1>Retirement Communities</h1>
      <Link className="guide-detail-page__back-link" to="/neighborhood-guides">
        ← Back to Neighborhood Guides
      </Link>
      <p className="retirement-guides-page__intro">
        Explore active adult and retirement communities across Surprise and the West Valley. Each guide is
        organized as a placeholder destination so you can quickly drill into the communities buyers ask
        about most.
      </p>

      <section className="guides-grid" aria-label="Retirement community guide cards">
        {RETIREMENT_COMMUNITY_CARDS.map((community) => (
          <GuideCard
            key={community.slug}
            title={community.title}
            description={community.description}
            imageSrc={community.imageSrc}
            to={community.path}
          />
        ))}
      </section>
    </main>
  );
};
