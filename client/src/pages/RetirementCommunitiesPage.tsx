import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { GuideCard } from '../components/GuideCard';
import '../css/NeighborhoodGuides.css';
import { RETIREMENT_COMMUNITY_CARDS } from '../lib/neighborhoodGuides';

export const RetirementCommunitiesPage = () => {
  return (
    <main className="retirement-guides-page">
      <Helmet>
        <title>Retirement Communities | West Valley Neighborhood Guides</title>
        <meta
          name="description"
          content="Browse retirement community guides across Surprise and the West Valley, including Sun City, Sun City West, PebbleCreek, and more."
        />
      </Helmet>

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
