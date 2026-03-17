import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../api/posts';
import { PostCard } from '../components/PostCard';
import { SeoHead } from '../components/SeoHead';
import '../css/BlogIndex.css';
import { formatCategoryLabel } from '../lib/category';

const ALL_FILTER = 'all';

export const BlogIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: ({ signal }) => fetchPosts({ signal }),
  });

  const categories = useMemo(() => {
    if (!data) {
      return [];
    }

    return Array.from(
      new Set(
        data
          .map((post) => post.category_slug?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [data]);

  const selectedCategoryFromUrl = searchParams.get('category')?.trim() ?? '';
  const selectedCategory =
    selectedCategoryFromUrl && categories.includes(selectedCategoryFromUrl)
      ? selectedCategoryFromUrl
      : ALL_FILTER;

  const filteredPosts = useMemo(() => {
    if (!data) {
      return [];
    }

    if (selectedCategory === ALL_FILTER) {
      return data;
    }

    return data.filter((post) => post.category_slug?.trim() === selectedCategory);
  }, [data, selectedCategory]);

  const handleCategoryChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === ALL_FILTER) {
      nextParams.delete('category');
    } else {
      nextParams.set('category', value);
    }
    setSearchParams(nextParams, { replace: true });
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
        noindex={selectedCategory !== ALL_FILTER}
      />

      <h1>Surprise & West Valley Real Estate Blog</h1>
      <p>Local market insights, neighborhood guides, and relocation advice for buyers and sellers in the West Valley.</p>

      <section className="blog-index__filters" aria-label="Filter posts by category">
        <p className="blog-index__filter-label">Filter by Category:</p>
        <div className="blog-index__filter-list">
          <button
            type="button"
            onClick={() => handleCategoryChange(ALL_FILTER)}
            className={`blog-index__filter-chip${selectedCategory === ALL_FILTER ? ' is-active' : ''}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`blog-index__filter-chip${selectedCategory === category ? ' is-active' : ''}`}
            >
              {formatCategoryLabel(category)}
            </button>
          ))}
        </div>
      </section>

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => <PostCard key={post.slug} post={post} />)
      ) : (
        <p>No posts found for this category.</p>
      )}
    </main>
  );
};
