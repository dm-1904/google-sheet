import { Router } from 'express';
import type { Request, Response } from 'express';
import { invalidatePostsCache } from '../services/sheetsCms.js';
import { generateStaticBlogPages } from '../services/staticBlogGenerator.js';

export const staticBlogRouter = Router();

const isAuthorized = (req: Request): boolean => {
  const configuredSecret = (process.env.BLOG_REVALIDATE_SECRET ?? '').trim();
  if (!configuredSecret) {
    return true;
  }

  const headerSecret = String(req.headers['x-revalidate-secret'] ?? '').trim();
  const querySecret = String(req.query.secret ?? '').trim();
  return headerSecret === configuredSecret || querySecret === configuredSecret;
};

const triggerDeployWebhookIfConfigured = async (): Promise<boolean> => {
  const deployHookUrl = (process.env.DEPLOY_BUILD_HOOK_URL ?? '').trim();
  if (!deployHookUrl) {
    return false;
  }

  const response = await fetch(deployHookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ source: 'google-sheets-static-blog-revalidate' }),
  });

  if (!response.ok) {
    throw new Error(`Deploy webhook failed with status ${response.status}`);
  }

  return true;
};

staticBlogRouter.post('/blog/revalidate', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    invalidatePostsCache();
    const generation = await generateStaticBlogPages();
    const deployWebhookTriggered = await triggerDeployWebhookIfConfigured();

    res.json({
      ok: true,
      generated: generation,
      deployWebhookTriggered,
    });
  } catch (error) {
    console.error('Unable to revalidate static blog pages:', error);
    res.status(500).json({ error: 'Unable to revalidate static blog pages' });
  }
});
