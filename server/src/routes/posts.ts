import { Router } from 'express';
import type { Request, Response } from 'express';
import { getPostBySlug, getPostIndex } from '../services/sheetsCms.js';

export const postsRouter = Router();

const shouldForceRefresh = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some((entry) => shouldForceRefresh(entry));
  }

  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

postsRouter.get('/', async (_req: Request, res: Response) => {
  const forceRefresh = shouldForceRefresh(_req.query.fresh);
  try {
    const posts = await getPostIndex(forceRefresh);
    res.setHeader(
      'Cache-Control',
      forceRefresh ? 'no-store' : 'public, max-age=30, stale-while-revalidate=120',
    );
    res.setHeader('Vary', 'Origin');
    res.json({ posts });
  } catch (error) {
    console.error('Unable to fetch posts:', error);
    res.status(500).json({ error: 'Unable to fetch posts' });
  }
});

postsRouter.get('/:slug', async (req: Request, res: Response) => {
  const rawSlug = req.params.slug;
  const forceRefresh = shouldForceRefresh(req.query.fresh);
  if (Array.isArray(rawSlug)) {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }

  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }

  try {
    const post = await getPostBySlug(decodedSlug, forceRefresh);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.setHeader(
      'Cache-Control',
      forceRefresh ? 'no-store' : 'public, max-age=60, stale-while-revalidate=300',
    );
    res.setHeader('Vary', 'Origin');
    res.json({ post });
  } catch (error) {
    console.error('Unable to fetch post:', error);
    res.status(500).json({ error: 'Unable to fetch post' });
  }
});
