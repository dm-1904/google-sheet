import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';
import { postsRouter } from './routes/posts.js';
import { seoRouter } from './routes/seo.js';
import { staticBlogRouter } from './routes/staticBlog.js';
import { staticBlogPagesRouter } from './routes/staticBlogPages.js';

dotenv.config();

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error('SERVER_PORT must be an integer between 1 and 65535');
  }
  return parsed;
};

const app = express();
const port = parsePort(process.env.SERVER_PORT, 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const shouldServeStaticBlogPages = (process.env.SERVE_STATIC_BLOG_PAGES ?? '1').trim() !== '0';
const thisFile = fileURLToPath(import.meta.url);
const serverDir = path.resolve(path.dirname(thisFile), '..');
const repoRoot = path.resolve(serverDir, '..');
const clientDistDir = path.join(repoRoot, 'client', 'dist');
const clientPublicDir = path.join(repoRoot, 'client', 'public');

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api/posts', postsRouter);
app.use('/api', seoRouter);
app.use('/api', staticBlogRouter);

if (shouldServeStaticBlogPages) {
  app.use(staticBlogPagesRouter);
  app.use(express.static(clientDistDir, { index: false }));
  app.use(express.static(clientPublicDir, { index: false }));
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
