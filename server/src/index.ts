import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { postsRouter } from './routes/posts.js';

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

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api/posts', postsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
