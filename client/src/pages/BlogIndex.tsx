<<<<<<< ours
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";

export const BlogIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
=======
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/posts';
import { PostCard } from '../components/PostCard';

export const BlogIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
>>>>>>> theirs
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
<<<<<<< ours
      {data && data.length > 0 ? (
        data.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
          />
        ))
      ) : (
        <p>No posts found.</p>
      )}
=======
      {data && data.length > 0 ? data.map((post) => <PostCard key={post.slug} post={post} />) : <p>No posts found.</p>}
>>>>>>> theirs
    </main>
  );
};
