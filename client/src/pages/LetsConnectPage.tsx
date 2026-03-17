import { SeoHead } from '../components/SeoHead';
import { buildBreadcrumbListSchema, buildRealEstateAgentSchema } from '../lib/seo';

export const LetsConnectPage = () => {
  const schema = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: "Let's Connect", url: '/lets-connect' },
    ]),
    buildRealEstateAgentSchema(),
  ].filter((value): value is Record<string, unknown> => Boolean(value));

  return (
    <main>
      <SeoHead
        title="Let's Connect | Surprise AZ Real Estate"
        description="Connect with Damon Ryon for guidance on buying or selling real estate in Surprise Arizona and the West Valley."
        canonicalPath="/lets-connect"
        noindex
        structuredData={schema}
      />
      <h1>Let's Connect</h1>
      <p>This is a placeholder page.</p>
    </main>
  );
};
