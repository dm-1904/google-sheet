import { SeoHead } from '../components/SeoHead';
import { GuideCard } from '../components/GuideCard';
import '../css/NeighborhoodGuides.css';
import { buildBreadcrumbListSchema } from '../lib/seo';
import { NEIGHBORHOOD_GUIDE_CARDS } from '../lib/neighborhoodGuides';

export const NeighborhoodGuidesPage = () => {
  const schema = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: 'Neighborhood Guides', url: '/neighborhood-guides' },
    ]),
  ];

  return (
    <main className="guides-page">
      <SeoHead
        title="Neighborhood Guides | Surprise & West Valley Arizona"
        description="Explore neighborhood and community guides across Surprise and the West Valley, including city overviews and retirement community hubs."
        canonicalPath="/neighborhood-guides"
        structuredData={schema}
      />

      <section className="guides-page__hero">
        <h1>Neighborhood Guides</h1>
        <p className="guides-page__intro">
          Explore neighborhood and community guides across Surprise and the West Valley. Whether you are
          searching for family-friendly neighborhoods, established communities, or active adult living,
          this page is designed to help you quickly explore the areas buyers ask about most.
        </p>
      </section>

      <section className="guides-grid" aria-label="Neighborhood guide cards">
        {NEIGHBORHOOD_GUIDE_CARDS.map((guide) => (
          <GuideCard
            key={guide.slug}
            title={guide.title}
            description={guide.description}
            imageSrc={guide.imageSrc}
            to={guide.path}
          />
        ))}
      </section>
    </main>
  );
};
