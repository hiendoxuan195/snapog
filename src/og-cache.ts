// SnapOG — image cache adapter.
// Uses R2 when the OG_CACHE binding exists; otherwise falls back to the
// Workers Cache API so the service runs on accounts without R2 enabled.
// Cache API is per-datacenter, so a globally shared image may regenerate
// once per PoP — acceptable while R2 is unavailable.

import type { Env } from './types';

const CACHE_URL_BASE = 'https://cache.snapog.internal/';

function cacheRequest(key: string): Request {
  return new Request(CACHE_URL_BASE + key);
}

export async function getCachedImage(env: Env, key: string): Promise<ArrayBuffer | null> {
  if (env.OG_CACHE) {
    const obj = await env.OG_CACHE.get(key);
    return obj ? obj.arrayBuffer() : null;
  }
  const hit = await caches.default.match(cacheRequest(key));
  return hit ? hit.arrayBuffer() : null;
}

export async function putCachedImage(
  env: Env,
  key: string,
  image: ArrayBuffer,
  meta: { tier: string; template: string }
): Promise<void> {
  if (env.OG_CACHE) {
    await env.OG_CACHE.put(key, image, {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: meta,
    });
    return;
  }
  await caches.default.put(
    cacheRequest(key),
    new Response(image, {
      headers: {
        'Content-Type': 'image/png',
        // The Cache API evicts based on this header; OG images are immutable
        // per cache key, so a long TTL is safe.
        'Cache-Control': 'public, max-age=2592000',
      },
    })
  );
}
