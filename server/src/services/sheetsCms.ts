import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';
import type { Post } from '../types/post.js';
import { REQUIRED_HEADERS } from '../types/post.js';

const CACHE_TTL_MS = 45_000;

type CacheState = {
  posts: Post[];
  expiresAt: number;
};

const cache: CacheState = {
  posts: [],
  expiresAt: 0,
};

const normalizeDate = (value: string): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
};

const sanitizeTrustedHtml = (value: string): string => {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|link|meta)[^>]*?>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])javascript:[^'"]*\2/gi, ' $1="#"');
};

const validateHeaders = (headers: string[]): void => {
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required sheet headers: ${missingHeaders.join(', ')}`);
  }
};

const toPost = (headers: string[], row: string[]): Post => {
  const mapped = headers.reduce<Record<string, string>>((acc, header, index) => {
    acc[header] = row[index] ?? '';
    return acc;
  }, {});

  return {
    slug: mapped.slug ?? '',
    title: mapped.title ?? '',
    metaDescription: mapped.metaDescription ?? '',
    heroImageUrl: mapped.heroImageUrl ?? '',
    heroImageAlt: mapped.heroImageAlt ?? '',
    category: mapped.category ?? '',
    tags: mapped.tags ?? '',
    publishedAt: normalizeDate(mapped.publishedAt ?? ''),
    author: mapped.author ?? '',
    contentHtml: sanitizeTrustedHtml(mapped.contentHtml ?? ''),
  };
};

const comparePublishedAtDesc = (a: Post, b: Post): number => {
  const first = new Date(a.publishedAt).getTime();
  const second = new Date(b.publishedAt).getTime();
  return (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first);
};

const dedupePostsBySlug = (posts: Post[]): Post[] => {
  const seenSlugs = new Set<string>();
  const uniquePosts: Post[] = [];

  for (const post of posts) {
    if (seenSlugs.has(post.slug)) {
      console.warn(`Duplicate slug "${post.slug}" found in sheet. Keeping latest row only.`);
      continue;
    }

    seenSlugs.add(post.slug);
    uniquePosts.push(post);
  }

  return uniquePosts;
};

const parseInlineServiceAccount = (): Record<string, unknown> | undefined => {
  const rawServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawServiceAccount) {
    return undefined;
  }

  try {
    return JSON.parse(rawServiceAccount) as Record<string, unknown>;
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY must be valid JSON');
  }
};

const getSheetsClient = (): sheets_v4.Sheets => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: parseInlineServiceAccount(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
};

const fetchPostsFromSheet = async (): Promise<Post[]> => {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME ?? 'Posts';

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID is required');
  }

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:ZZ`,
  });

  const values = (response.data.values ?? []) as unknown[][];
  if (values.length === 0) {
    return [];
  }

  const [headerRow, ...rows] = values;
  const headers = headerRow.map((header: unknown) => String(header).trim().replace(/^\uFEFF/, ''));
  validateHeaders(headers);

  return dedupePostsBySlug(
    rows
      .map((row: unknown[]) => toPost(headers, row.map((cell: unknown) => String(cell ?? ''))))
      .filter((post) => post.slug && post.title)
      .sort(comparePublishedAtDesc),
  );
};

export const getAllPosts = async (): Promise<Post[]> => {
  const now = Date.now();
  if (cache.expiresAt > now) {
    return cache.posts;
  }

  const posts = await fetchPostsFromSheet();
  cache.posts = posts;
  cache.expiresAt = now + CACHE_TTL_MS;
  return posts;
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};
