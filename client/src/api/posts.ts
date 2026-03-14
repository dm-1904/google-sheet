import type { SeoArticle, SeoArticleIndexItem } from '../types/post';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Request failed');
  }

  return response.json() as Promise<T>;
};

type FetchOptions = {
  signal?: AbortSignal;
};

export const fetchPosts = async ({ signal }: FetchOptions = {}): Promise<SeoArticleIndexItem[]> => {
  const response = await fetch(`${API_URL}/api/posts`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ posts: SeoArticleIndexItem[] }>(response);
  return data.posts;
};

export const fetchPostBySlug = async (
  slug: string,
  { signal }: FetchOptions = {},
): Promise<SeoArticle> => {
  const response = await fetch(`${API_URL}/api/posts/${encodeURIComponent(slug)}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ post: SeoArticle }>(response);
  return data.post;
};
