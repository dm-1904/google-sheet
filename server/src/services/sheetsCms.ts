import { fetchSheetValues } from '../lib/googleSheets.js';
import type { SeoArticle, SeoArticleIndexItem } from '../types/post.js';
import { mapSheetValuesToSeoArticleIndexItems, mapSheetValuesToSeoArticles } from './contentMapper.js';

const DEFAULT_CACHE_TTL_MS = 180_000;

const parseCacheTtlMs = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_CACHE_TTL_MS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 5_000) {
    return DEFAULT_CACHE_TTL_MS;
  }

  return Math.floor(parsed);
};

const CACHE_TTL_MS = parseCacheTtlMs(process.env.POSTS_CACHE_TTL_MS);

type CacheState = {
  values: string[][];
  posts: SeoArticle[];
  index: SeoArticleIndexItem[];
  expiresAt: number;
};

const cache: CacheState = {
  values: [],
  posts: [],
  index: [],
  expiresAt: 0,
};

let inFlightFetch: Promise<string[][]> | null = null;

const getSheetValues = async (): Promise<string[][]> => {
  const now = Date.now();
  if (cache.expiresAt > now && cache.values.length > 0) {
    return cache.values;
  }

  if (inFlightFetch) {
    return inFlightFetch;
  }

  inFlightFetch = fetchSheetValues();
  try {
    const values = await inFlightFetch;
    cache.values = values;
    cache.posts = [];
    cache.index = [];
    cache.expiresAt = Date.now() + CACHE_TTL_MS;
    return values;
  } finally {
    inFlightFetch = null;
  }
};

export const getAllPosts = async (): Promise<SeoArticle[]> => {
  if (cache.posts.length > 0 && cache.expiresAt > Date.now()) {
    return cache.posts;
  }

  const values = await getSheetValues();
  const posts = mapSheetValuesToSeoArticles(values);
  cache.posts = posts;
  return posts;
};

export const getPostIndex = async (): Promise<SeoArticleIndexItem[]> => {
  if (cache.index.length > 0 && cache.expiresAt > Date.now()) {
    return cache.index;
  }

  const values = await getSheetValues();
  cache.index = mapSheetValuesToSeoArticleIndexItems(values);
  return cache.index;
};

export const getPostBySlug = async (slug: string): Promise<SeoArticle | null> => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};
