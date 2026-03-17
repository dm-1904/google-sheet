import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../api/posts';
import { PostCard } from '../components/PostCard';
import { SeoHead } from '../components/SeoHead';
import '../css/BlogIndex.css';
import { formatCategoryLabel } from '../lib/category';

const ALL_FILTER = 'all';
const CITY_PARAM = 'city';
const CATEGORY_PARAM = 'category';

const formatCityLabel = (value: string): string => {
  return value
    .trim()
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const sortValues = (values: string[]): string[] => {
  return values.sort((left, right) =>
    left.localeCompare(right, undefined, {
      sensitivity: 'base',
    }),
  );
};

export const BlogIndex = () => {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: ({ signal }) => fetchPosts({ signal }),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const cities = useMemo(() => {
    if (!data) {
      return [];
    }

    return sortValues(
      Array.from(
        new Set(
          data
            .map((post) => post.primary_city?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    );
  }, [data]);

  const categories = useMemo(() => {
    if (!data) {
      return [];
    }

    return sortValues(
      Array.from(
        new Set(
          data
            .map((post) => post.category_slug?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    );
  }, [data]);

  const selectedCityFromUrl = searchParams.get(CITY_PARAM)?.trim() ?? '';
  const selectedCity =
    selectedCityFromUrl && cities.includes(selectedCityFromUrl)
      ? selectedCityFromUrl
      : ALL_FILTER;

  const selectedCategoryFromUrl = searchParams.get(CATEGORY_PARAM)?.trim() ?? '';
  const selectedCategory =
    selectedCategoryFromUrl && categories.includes(selectedCategoryFromUrl)
      ? selectedCategoryFromUrl
      : ALL_FILTER;

  const filteredPosts = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.filter((post) => {
      const cityMatches = selectedCity === ALL_FILTER || post.primary_city?.trim() === selectedCity;
      const categoryMatches =
        selectedCategory === ALL_FILTER || post.category_slug?.trim() === selectedCategory;
      return cityMatches && categoryMatches;
    });
  }, [data, selectedCategory, selectedCity]);

  const buildFilterHref = (city: string, category: string): string => {
    const nextParams = new URLSearchParams();

    if (city !== ALL_FILTER) {
      nextParams.set(CITY_PARAM, city);
    }
    if (category !== ALL_FILTER) {
      nextParams.set(CATEGORY_PARAM, category);
    }

    const query = nextParams.toString();
    return query ? `/blog?${query}` : '/blog';
  };

  if (isLoading) {
    return <p>Loading posts...</p>;
  }

  if (isError) {
    return <p>Failed to load posts: {(error as Error).message}</p>;
  }

  return (
    <main className="blog-index">
      <SeoHead
        title="Surprise & West Valley Real Estate Blog | Desert Valley Home Search"
        description="Read local real estate guides, market insights, and moving tips for Surprise Arizona and the West Valley of Phoenix."
        canonicalPath="/blog"
        noindex={selectedCity !== ALL_FILTER || selectedCategory !== ALL_FILTER}
      />

      <h1>Surprise & West Valley Real Estate Blog</h1>
      <p>Local market insights, neighborhood guides, and relocation advice for buyers and sellers in the West Valley.</p>

      <section className="blog-index__filters" aria-label="Filter posts by city and category">
        <div className="blog-index__filter-group">
          <p className="blog-index__filter-label">Filter by City:</p>
          <div className="blog-index__filter-list">
            <Link
              to={buildFilterHref(ALL_FILTER, selectedCategory)}
              replace
              className={`blog-index__filter-chip${selectedCity === ALL_FILTER ? ' is-active' : ''}`}
              aria-current={selectedCity === ALL_FILTER ? 'page' : undefined}
            >
              All
            </Link>
            {cities.map((city) => (
              <Link
                key={city}
                to={buildFilterHref(city, selectedCategory)}
                replace
                className={`blog-index__filter-chip${selectedCity === city ? ' is-active' : ''}`}
                aria-current={selectedCity === city ? 'page' : undefined}
              >
                {formatCityLabel(city)}
              </Link>
            ))}
          </div>
        </div>

        <div className="blog-index__filter-group">
          <p className="blog-index__filter-label">Filter by Category:</p>
          <div className="blog-index__filter-list">
            <Link
              to={buildFilterHref(selectedCity, ALL_FILTER)}
              replace
              className={`blog-index__filter-chip${selectedCategory === ALL_FILTER ? ' is-active' : ''}`}
              aria-current={selectedCategory === ALL_FILTER ? 'page' : undefined}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={buildFilterHref(selectedCity, category)}
                replace
                className={`blog-index__filter-chip${selectedCategory === category ? ' is-active' : ''}`}
                aria-current={selectedCategory === category ? 'page' : undefined}
              >
                {formatCategoryLabel(category)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => <PostCard key={post.slug} post={post} />)
      ) : (
        <p>
          No posts found
          {selectedCity !== ALL_FILTER ? ` in ${formatCityLabel(selectedCity)}` : ''}
          {selectedCategory !== ALL_FILTER ? ` for ${formatCategoryLabel(selectedCategory)}` : ''}.
        </p>
      )}
    </main>
  );
};
