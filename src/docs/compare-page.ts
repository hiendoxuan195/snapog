// SnapOG — /compare: OG-image API pricing comparison
// Same "Carbon Terminal" design system as landing/tutorials. Every number in
// the table was read off the vendor's live pricing page on 2026-07-25 — see
// docs/research/cycle-7-competitor-pricing-verification.md in the company repo.
// Vendors whose dollar prices could not be verified server-side (Placid,
// DynaPictures) are deliberately left out of the table and noted below it.

import { layout, nav, footer } from '../dashboard/pages';

const COMPARE_CSS = `
  .cmp-manline {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    letter-spacing: 0.08em; text-transform: uppercase;
    border-bottom: 1px solid var(--border);
    padding: 40px 0 12px; margin-bottom: 48px;
  }
  .cmp-manline a { color: var(--text-3); }
  .cmp-manline a:hover { color: var(--accent); text-decoration: none; }
  .cmp-manline .sep { color: var(--divider); padding: 0 4px; }
  .cmp-manline .cur { color: var(--accent); }

  .cmp-h1 {
    font-size: clamp(32px, 5vw, 48px); font-weight: 700;
    letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 20px;
  }
  .cmp-h1 em { font-style: normal; color: var(--accent); }
  .cmp-lede { font-size: 17px; color: var(--text-2); max-width: 640px; line-height: 1.7; }
  .cmp-checked {
    font-family: var(--font-mono); font-size: 12px; color: var(--teal);
    margin-top: 24px; letter-spacing: 0.04em;
  }

  /* Comparison table */
  .cmp-scroll { overflow-x: auto; margin: 48px 0 8px; border: 1px solid var(--border); border-radius: var(--r-lg); }
  .cmp-table { width: 100%; border-collapse: collapse; min-width: 860px; background: var(--surface); }
  .cmp-table th {
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3);
    text-align: left; padding: 14px 18px; border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .cmp-table td {
    font-size: 14px; color: var(--text-2); line-height: 1.6;
    padding: 16px 18px; border-bottom: 1px solid var(--divider);
    vertical-align: top;
  }
  .cmp-table tr:last-child td { border-bottom: none; }
  .cmp-table td b { color: var(--text-1); font-weight: 600; }
  .cmp-table .svc { font-weight: 600; color: var(--text-1); white-space: nowrap; }
  .cmp-table .svc .m { display: block; font-family: var(--font-mono); font-size: 11px; font-weight: 400; color: var(--text-3); margin-top: 4px; }
  .cmp-row-us { background: #131108; }
  .cmp-row-us .svc { color: var(--accent); }
  .cmp-row-us td { border-bottom-color: var(--border); }
  .cmp-price { font-family: var(--font-mono); font-size: 13px; color: var(--teal); white-space: nowrap; }
  .cmp-none { color: var(--text-3); }

  .cmp-foot {
    font-family: var(--font-mono); font-size: 12px; color: var(--text-3);
    line-height: 1.9; margin: 16px 2px 0;
  }
  .cmp-foot a { color: var(--text-3); text-decoration: underline; }
  .cmp-foot a:hover { color: var(--accent); }

  /* Honest guidance */
  .cmp-pick { margin: 72px 0 0; }
  .cmp-pick-title {
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px;
  }
  .cmp-pick h2 { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 28px; }
  .pick {
    display: grid; grid-template-columns: 260px 1fr; gap: 20px;
    padding: 26px 0; border-bottom: 1px dashed var(--divider);
  }
  .pick:last-child { border-bottom: none; }
  .pick-if { font-size: 15px; font-weight: 600; color: var(--text-1); line-height: 1.5; }
  .pick-then { font-size: 15px; color: var(--text-2); line-height: 1.7; }
  .pick-then b { color: var(--teal); font-weight: 600; }
  .pick-then .us { color: var(--accent); font-weight: 600; }

  /* Quota semantics callout */
  .cmp-quota {
    border: 1px solid var(--border); background: var(--surface);
    border-radius: var(--r-lg); padding: 32px 34px; margin: 72px 0 0;
  }
  .cmp-quota h3 { font-size: 19px; font-weight: 600; margin-bottom: 12px; }
  .cmp-quota p { font-size: 15px; color: var(--text-2); line-height: 1.75; margin-bottom: 10px; }
  .cmp-quota p:last-child { margin-bottom: 0; }
  .cmp-quota code {
    font-family: var(--font-mono); font-size: 13px; color: var(--teal);
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 3px; padding: 1px 5px;
  }

  /* CTA + cross links reuse tutorial look */
  .cmp-cta {
    border: 1px solid var(--border); background: var(--surface);
    border-radius: var(--r-lg); padding: 44px 32px; text-align: center;
    margin: 72px 0 88px;
  }
  .cmp-cta h2 { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 10px; }
  .cmp-cta p { color: var(--text-2); font-size: 15px; margin-bottom: 24px; }

  @media (max-width: 640px) {
    .pick { grid-template-columns: 1fr; gap: 8px; }
  }
`;

interface Row {
  us?: boolean;
  name: string;
  meta: string;
  free: string;
  paid: string;
  quota: string;
  model: string;
}

const ROWS: Row[] = [
  {
    us: true,
    name: 'SnapOG',
    meta: 'this site · open source (MIT)',
    free: '<b>100 fresh renders/mo</b>, watermarked — cached serves are free and unlimited',
    paid: '<span class="cmp-price">$19/mo</span> — 10,000 renders, no watermark',
    quota: 'Only <b>fresh renders</b>. Cache hits never count, so published pages never break',
    model: 'Hosted API on Cloudflare edge',
  },
  {
    name: 'image.social',
    meta: 'image.social',
    free: '<span class="cmp-none">No free tier</span>',
    paid: '<span class="cmp-price">$9/mo</span> ($4.50/mo annual) — 1,000 new images',
    quota: 'Only new (cache-miss) images; cached serves free',
    model: 'Hosted screenshot-to-OG API',
  },
  {
    name: 'HTML/CSS to Image',
    meta: 'htmlcsstoimage.com',
    free: '50 images/mo',
    paid: '<span class="cmp-price">$14/mo</span> — 1,000 images (+$10 per extra 1,000)',
    quota: 'Every rendered image',
    model: 'Hosted HTML→image API',
  },
  {
    name: 'APITemplate.io',
    meta: 'apitemplate.io',
    free: '50 images/PDFs per mo, 3 templates',
    paid: '<span class="cmp-price">$35/mo</span> — 1,500 images/PDFs',
    quota: 'Every image or PDF',
    model: 'Template-based design API',
  },
  {
    name: 'Bannerbear',
    meta: 'bannerbear.com',
    free: '30 trial credits (no card)',
    paid: '<span class="cmp-price">$49/mo</span> — 1,000 image/video credits',
    quota: '1 image = 1 credit; no overage, upgrade to exceed',
    model: 'Template-based design automation',
  },
  {
    name: 'ogimage.org',
    meta: 'one-time purchase',
    free: '<span class="cmp-none">n/a</span>',
    paid: '<span class="cmp-price">$37 once</span> (Pro $67) — you get the source',
    quota: 'Unlimited — it runs on your infrastructure',
    model: 'Buy Satori-based source, self-host',
  },
  {
    name: '@vercel/og',
    meta: 'vercel.com/docs',
    free: 'Free open-source library',
    paid: '<span class="cmp-none">n/a</span> — you pay Vercel compute (Hobby is free)',
    quota: 'Platform usage, not per image',
    model: 'DIY: write a React component per template',
  },
];

const PICKS: Array<{ ifYou: string; then: string }> = [
  {
    ifYou: 'You run Next.js/React on Vercel',
    then: 'Use <b>@vercel/og</b>. It is free, first-party, and excellent — a hosted API buys you nothing there. (Yes, we just told you not to use us.)',
  },
  {
    ifYou: 'You run Hugo, Jekyll, 11ty, Ghost, Webflow, or plain HTML',
    then: 'This is the gap: no React runtime, so @vercel/og is off the table. <span class="us">SnapOG</span> and <b>image.social</b> both solve it with a URL you drop in a meta tag. SnapOG has a free tier to test with and is open source; image.social starts at $9/mo with no free tier.',
  },
  {
    ifYou: 'You need branded templates, a drag-and-drop editor, or video',
    then: '<b>Bannerbear</b> or <b>APITemplate.io</b> — the $35–49 entry price buys design tooling that URL-based generators do not have. Different job.',
  },
  {
    ifYou: 'You hate subscriptions and are happy to self-host',
    then: '<b>ogimage.org</b> at $37 one-time, or assemble your own from Satori — both trade a monthly bill for owning the ops.',
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'Why do some OG image APIs have no free tier?',
    a: 'Rendering costs real compute, so several vendors (like image.social) only sell paid plans. SnapOG keeps a free tier — 100 fresh renders per month, watermarked — because cached images cost almost nothing to serve from the edge.',
  },
  {
    q: 'What does "cached serves are free" mean?',
    a: 'An OG image URL is fetched every time someone shares the page, but the image only needs rendering once. SnapOG and image.social meter fresh renders only: once an image is cached, serving it never counts against your quota, so published pages keep working even at the limit.',
  },
  {
    q: 'Is SnapOG open source?',
    a: 'Yes — the entire worker is MIT-licensed at github.com/hiendoxuan195/snapog. You can read exactly how rendering, caching and metering work, or self-host it on your own Cloudflare account.',
  },
];

export function comparePage(origin: string): string {
  const tableRows = ROWS.map(
    r => `
        <tr${r.us ? ' class="cmp-row-us"' : ''}>
          <td class="svc">${r.name}<span class="m">${r.meta}</span></td>
          <td>${r.free}</td>
          <td>${r.paid}</td>
          <td>${r.quota}</td>
          <td>${r.model}</td>
        </tr>`
  ).join('');

  const picks = PICKS.map(
    p => `
        <div class="pick">
          <div class="pick-if">${p.ifYou}</div>
          <div class="pick-then">${p.then}</div>
        </div>`
  ).join('');

  const faqHtml = FAQ.map(
    f => `
        <div class="pick">
          <div class="pick-if">${f.q}</div>
          <div class="pick-then">${f.a.replace(
            'github.com/hiendoxuan195/snapog',
            '<a href="https://github.com/hiendoxuan195/snapog" rel="noopener">github.com/hiendoxuan195/snapog</a>'
          )}</div>
        </div>`
  ).join('');

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });

  const body = `
  ${nav()}
  <div class="container">
    <div class="cmp-manline">
      <span><a href="/">snapog</a><span class="sep">/</span><span class="cur">compare</span></span>
      <span>SNAPOG MANUAL · COMPARE(7)</span>
    </div>

    <h1 class="cmp-h1">OG image API pricing, <em>actually compared</em></h1>
    <p class="cmp-lede">
      Every price below was read off the vendor's live pricing page — not from
      a stale listicle. Vendors whose prices we could not verify are excluded
      and noted under the table. Yes, we are one of the rows; the other six
      numbers are still real.
    </p>
    <p class="cmp-checked">// prices verified on live pricing pages · 2026-07-25</p>

    <div class="cmp-scroll">
      <table class="cmp-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Free tier</th>
            <th>Cheapest paid</th>
            <th>What counts against quota</th>
            <th>Model</th>
          </tr>
        </thead>
        <tbody>${tableRows}
        </tbody>
      </table>
    </div>
    <p class="cmp-foot">
      Excluded, honestly: <b>Placid</b> and <b>DynaPictures</b> render prices
      client-side, so we could not verify dollar amounts from the server HTML —
      third-party sources put Placid's entry plan around $19/mo, unconfirmed.
      <b>Previewify</b> appeared broken or parked when checked. Prices change;
      if a number here is stale,
      <a href="https://github.com/hiendoxuan195/snapog/issues" rel="noopener">open an issue</a>
      and we will fix it.
    </p>

    <div class="cmp-pick">
      <p class="cmp-pick-title">Decision table</p>
      <h2>Which one should you actually use?</h2>
      ${picks}
    </div>

    <div class="cmp-quota">
      <h3>The number that matters is not the price — it's the quota semantics</h3>
      <p>
        An <code>og:image</code> URL gets hit every time a page is shared or a
        crawler re-checks it, but the image only needs to be <em>rendered</em>
        once. Services that charge per <em>request</em> punish you for being
        popular; services that charge per <em>fresh render</em> only charge for
        new content.
      </p>
      <p>
        SnapOG and image.social both meter fresh renders and serve cached
        images free. On SnapOG, hitting your monthly limit blocks new renders
        but <em>never</em> breaks images that are already published — the cache
        keeps serving them.
      </p>
    </div>

    <div class="cmp-pick">
      <p class="cmp-pick-title">FAQ</p>
      ${faqHtml}
    </div>

    <div class="cmp-cta">
      <h2>Try the free tier — no card, no password</h2>
      <p>100 fresh renders/month, cached serves unlimited. One email, instant key.</p>
      <a href="/register" class="btn btn-primary" style="font-size:15px;padding:12px 28px;">Get Free API Key →</a>
    </div>
  </div>
  ${footer()}
  <script type="application/ld+json">${faqJsonLd}</script>`;

  return layout(
    'OG image API pricing compared: SnapOG vs image.social vs Bannerbear (2026)',
    body,
    `<style>${COMPARE_CSS}</style>`,
    {
      description:
        'Verified pricing for 7 OG image APIs — SnapOG, image.social, Bannerbear, APITemplate, HTML/CSS to Image, ogimage.org and @vercel/og — with an honest guide to which one fits your stack.',
      origin,
      path: '/compare',
    }
  );
}
