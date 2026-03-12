import { Router } from 'express';
import type { Request, Response } from 'express';
import { getPostBySlug, getPostIndex } from '../services/sheetsCms.js';

export const postsRouter = Router();

postsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const posts = await getPostIndex();
    res.json({ posts });
  } catch (error) {
    console.error('Unable to fetch posts:', error);
    res.status(500).json({ error: 'Unable to fetch posts' });
  }
});

postsRouter.get('/:slug', async (req: Request, res: Response) => {
  const rawSlug = req.params.slug;
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
    const post = await getPostBySlug(decodedSlug);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ post });
  } catch (error) {
    console.error('Unable to fetch post:', error);
    res.status(500).json({ error: 'Unable to fetch post' });
  }
});
