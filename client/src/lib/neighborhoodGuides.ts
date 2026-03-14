export interface GuideCardData {
  title: string;
  slug: string;
  path: string;
  description: string;
  imageSrc: string;
}

export const RETIREMENT_HUB_SLUG = 'retirement-communities';

export const NEIGHBORHOOD_GUIDE_CARDS: GuideCardData[] = [
  {
    title: 'Surprise',
    slug: 'surprise',
    path: '/neighborhood-guides/surprise',
    description:
      'Explore neighborhoods, lifestyle, home types, and what it is like living in Surprise Arizona.',
    imageSrc: '/images/neighborhood-guides/surprise.jpg',
  },
  {
    title: 'Retirement Communities',
    slug: RETIREMENT_HUB_SLUG,
    path: '/neighborhood-guides/retirement-communities',
    description: 'Browse active adult and retirement community guides across the West Valley.',
    imageSrc: '/images/neighborhood-guides/retirement-communities.jpg',
  },
  {
    title: 'Glendale',
    slug: 'glendale',
    path: '/neighborhood-guides/glendale',
    description: 'Discover neighborhoods, amenities, and housing options in Glendale Arizona.',
    imageSrc: '/images/neighborhood-guides/glendale.jpg',
  },
  {
    title: 'Peoria',
    slug: 'peoria',
    path: '/neighborhood-guides/peoria',
    description: 'Learn about Peoria neighborhoods, local lifestyle, and homes for sale in the area.',
    imageSrc: '/images/neighborhood-guides/peoria.jpg',
  },
  {
    title: 'Goodyear',
    slug: 'goodyear',
    path: '/neighborhood-guides/goodyear',
    description: 'Explore Goodyear communities, growth, and popular places to live.',
    imageSrc: '/images/neighborhood-guides/goodyear.jpg',
  },
  {
    title: 'Buckeye',
    slug: 'buckeye',
    path: '/neighborhood-guides/buckeye',
    description: 'View Buckeye neighborhood information, new developments, and housing options.',
    imageSrc: '/images/neighborhood-guides/buckeye.jpg',
  },
];

export const CITY_NEIGHBORHOOD_GUIDE_CARDS = NEIGHBORHOOD_GUIDE_CARDS.filter(
  (guide) => guide.slug !== RETIREMENT_HUB_SLUG,
);

const cityNeighborhoodGuideMap = new Map(
  CITY_NEIGHBORHOOD_GUIDE_CARDS.map((guide) => [guide.slug, guide]),
);

export const getCityNeighborhoodGuideBySlug = (slug?: string): GuideCardData | undefined => {
  if (!slug) {
    return undefined;
  }
  return cityNeighborhoodGuideMap.get(slug);
};

export const RETIREMENT_COMMUNITY_CARDS: GuideCardData[] = [
  {
    title: 'Sun City',
    slug: 'sun-city',
    path: '/neighborhood-guides/retirement-communities/sun-city',
    description: "Explore one of Arizona's best-known active adult communities.",
    imageSrc: '/images/retirement-communities/sun-city.jpg',
  },
  {
    title: 'Sun City West',
    slug: 'sun-city-west',
    path: '/neighborhood-guides/retirement-communities/sun-city-west',
    description: 'Discover amenities, lifestyle, and homes in Sun City West.',
    imageSrc: '/images/retirement-communities/sun-city-west.jpg',
  },
  {
    title: 'Sun City Grand',
    slug: 'sun-city-grand',
    path: '/neighborhood-guides/retirement-communities/sun-city-grand',
    description: 'Browse guide content for this popular Surprise-area active adult community.',
    imageSrc: '/images/retirement-communities/sun-city-grand.jpg',
  },
  {
    title: 'PebbleCreek',
    slug: 'pebblecreek',
    path: '/neighborhood-guides/retirement-communities/pebblecreek',
    description: 'Learn about PebbleCreek living, amenities, and home styles.',
    imageSrc: '/images/retirement-communities/pebblecreek.jpg',
  },
  {
    title: 'Trilogy at Vistancia',
    slug: 'trilogy-at-vistancia',
    path: '/neighborhood-guides/retirement-communities/trilogy-at-vistancia',
    description: 'Explore this Peoria active adult community and its lifestyle offerings.',
    imageSrc: '/images/retirement-communities/trilogy-at-vistancia.jpg',
  },
  {
    title: 'Victory at Verrado',
    slug: 'victory-at-verrado',
    path: '/neighborhood-guides/retirement-communities/victory-at-verrado',
    description: 'See what makes Victory at Verrado unique for active adult buyers.',
    imageSrc: '/images/retirement-communities/victory-at-verrado.jpg',
  },
  {
    title: 'Corte Bella',
    slug: 'corte-bella',
    path: '/neighborhood-guides/retirement-communities/corte-bella',
    description: 'Browse this gated active adult community in the West Valley.',
    imageSrc: '/images/retirement-communities/corte-bella.jpg',
  },
  {
    title: 'Arizona Traditions',
    slug: 'arizona-traditions',
    path: '/neighborhood-guides/retirement-communities/arizona-traditions',
    description: 'Explore homes and amenities in Arizona Traditions.',
    imageSrc: '/images/retirement-communities/arizona-traditions.jpg',
  },
  {
    title: 'Sun City Festival',
    slug: 'sun-city-festival',
    path: '/neighborhood-guides/retirement-communities/sun-city-festival',
    description: 'Learn about this Buckeye-area active adult community.',
    imageSrc: '/images/retirement-communities/sun-city-festival.jpg',
  },
  {
    title: 'Ventana Lakes',
    slug: 'ventana-lakes',
    path: '/neighborhood-guides/retirement-communities/ventana-lakes',
    description: 'Discover lake-centered active adult living in Ventana Lakes.',
    imageSrc: '/images/retirement-communities/ventana-lakes.jpg',
  },
  {
    title: 'CantaMia at Estrella',
    slug: 'cantamia-at-estrella',
    path: '/neighborhood-guides/retirement-communities/cantamia-at-estrella',
    description: 'Explore this Goodyear active adult community within Estrella.',
    imageSrc: '/images/retirement-communities/cantamia-at-estrella.jpg',
  },
  {
    title: 'Sundance Active Adult',
    slug: 'sundance-active-adult',
    path: '/neighborhood-guides/retirement-communities/sundance-active-adult',
    description: 'Browse guide content for Sundance Active Adult in Buckeye.',
    imageSrc: '/images/retirement-communities/sundance-active-adult.jpg',
  },
];

const retirementCommunityMap = new Map(RETIREMENT_COMMUNITY_CARDS.map((guide) => [guide.slug, guide]));

export const getRetirementCommunityBySlug = (slug?: string): GuideCardData | undefined => {
  if (!slug) {
    return undefined;
  }
  return retirementCommunityMap.get(slug);
};
