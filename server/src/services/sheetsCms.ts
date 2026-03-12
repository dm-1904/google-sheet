import { fetchSheetValues } from '../lib/googleSheets.js';
import type { SeoArticle, SeoArticleIndexItem } from '../types/post.js';
import { mapSheetValuesToSeoArticles, toSeoArticleIndexItem } from './contentMapper.js';

const CACHE_TTL_MS = 45_000;

type CacheState = {
  posts: SeoArticle[];
  expiresAt: number;
};

const cache: CacheState = {
  posts: [],
  expiresAt: 0,
};

const fetchPostsFromSheet = async (): Promise<SeoArticle[]> => {
  const values = await fetchSheetValues();
  return mapSheetValuesToSeoArticles(values);
};

export const getAllPosts = async (): Promise<SeoArticle[]> => {
  const now = Date.now();
  if (cache.expiresAt > now) {
    return cache.posts;
  }

  const posts = await fetchPostsFromSheet();
  cache.posts = posts;
  cache.expiresAt = now + CACHE_TTL_MS;
  return posts;
};

export const getPostIndex = async (): Promise<SeoArticleIndexItem[]> => {
  const posts = await getAllPosts();
  return posts.map(toSeoArticleIndexItem);
};

export const getPostBySlug = async (slug: string): Promise<SeoArticle | null> => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};
