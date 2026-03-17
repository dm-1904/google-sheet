import { SeoHead } from '../components/SeoHead';
import '../css/AboutPage.css';
import { buildBreadcrumbListSchema, buildRealEstateAgentSchema } from '../lib/seo';

export const AboutPage = () => {
  const schema = [
    buildBreadcrumbListSchema([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ]),
    buildRealEstateAgentSchema(),
  ].filter((value): value is Record<string, unknown> => Boolean(value));

  return (
    <main className="about-page">
      <SeoHead
        title="About Damon Ryon | Surprise AZ Real Estate Agent"
        description="Learn more about Damon Ryon, a real estate agent helping buyers and sellers in Surprise Arizona and the West Valley of Phoenix."
        canonicalPath="/about"
        structuredData={schema}
      />

      <h1>About Damon Ryon | Surprise AZ Real Estate</h1>

      <section className="about-page__section">
        <h2>Meet Damon Ryon</h2>
        <p>
          Hi, I&apos;m Damon Ryon, a full-time real estate agent serving
          Surprise, Arizona and the surrounding West Valley communities of the
          Phoenix metro area.
        </p>
        <p>
          I became a full-time agent in 2020, which in hindsight was a pretty
          unusual time to start a real estate career. Interest rates were at
          historic lows, the housing market was moving incredibly fast, and the
          entire real estate landscape seemed to change week by week.
        </p>
        <p>
          Starting in that environment forced me to learn quickly and adapt to
          rapidly changing market conditions. It gave me valuable experience
          helping both buyers and sellers navigate a market that didn&apos;t
          always behave the way people expected.
        </p>
        <p>
          Today I help clients buy and sell homes throughout Surprise and the
          surrounding West Valley cities, including Sun City West, Sun City,
          Peoria, Goodyear, and nearby communities. Whether someone is
          relocating to Arizona, moving within the Valley, purchasing their
          first home, or preparing to sell their current property, my goal is to
          make the process as smooth and straightforward as possible.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Why I Built This Website</h2>
        <p>
          I created this website to give people honest, useful information about
          buying and selling homes in Surprise Arizona and the surrounding West
          Valley communities.
        </p>
        <p>
          Many buyers start their home search online, and a lot of the
          information available is either outdated or overly complicated. My
          goal with this site is to provide clear guides about the local real
          estate market, neighborhoods, and what it&apos;s actually like to live
          in cities across the West Valley such as Surprise, Peoria, Sun City,
          Sun City West, and Goodyear.
        </p>
        <p>If you&apos;re researching things like:</p>
        <ul>
          <li>homes for sale in Surprise AZ</li>
          <li>the best neighborhoods in Surprise</li>
          <li>the cost of living in Surprise Arizona</li>
          <li>homes for sale in Peoria AZ or Goodyear</li>
          <li>or what it&apos;s like moving to the Phoenix area</li>
        </ul>
        <p>
          this website is designed to help answer those questions and provide
          helpful insights about living and buying real estate throughout the
          West Valley of Phoenix.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Local Knowledge of Surprise and the West Valley of Phoenix</h2>
        <p>
          While I help buyers and sellers throughout the West Valley and the
          greater Phoenix metro area, Surprise is the community I call home.
        </p>
        <p>
          Because I live here, I spend a lot of time exploring the city and the
          surrounding areas, paying attention to how different neighborhoods are
          developing and how the local housing market is changing.
        </p>
        <p>
          Surprise has become one of the fastest-growing cities in Arizona, and
          for good reason. The city offers newer homes, master-planned
          communities, golf courses, and convenient access to the rest of the
          Phoenix metro area.
        </p>
        <p>
          From communities like Sterling Grove and Marley Park to active adult
          communities like Sun City Grand, Surprise offers a wide variety of
          housing options depending on lifestyle and budget.
        </p>
        <p>
          Living here also means I&apos;m very familiar with nearby cities like
          Peoria, Sun City, Sun City West, and other West Valley communities
          that many buyers consider when relocating to this part of Arizona.
        </p>
        <p>
          Because I live and work in this area, I spend a lot of time studying
          the local market, visiting neighborhoods, and staying up to date on
          new developments so I can give clients accurate and practical guidance
          when they&apos;re deciding where to live.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Who I Help</h2>
        <p>
          I work with a variety of buyers and sellers throughout the West
          Valley, including:
        </p>
        <ul>
          <li>First-time home buyers</li>
          <li>Families relocating to Arizona</li>
          <li>Buyers searching for homes in Surprise AZ</li>
          <li>Sellers preparing to list their home in the West Valley</li>
        </ul>
        <p>
          Whether you&apos;re moving across town or across the country, my goal
          is to make the process as straightforward and stress-free as possible.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Why Work With Me</h2>
        <p>
          Buying or selling a home is a major decision, and having the right
          guidance can make a big difference.
        </p>
        <p>
          My approach is simple: clear communication, honest advice, and strong
          local knowledge of the local real estate market.
        </p>
        <p>
          I focus on helping clients understand the process, evaluate their
          options, and make confident decisions when it comes to buying or
          selling property.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Life Outside Real Estate</h2>
        <p>
          Outside of real estate, I enjoy spending time on the golf course and
          getting out to the rifle range.
        </p>
        <p>
          I also served in the United States Marine Corps, an experience that
          taught me discipline, problem solving, and the importance of staying
          calm under pressure &mdash; skills that turn out to be surprisingly
          useful in real estate negotiations as well.
        </p>
        <p>
          Arizona is an incredible place to live, and I enjoy exploring the West
          Valley and seeing how the area continues to grow and evolve.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Thinking About Buying a Home in Surprise?</h2>
        <p>
          If you&apos;re considering moving to Surprise Arizona or are searching
          for homes for sale in the West Valley, I&apos;d be happy to help.
        </p>
        <p>
          Feel free to explore the guides and articles on this website or reach
          out directly if you have questions about the local real estate market.
        </p>
      </section>
    </main>
  );
};
