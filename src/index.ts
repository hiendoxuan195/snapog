// SnapOG — Main Cloudflare Worker
// Routes: GET /og (image gen), GET / (landing), GET/POST /register, GET /dashboard

import { Hono } from 'hono';
import { generateOGImage, buildCacheKey } from './og/render';
import {
  landingPage,
  registerPage,
  keyCreatedPage,
  dashboardPage,
  errorPage,
} from './dashboard/pages';
import {
  ghostTutorialPage,
  webflowTutorialPage,
  htmlTutorialPage,
} from './docs/tutorial-pages';
import type { ApiKey, Env, OGParams, Tier } from './types';
import { TIER_LIMITS } from './types';
import { getCachedImage, putCachedImage } from './og-cache';

const app = new Hono<{ Bindings: Env }>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateRawKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return 'sk_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// Static tutorial pages: no auth, no DB — safe to cache at the edge
function tutorialResponse(html: string): Response {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// Validate an API key from request and return the DB row, or null
async function resolveApiKey(
  db: D1Database,
  rawKey: string | null
): Promise<ApiKey | null> {
  if (!rawKey) return null;
  const hash = await sha256(rawKey);
  const row = await db
    .prepare('SELECT * FROM api_keys WHERE key_hash = ?')
    .bind(hash)
    .first<ApiKey>();
  return row ?? null;
}

// Reset monthly usage if billing month rolled over
async function maybeResetUsage(db: D1Database, key: ApiKey): Promise<ApiKey> {
  const resetAt = new Date(key.usage_reset_at);
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (resetAt < thisMonth) {
    const newResetAt = thisMonth.toISOString();
    await db
      .prepare(
        'UPDATE api_keys SET usage_count = 0, usage_reset_at = ? WHERE id = ?'
      )
      .bind(newResetAt, key.id)
      .run();
    return { ...key, usage_count: 0, usage_reset_at: newResetAt };
  }
  return key;
}

// Record a usage event. Only fresh generations count toward the monthly
// limit — cache hits are free so already-published images never break.
async function recordUsage(
  db: D1Database,
  key: ApiKey,
  template: string,
  cacheHit: boolean
): Promise<void> {
  const eventId = crypto.randomUUID();
  const statements = [
    db
      .prepare(
        'INSERT INTO usage_events (id, api_key_id, template, cache_hit) VALUES (?, ?, ?, ?)'
      )
      .bind(eventId, key.id, template, cacheHit ? 1 : 0),
  ];
  if (!cacheHit) {
    statements.push(
      db
        .prepare('UPDATE api_keys SET usage_count = usage_count + 1 WHERE id = ?')
        .bind(key.id)
    );
  }
  await db.batch(statements);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Landing page
app.get('/', c => {
  const host = new URL(c.req.url).host;
  return htmlResponse(landingPage(host));
});

// ── OG image generation ────────────────────────────────────────────────────────
app.get('/og', async c => {
  const q = c.req.query();
  const rawKey = q['key'] ?? null;

  // ── Demo mode ──
  // The tutorial pages embed live previews with key=demo. Content is fixed —
  // only template/theme vary, so at most 6 distinct cacheable images exist.
  // Always watermarked, never touches the database: no unmetered-generation
  // abuse surface.
  if (rawKey === 'demo') {
    const demoParams: OGParams = {
      title: 'Ship OG images in 2 minutes',
      description:
        'This image is rendered live by the SnapOG API — one GET request, no design tools',
      domain: 'snapog.dev',
      tag: 'Live demo',
      theme: (q['theme'] === 'light' ? 'light' : 'dark') as 'dark' | 'light',
      template: (['blog', 'article'].includes(q['template'] ?? '')
        ? q['template']
        : 'default') as OGParams['template'],
    };
    const demoCachePath = `og/${await buildCacheKey(demoParams, true)}.png`;
    const imageHeaders = (cache: 'HIT' | 'MISS') => ({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'X-Cache': cache,
      'X-SnapOG-Tier': 'demo',
    });

    const cachedDemo = await getCachedImage(c.env, demoCachePath);
    if (cachedDemo) {
      return new Response(cachedDemo, { headers: imageHeaders('HIT') });
    }
    const demoImage = await (await generateOGImage(demoParams, true)).arrayBuffer();
    c.executionCtx.waitUntil(
      putCachedImage(c.env, demoCachePath, demoImage.slice(0), {
        tier: 'demo',
        template: demoParams.template ?? 'default',
      })
    );
    return new Response(demoImage, { headers: imageHeaders('MISS') });
  }

  // Validate required param
  const title = (q['title'] ?? '').trim().slice(0, 120);
  if (!title) {
    return c.json({ error: 'title parameter is required' }, 400);
  }

  // Resolve API key (required)
  if (!rawKey) {
    return c.json({ error: 'key parameter is required. Get a free key at /register' }, 401);
  }
  let apiKey = await resolveApiKey(c.env.DB, rawKey);
  if (!apiKey) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Reset usage if month rolled
  apiKey = await maybeResetUsage(c.env.DB, apiKey);

  const params: OGParams = {
    title,
    description: (q['description'] ?? '').trim().slice(0, 200) || undefined,
    domain: (q['domain'] ?? '').trim().slice(0, 100) || undefined,
    author: (q['author'] ?? '').trim().slice(0, 80) || undefined,
    tag: (q['tag'] ?? '').trim().slice(0, 40) || undefined,
    theme: (q['theme'] === 'light' ? 'light' : 'dark') as 'dark' | 'light',
    template: (['blog', 'article'].includes(q['template'] ?? '')
      ? q['template']
      : 'default') as OGParams['template'],
  };

  const watermark = apiKey.tier === 'free';
  const cacheKey = await buildCacheKey(params, watermark);
  const cachePath = `og/${cacheKey}.png`;

  // ── Cache lookup (R2 or Cache API fallback) ──
  const cached = await getCachedImage(c.env, cachePath);
  if (cached) {
    // Cache hit — serve even when over the monthly limit
    await recordUsage(c.env.DB, apiKey, params.template ?? 'default', true);
    return new Response(cached, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'X-Cache': 'HIT',
        'X-SnapOG-Tier': apiKey.tier,
      },
    });
  }

  // Rate limit applies only to fresh generations, never to cached images
  if (apiKey.usage_count >= apiKey.monthly_limit) {
    return c.json(
      {
        error: 'Monthly image limit reached',
        tier: apiKey.tier,
        limit: apiKey.monthly_limit,
        upgrade_url: '/register?tier=pro',
      },
      429
    );
  }

  // ── Generate image ──
  const imageResponse = await generateOGImage(params, watermark);
  const imageBuffer = await imageResponse.arrayBuffer();

  // Store in cache (fire-and-forget, don't block response)
  c.executionCtx.waitUntil(
    putCachedImage(c.env, cachePath, imageBuffer.slice(0), {
      tier: apiKey.tier,
      template: params.template ?? 'default',
    })
  );

  // Record usage (also fire-and-forget after we have the image)
  c.executionCtx.waitUntil(
    recordUsage(c.env.DB, apiKey, params.template ?? 'default', false)
  );

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'X-Cache': 'MISS',
      'X-SnapOG-Tier': apiKey.tier,
    },
  });
});

// ── Tutorials ─────────────────────────────────────────────────────────────────
app.get('/docs/ghost', c =>
  tutorialResponse(ghostTutorialPage(new URL(c.req.url).origin))
);
app.get('/docs/webflow', c =>
  tutorialResponse(webflowTutorialPage(new URL(c.req.url).origin))
);
app.get('/docs/html', c =>
  tutorialResponse(htmlTutorialPage(new URL(c.req.url).origin))
);

// ── Registration ──────────────────────────────────────────────────────────────
app.get('/register', c => {
  const tier = c.req.query('tier');
  return htmlResponse(registerPage(undefined, tier));
});

app.post('/register', async c => {
  let email: string, keyname: string, requestedTier: string;
  try {
    const form = await c.req.formData();
    email = (form.get('email') as string ?? '').trim().toLowerCase();
    keyname = (form.get('keyname') as string ?? '').trim() || 'default';
    requestedTier = (form.get('tier') as string ?? '').trim();
  } catch {
    return htmlResponse(registerPage('Invalid form data'), 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return htmlResponse(registerPage('Please enter a valid email address'), 400);
  }

  // Self-serve registration only ever issues free keys. Pro/business tiers are
  // granted server-side after payment confirmation, never from client input.
  const safeTier: Tier = 'free';

  // Checkout isn't live yet — record which paid tier the user wanted so we
  // know real willingness-to-pay when deciding to build billing.
  if (requestedTier === 'pro' || requestedTier === 'business') {
    c.executionCtx.waitUntil(
      c.env.DB
        .prepare('INSERT INTO tier_interest (id, email, tier) VALUES (?, ?, ?)')
        .bind(crypto.randomUUID(), email, requestedTier)
        .run()
    );
  }

  // Upsert user
  const userId = crypto.randomUUID();
  await c.env.DB
    .prepare(
      'INSERT INTO users (id, email) VALUES (?, ?) ON CONFLICT(email) DO NOTHING'
    )
    .bind(userId, email)
    .run();

  const user = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string }>();
  if (!user) {
    return htmlResponse(registerPage('Database error — please try again'), 500);
  }

  // Generate API key
  const rawKey = generateRawKey();
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12);
  const keyId = crypto.randomUUID();
  const resetAt = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const monthlyLimit = TIER_LIMITS[safeTier];

  await c.env.DB
    .prepare(
      `INSERT INTO api_keys
         (id, user_id, name, key_prefix, key_hash, tier, monthly_limit, usage_reset_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(keyId, user.id, keyname, keyPrefix, keyHash, safeTier, monthlyLimit, resetAt)
    .run();

  return htmlResponse(keyCreatedPage(rawKey, email, safeTier, new URL(c.req.url).origin));
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.get('/dashboard', async c => {
  const rawKey = c.req.query('key');
  if (!rawKey) {
    return htmlResponse(registerPage('Enter your API key or create a new one below'), 400);
  }

  const apiKey = await resolveApiKey(c.env.DB, rawKey);
  if (!apiKey) {
    return htmlResponse(errorPage(404, 'API key not found'), 404);
  }

  const refreshed = await maybeResetUsage(c.env.DB, apiKey);

  // Count recent events (last 24h)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString();
  const recent = await c.env.DB
    .prepare(
      'SELECT COUNT(*) as cnt FROM usage_events WHERE api_key_id = ? AND generated_at > ?'
    )
    .bind(refreshed.id, yesterday)
    .first<{ cnt: number }>();

  return htmlResponse(dashboardPage(refreshed, recent?.cnt ?? 0, new URL(c.req.url).origin));
});

// ── Health / ops ──────────────────────────────────────────────────────────────
app.get('/health', c => c.json({ ok: true, ts: new Date().toISOString() }));

// 404 fallback
app.notFound(_c => htmlResponse(errorPage(404, 'Page not found'), 404));
app.onError((err, _c) => {
  console.error('Unhandled error:', err);
  return htmlResponse(errorPage(500, 'Internal server error'), 500);
});

export default app;
