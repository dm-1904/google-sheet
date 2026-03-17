import { Router } from 'express';
import type { Request, Response } from 'express';
import { invalidatePostsCache } from '../services/sheetsCms.js';
import { generateStaticBlogPages } from '../services/staticBlogGenerator.js';

export const staticBlogRouter = Router();

const isProduction = (): boolean => process.env.NODE_ENV === 'production';

const getConfiguredSecret = (): string => (process.env.BLOG_REVALIDATE_SECRET ?? '').trim();

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const shouldRequireSecret = (): boolean => {
  return parseBoolean(process.env.BLOG_REVALIDATE_REQUIRE_SECRET, isProduction());
};

const isSkipStaticGenerationEnabled = (): boolean => {
  return parseBoolean(process.env.SKIP_STATIC_BLOG_GENERATION, false);
};

const isAuthorized = (req: Request): boolean => {
  const configuredSecret = getConfiguredSecret();
  if (!configuredSecret) {
    return !shouldRequireSecret();
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

staticBlogRouter.get('/blog/revalidate/status', (_req: Request, res: Response) => {
  const configuredSecret = getConfiguredSecret();
  const deployHookUrl = (process.env.DEPLOY_BUILD_HOOK_URL ?? '').trim();

  res.json({
    ok: true,
    environment: process.env.NODE_ENV ?? 'development',
    requiresSecret: shouldRequireSecret(),
    secretConfigured: Boolean(configuredSecret),
    deployHookConfigured: Boolean(deployHookUrl),
    skipStaticGenerationEnabled: isSkipStaticGenerationEnabled(),
  });
});

staticBlogRouter.post('/blog/revalidate', async (req: Request, res: Response) => {
  if (isProduction() && isSkipStaticGenerationEnabled()) {
    res.status(503).json({
      error: 'SKIP_STATIC_BLOG_GENERATION=1 is enabled; disable it before revalidation in production',
    });
    return;
  }

  if (shouldRequireSecret() && !getConfiguredSecret()) {
    res.status(503).json({
      error: 'BLOG_REVALIDATE_SECRET must be set before using this endpoint',
    });
    return;
  }

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
