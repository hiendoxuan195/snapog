# SnapOG

Generate stunning Open Graph images via API — hosted on Cloudflare Workers, edge-cached, fast on cache hit.

**Live:** https://snapog.dev-tasuku-hd-jp-account.workers.dev (custom domain `snapog.dev` pending)

## Quick Start

```bash
# Get a free API key at https://snapog.dev-tasuku-hd-jp-account.workers.dev/register, then:
curl "https://snapog.dev-tasuku-hd-jp-account.workers.dev/og?title=My+Blog+Post&domain=myblog.com&key=sk_YOUR_KEY" \
  --output og.png && open og.png
```

## API

```
GET /og
  ?title=Your Page Title     # required, max 120 chars
  &key=sk_your_key           # required
  &description=Subtitle      # optional, max 200 chars
  &domain=yourdomain.com     # optional
  &author=Jane Doe           # optional
  &tag=Tutorial              # optional, shown as pill badge
  &template=default          # default | blog | article
  &theme=dark                # dark | light
```

Returns `image/png`, 1200×630.

Headers:
- `X-Cache: HIT|MISS` — whether served from R2 cache
- `X-SnapOG-Tier: free|pro|business`

## HTML Integration

```html
<meta property="og:image"
      content="https://snapog.dev-tasuku-hd-jp-account.workers.dev/og?title=YOUR_TITLE&key=YOUR_KEY" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"   content="summary_large_image" />
<meta name="twitter:image"  content="https://snapog.dev-tasuku-hd-jp-account.workers.dev/og?title=YOUR_TITLE&key=YOUR_KEY" />
```

### ⚠️ Your API key is visible in og:image URLs

Anything in an `og:image` URL is public: it ships in your HTML source and gets
crawled by every social platform. Treat an embedded key as **publishable, not
secret**:

- Use a **dedicated key per site** (create one at `/register` per project), so
  a leaked or abused key can be replaced without touching your other sites.
- Free-tier abuse is capped at 100 fresh generations/month per key; cached
  images keep serving even if the quota is exhausted, so published pages never
  break.
- Signed URLs / domain allowlisting (keys that only work for your domain) are
  on the roadmap before we recommend high-volume production use.

## Pricing

| Tier | Price | Images/month |
|------|-------|-------------|
| Free | $0 | 100 |
| Pro | $19/mo | 10,000 |
| Business | $49/mo | 100,000 |

Free tier images include "snapog.dev" watermark.

## Local Development

### Prerequisites
- Node.js 18+, npm
- Wrangler (`npm install -g wrangler`)
- A Cloudflare account with Workers access

### Setup

```bash
cd projects/snapog
npm install

# 1. Create D1 database
wrangler d1 create snapog-db
# Copy the returned database_id into wrangler.toml [d1_databases]

# 2. Apply migrations locally
npm run db:local

# 3. Create R2 bucket (local R2 is simulated)
# No setup needed for local dev — wrangler simulates R2

# 4. Start dev server
npm run dev
```

Open http://127.0.0.1:8787

### Test

```bash
# Register a key via browser at http://127.0.0.1:8787/register
# Then test with:
API_KEY=sk_your_key bash sample/smoke-test.sh

# Or direct curl:
curl "http://127.0.0.1:8787/og?title=Hello+World&key=sk_your_key" --output og.png
```

### Typecheck

```bash
npm run typecheck
```

## Deployment

```bash
# 1. Create remote D1 database
wrangler d1 create snapog-db
# Update wrangler.toml with the database_id

# 2. Apply migrations to remote
npm run db:remote

# 3. (Optional) Create R2 bucket — requires R2 enabled on the account.
#    Without it the worker automatically falls back to the Workers Cache API
#    (per-datacenter cache instead of global). To use R2, also uncomment the
#    [[r2_buckets]] block in wrangler.toml.
wrangler r2 bucket create snapog-og-cache

# 4. Deploy
wrangler deploy
```

## Tech Stack

- [Cloudflare Workers](https://workers.cloudflare.com/) — edge compute
- [Hono](https://hono.dev/) — HTTP framework
- [workers-og](https://www.npmjs.com/package/workers-og) — OG image generation (Satori-based)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — SQLite for usage tracking
- Workers Cache API (R2 planned once enabled on the account) — image cache storage
