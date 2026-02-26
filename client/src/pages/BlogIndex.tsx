import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/posts';
import { PostCard } from '../components/PostCard';
import type { Post } from '../types/post';

export const BlogIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  if (isLoading) {
    return <p>Loading posts...</p>;
  }

  if (isError) {
    return <p>Failed to load posts: {(error as Error).message}</p>;
  }

  return (
    <main>
      <h1>SEO Blog Posts</h1>
      <p>Content is fetched from a Google Sheet via the API server.</p>
      {data && data.length > 0 ? (
        data.map((post: Post) => (
          <PostCard key={post.slug} post={post} />
        ))
      ) : (
        <p>No posts found.</p>
      )}
    </main>
  );
};
