<<<<<<< ours
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import type { Post } from "../types/post.js";
=======
import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';
import type { Post } from '../types/post.js';
>>>>>>> theirs

const CACHE_TTL_MS = 45_000;

type CacheState = {
  posts: Post[];
  expiresAt: number;
};

const cache: CacheState = {
  posts: [],
<<<<<<< ours
  expiresAt: 0,
=======
  expiresAt: 0
>>>>>>> theirs
};

const normalizeDate = (value: string): string => {
  if (!value) {
<<<<<<< ours
    return "";
=======
    return '';
>>>>>>> theirs
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
};

const toPost = (headers: string[], row: string[]): Post => {
<<<<<<< ours
  const mapped = headers.reduce<Record<string, string>>(
    (acc, header, index) => {
      acc[header] = row[index] ?? "";
      return acc;
    },
    {},
  );

  return {
    slug: mapped.slug ?? "",
    title: mapped.title ?? "",
    metaDescription: mapped.metaDescription ?? "",
    heroImageUrl: mapped.heroImageUrl ?? "",
    heroImageAlt: mapped.heroImageAlt ?? "",
    category: mapped.category ?? "",
    tags: mapped.tags ?? "",
    publishedAt: normalizeDate(mapped.publishedAt ?? ""),
    author: mapped.author ?? "",
    contentHtml: mapped.contentHtml ?? "",
=======
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
    contentHtml: mapped.contentHtml ?? ''
>>>>>>> theirs
  };
};

const comparePublishedAtDesc = (a: Post, b: Post): number => {
  const first = new Date(a.publishedAt).getTime();
  const second = new Date(b.publishedAt).getTime();
<<<<<<< ours
  return (
    (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first)
  );
=======
  return (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first);
>>>>>>> theirs
};

const getSheetsClient = (): sheets_v4.Sheets => {
  const rawServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const auth = new google.auth.GoogleAuth({
    credentials: rawServiceAccount ? JSON.parse(rawServiceAccount) : undefined,
<<<<<<< ours
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
=======
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  return google.sheets({ version: 'v4', auth });
>>>>>>> theirs
};

const fetchPostsFromSheet = async (): Promise<Post[]> => {
  const spreadsheetId = process.env.SPREADSHEET_ID;
<<<<<<< ours
  const sheetName = process.env.SHEET_NAME ?? "Posts";

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is required");
=======
  const sheetName = process.env.SHEET_NAME ?? 'Posts';

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID is required');
>>>>>>> theirs
  }

  const sheets = getSheetsClient();
  const range = `${sheetName}!A:J`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
<<<<<<< ours
    range,
=======
    range
>>>>>>> theirs
  });

  const values = response.data.values ?? [];
  if (values.length === 0) {
    return [];
  }

  const [headerRow, ...rows] = values;
  const headers = headerRow.map((header) => String(header).trim());

  return rows
<<<<<<< ours
    .map((row) =>
      toPost(
        headers,
        row.map((cell) => String(cell ?? "")),
      ),
    )
=======
    .map((row) => toPost(headers, row.map((cell) => String(cell ?? ''))))
>>>>>>> theirs
    .filter((post) => post.slug && post.title)
    .sort(comparePublishedAtDesc);
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
