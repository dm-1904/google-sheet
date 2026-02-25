import type { Post } from "../types/post";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
};

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_URL}/api/posts`);
  const data = await handleResponse<{ posts: Post[] }>(response);
  return data.posts;
};

export const fetchPostBySlug = async (slug: string): Promise<Post> => {
  const response = await fetch(`${API_URL}/api/posts/${slug}`);
  const data = await handleResponse<{ post: Post }>(response);
  return data.post;
};
