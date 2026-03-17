import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import type { Request, Response } from 'express';

const THIS_FILE = fileURLToPath(import.meta.url);
const SERVER_DIR = path.resolve(path.dirname(THIS_FILE), '..', '..');
const REPO_ROOT = path.resolve(SERVER_DIR, '..');

const BLOG_ROOT_CANDIDATES = [
  path.join(REPO_ROOT, 'client', 'dist', 'blog'),
  path.join(REPO_ROOT, 'client', 'public', 'blog'),
];

const BLOG_CSS_CANDIDATES = [
  path.join(REPO_ROOT, 'client', 'dist', 'blog-static.css'),
  path.join(REPO_ROOT, 'client', 'public', 'blog-static.css'),
];

const isSafeSlug = (value: string): boolean => /^[a-z0-9][a-z0-9-_]*$/i.test(value);

const findFirstExistingPath = async (candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue searching.
    }
  }

  return null;
};

const sendFirstExistingFile = async (
  res: Response,
  candidates: string[],
  cacheControl: string,
): Promise<boolean> => {
  const filePath = await findFirstExistingPath(candidates);
  if (!filePath) {
    return false;
  }

  res.setHeader('Cache-Control', cacheControl);
  res.sendFile(filePath);
  return true;
};

export const staticBlogPagesRouter = Router();

staticBlogPagesRouter.get('/blog-static.css', async (_req: Request, res: Response, next) => {
  const sent = await sendFirstExistingFile(
    res,
    BLOG_CSS_CANDIDATES,
    'public, max-age=300, stale-while-revalidate=1200',
  );
  if (!sent) {
    next();
  }
});

staticBlogPagesRouter.get('/blog', async (_req: Request, res: Response, next) => {
  const candidates = BLOG_ROOT_CANDIDATES.map((root) => path.join(root, 'index.html'));
  const sent = await sendFirstExistingFile(
    res,
    candidates,
    'public, max-age=120, stale-while-revalidate=600',
  );
  if (!sent) {
    next();
  }
});

staticBlogPagesRouter.get('/blog/:slug', async (req: Request, res: Response, next) => {
  const rawSlug = req.params.slug;
  if (Array.isArray(rawSlug)) {
    next();
    return;
  }

  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    next();
    return;
  }

  if (!isSafeSlug(slug)) {
    next();
    return;
  }

  const candidates = BLOG_ROOT_CANDIDATES.map((root) => path.join(root, slug, 'index.html'));
  const sent = await sendFirstExistingFile(
    res,
    candidates,
    'public, max-age=120, stale-while-revalidate=600',
  );
  if (!sent) {
    next();
  }
});
