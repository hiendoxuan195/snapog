// SnapOG — Tutorial pages (/docs/ghost, /docs/webflow, /docs/html)
// Same "Carbon Terminal" design system as landing/dashboard (reuses layout/
// nav/footer from dashboard/pages.ts). Editorial layer: man-page header line,
// mono step numbers, copy-able code blocks, live demo via key=demo.

import { layout, nav, footer } from '../dashboard/pages';

// ─── Tutorial-specific CSS (layered on top of the shared CSS in layout) ──────

const TUTORIAL_CSS = `
  /* man-page header line */
  .tut-manline {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    letter-spacing: 0.08em; text-transform: uppercase;
    border-bottom: 1px solid var(--border);
    padding: 40px 0 12px; margin-bottom: 48px;
  }
  .tut-manline a { color: var(--text-3); }
  .tut-manline a:hover { color: var(--accent); text-decoration: none; }
  .tut-manline .sep { color: var(--divider); padding: 0 4px; }
  .tut-manline .cur { color: var(--accent); }

  .tut-h1 {
    font-size: clamp(32px, 5vw, 48px); font-weight: 700;
    letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 20px;
  }
  .tut-h1 em { font-style: normal; color: var(--accent); }
  .tut-lede { font-size: 17px; color: var(--text-2); max-width: 620px; line-height: 1.7; }
  .tut-facts {
    display: flex; flex-wrap: wrap; gap: 10px 28px; margin-top: 28px;
    font-family: var(--font-mono); font-size: 12px; color: var(--text-3);
  }
  .tut-facts b { color: var(--teal); font-weight: 500; }

  /* Steps */
  .steps { margin-top: 16px; }
  .step {
    display: grid; grid-template-columns: 76px 1fr; gap: 20px;
    padding: 44px 0; border-bottom: 1px dashed var(--divider);
  }
  .step:last-child { border-bottom: none; }
  .step-num {
    font-family: var(--font-mono); font-size: 24px; font-weight: 700;
    color: var(--accent); line-height: 1.35;
  }
  .step-num::after { content: ' /'; color: var(--text-3); font-weight: 400; }
  .step-body { min-width: 0; }
  .step-body h3 { font-size: 19px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 10px; }
  .step-body p { font-size: 15px; color: var(--text-2); line-height: 1.7; margin-bottom: 12px; }
  .step-body ul { margin: 0 0 12px 18px; color: var(--text-2); font-size: 15px; line-height: 1.7; }
  .step-body p code, .step-body li code {
    font-family: var(--font-mono); font-size: 13px; color: var(--teal);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 3px; padding: 1px 5px;
  }
  .step-path {
    font-family: var(--font-mono); font-size: 12px; color: var(--text-2);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 8px 12px;
    display: inline-block; margin-bottom: 14px;
  }
  .step-path b { color: var(--accent); font-weight: 500; }

  /* Code blocks: copy button lives in the existing header bar */
  .tut-code { margin-top: 8px; margin-bottom: 8px; }
  .tut-code pre { font-size: 12.5px; }
  .tut-code-right { display: flex; align-items: center; gap: 14px; }
  .copy-btn {
    font-family: var(--font-mono); font-size: 11px; color: var(--text-2);
    background: transparent; border: 1px solid var(--border);
    border-radius: var(--r); padding: 4px 12px; cursor: pointer;
    transition: all 0.15s;
  }
  .copy-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* Live demo */
  .tut-demo { margin: 24px 0 0; }
  .tut-demo-note {
    font-family: var(--font-mono); font-size: 12px; color: var(--text-3);
    margin-top: 14px; line-height: 1.8;
  }
  .tut-demo-note code { color: var(--teal); }

  /* Key-is-public warning */
  .callout-warn {
    border: 1px solid var(--accent-dim); background: #1C1400;
    border-radius: var(--r-lg); padding: 26px 30px; margin: 56px 0 0;
  }
  .callout-warn-title {
    font-family: var(--font-mono); font-size: 13px; color: var(--accent);
    letter-spacing: 0.04em; margin-bottom: 12px;
  }
  .callout-warn p { font-size: 14px; color: var(--text-2); line-height: 1.7; margin-bottom: 10px; }
  .callout-warn ul { margin: 0 0 0 18px; font-size: 14px; color: var(--text-2); line-height: 1.7; }
  .callout-warn code { font-family: var(--font-mono); font-size: 12.5px; color: var(--accent); }
  .callout-warn strong { color: var(--text-1); }

  /* CTA */
  .tut-cta {
    border: 1px solid var(--border); background: var(--surface);
    border-radius: var(--r-lg); padding: 44px 32px; text-align: center;
    margin: 64px 0 0;
  }
  .tut-cta h2 { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 10px; }
  .tut-cta p { color: var(--text-2); font-size: 15px; margin-bottom: 24px; }

  /* Cross-links */
  .tut-cross { margin: 64px 0 88px; }
  .tut-cross-title {
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px;
  }
  .tut-cross-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .tut-cross-card {
    display: block; background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 22px 24px; transition: border-color 0.2s;
  }
  .tut-cross-card:hover { border-color: var(--accent); text-decoration: none; }
  .tut-cross-card .k { font-family: var(--font-mono); font-size: 11px; color: var(--text-3); display: block; margin-bottom: 6px; }
  .tut-cross-card .t { font-size: 15px; font-weight: 600; color: var(--text-1); }
  .tut-cross-card .a { font-family: var(--font-mono); font-size: 12px; color: var(--accent); display: block; margin-top: 8px; }

  @media (max-width: 640px) {
    .step { grid-template-columns: 1fr; gap: 8px; }
    .tut-cross-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Shared building blocks ──────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Code block with working copy button. Content is escaped here, and the copy
// script reads pre.textContent, so what you see is exactly what you copy.
export function codeBlock(lang: string, code: string): string {
  return `
      <div class="code-block tut-code">
        <div class="code-block-header">
          <div class="code-block-dots">
            <div class="dot dot-red"></div><div class="dot dot-yellow"></div><div class="dot dot-green"></div>
          </div>
          <div class="tut-code-right">
            <span class="code-block-lang">${lang}</span>
            <button class="copy-btn" type="button">copy</button>
          </div>
        </div>
        <pre>${escapeHtml(code)}</pre>
      </div>`;
}

export function step(num: string, title: string, body: string): string {
  return `
      <div class="step">
        <div class="step-num">${num}</div>
        <div class="step-body">
          <h3>${title}</h3>
          ${body}
        </div>
      </div>`;
}

// Rendered by the product itself. key=demo serves a fixed, watermarked,
// cached image (see /og route) so the preview is a real API response.
function liveDemo(template: 'default' | 'blog' | 'article'): string {
  return `
      <div class="og-preview-wrap tut-demo">
        <div class="og-preview-label">live — GET /og?key=demo&amp;template=${template}</div>
        <img src="/og?key=demo&amp;template=${template}" alt="Live OG image rendered by the SnapOG API" loading="lazy" style="width:100%;display:block;" />
      </div>
      <p class="tut-demo-note">
        This image is a real response from this API, rendered with <code>key=demo</code>
        (fixed demo content, watermarked). With your own <code>key=sk_…</code> the
        <code>title</code>, <code>description</code> and every other parameter are yours.
      </p>`;
}

// Honest warning — same substance as the README section.
function keyWarning(): string {
  return `
      <div class="callout-warn">
        <p class="callout-warn-title">⚠ YOUR API KEY IS VISIBLE IN OG:IMAGE URLS</p>
        <p>
          Anything in an <code>og:image</code> URL is public: it ships in your HTML
          source and gets crawled by every social platform. Treat an embedded key as
          <strong>publishable, not secret</strong>:
        </p>
        <ul>
          <li>Use a <strong>dedicated key per site</strong> (create one at <a href="/register">/register</a> per project), so a leaked or abused key can be replaced without touching your other sites.</li>
          <li>Free-tier abuse is capped at 100 fresh generations/month per key; cached images keep serving even if the quota is exhausted, so published pages never break.</li>
          <li>Signed URLs / domain allowlisting (keys that only work for your domain) are on the roadmap before we recommend high-volume production use.</li>
        </ul>
      </div>`;
}

function ctaSection(): string {
  return `
      <div class="tut-cta">
        <h2>Get your free API key</h2>
        <p>100 images/month free. No credit card, no password — just an email.</p>
        <a href="/register" class="btn btn-primary" style="font-size:15px;padding:12px 28px;">Get Free API Key →</a>
      </div>`;
}

export type TutorialSlug = 'ghost' | 'webflow' | 'html' | 'hugo' | 'jekyll' | 'astro';

export const TUTORIAL_INDEX: Record<TutorialSlug, { href: string; k: string; t: string }> = {
  ghost:   { href: '/docs/ghost',   k: 'docs / ghost',   t: 'Add auto-generated OG images to your Ghost blog' },
  webflow: { href: '/docs/webflow', k: 'docs / webflow', t: 'Auto OG images for Webflow sites' },
  html:    { href: '/docs/html',    k: 'docs / html',    t: 'Add OG images to any HTML site in 2 minutes' },
  hugo:    { href: '/docs/hugo',    k: 'docs / hugo',    t: 'Dynamic OG images for Hugo sites — no build step' },
  jekyll:  { href: '/docs/jekyll',  k: 'docs / jekyll',  t: 'Auto OG images for Jekyll and GitHub Pages blogs' },
  astro:   { href: '/docs/astro',   k: 'docs / astro',   t: 'OG images for Astro without satori or build plugins' },
};

function crossLinks(current: TutorialSlug): string {
  const cards = (Object.keys(TUTORIAL_INDEX) as TutorialSlug[])
    .filter(slug => slug !== current)
    .map(slug => {
      const tut = TUTORIAL_INDEX[slug];
      return `
        <a class="tut-cross-card" href="${tut.href}">
          <span class="k">${tut.k}</span>
          <span class="t">${tut.t}</span>
          <span class="a">read the guide →</span>
        </a>`;
    })
    .join('');
  return `
      <div class="tut-cross">
        <p class="tut-cross-title">More integrations</p>
        <div class="tut-cross-grid">${cards}</div>
      </div>`;
}

const COPY_SCRIPT = `
  <script>
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pre = btn.closest('.code-block').querySelector('pre');
        navigator.clipboard.writeText(pre.textContent);
        const orig = btn.textContent;
        btn.textContent = 'copied ✓';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      });
    });
  </script>`;

export function tutorialShell(opts: {
  slug: TutorialSlug;
  pageTitle: string;
  manRef: string;
  h1: string;
  lede: string;
  facts: string;
  content: string;
  demoTemplate: 'default' | 'blog' | 'article';
  origin?: string;
  metaDescription?: string;
}): string {
  const body = `
  ${nav()}
  <div class="container">
    <div class="tut-manline">
      <span><a href="/">snapog</a><span class="sep">/</span><a href="/docs/html">docs</a><span class="sep">/</span><span class="cur">${opts.slug}</span></span>
      <span>SNAPOG MANUAL · ${opts.manRef}</span>
    </div>

    <h1 class="tut-h1">${opts.h1}</h1>
    <p class="tut-lede">${opts.lede}</p>
    <div class="tut-facts">${opts.facts}</div>

    <div class="steps">
      ${opts.content}
    </div>

    <h2 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:56px 0 4px;">See it render</h2>
    ${liveDemo(opts.demoTemplate)}

    ${keyWarning()}
    ${ctaSection()}
    ${crossLinks(opts.slug)}
  </div>
  ${footer()}
  ${COPY_SCRIPT}`;

  return layout(opts.pageTitle, body, `<style>${TUTORIAL_CSS}</style>`, {
    description: opts.metaDescription,
    origin: opts.origin,
    path: `/docs/${opts.slug}`,
  });
}

// ─── /docs/html — any HTML site ──────────────────────────────────────────────

export function htmlTutorialPage(origin: string): string {
  const metaSnippet = `<!-- In your <head>, before any other og: tags -->
<meta property="og:image"
      content="${origin}/og?title=Your%20Page%20Title&domain=yoursite.com&key=sk_YOUR_KEY" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image"
      content="${origin}/og?title=Your%20Page%20Title&domain=yoursite.com&key=sk_YOUR_KEY" />`;

  const encodeSnippet = `// If you template your pages, encode the title once:
const ogImage =
  \`${origin}/og?title=\${encodeURIComponent(page.title)}&domain=yoursite.com&key=\${SNAPOG_KEY}\`;`;

  const curlSnippet = `# See exactly what crawlers will fetch
curl "${origin}/og?title=Hello+World&domain=yoursite.com&key=sk_YOUR_KEY" \\
  --output og.png && open og.png`;

  const content = [
    step('01', 'Get a free API key', `
          <p>
            Register with just an email at <a href="/register">/register</a> — the key
            appears instantly. Free tier: 100 fresh images/month, cached images don't
            count against the quota.
          </p>`),
    step('02', 'Drop two meta tags into your <head>', `
          <p>
            That's the whole integration. The <code>og:image</code> URL <em>is</em> the
            image — SnapOG renders a 1200×630 PNG on first request and serves it from
            the edge cache after that.
          </p>
          ${codeBlock('HTML', metaSnippet)}`),
    step('03', 'URL-encode your title', `
          <p>
            The title lives in a query string, so encode it: spaces become
            <code>%20</code> (or <code>+</code>), and <code>&amp;</code> must be
            <code>%26</code> or it will cut your URL short. If you generate pages
            programmatically, let the language do it:
          </p>
          ${codeBlock('JavaScript', encodeSnippet)}
          <p>
            Optional parameters: <code>description</code>, <code>author</code>,
            <code>tag</code>, <code>template=default|blog|article</code>,
            <code>theme=dark|light</code>. Full reference on the
            <a href="/#how-it-works">API docs</a>.
          </p>`),
    step('04', 'Verify before you ship', `
          <p>Fetch the image directly first:</p>
          ${codeBlock('shell', curlSnippet)}
          <p>
            Then paste your page URL into a preview checker like
            <a href="https://www.opengraph.xyz" rel="noopener" target="_blank">opengraph.xyz</a>
            or the platform debuggers (Facebook Sharing Debugger, LinkedIn Post
            Inspector). Crawlers cache aggressively — if you change the title, the
            image URL changes with it, which busts their cache for free.
          </p>`),
  ].join('');

  return tutorialShell({
    slug: 'html',
    pageTitle: 'Add OG images to any HTML site in 2 minutes',
    manRef: 'HTML(1)',
    h1: 'Add OG images to any HTML site in <em>2 minutes</em>',
    lede: `No build step, no plugin, no design tool. Two meta tags in your
      <code>&lt;head&gt;</code> and every share on X, Slack, LinkedIn, Discord and
      Facebook gets a proper 1200×630 card.`,
    facts: `<span>time <b>~2 min</b></span><span>difficulty <b>copy/paste</b></span><span>works with <b>any site or framework</b></span>`,
    content,
    demoTemplate: 'default',
    origin,
    metaDescription:
      'Add auto-generated Open Graph images to any HTML site in 2 minutes: paste two meta tags, no build step, no plugin, no design tool.',
  });
}

// ─── /docs/ghost — Ghost blogs ───────────────────────────────────────────────

export function ghostTutorialPage(origin: string): string {
  const perPostSnippet = `<meta property="og:image"
      content="${origin}/og?title=Your%20Post%20Title&domain=yourblog.com&template=blog&key=sk_YOUR_KEY" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image"
      content="${origin}/og?title=Your%20Post%20Title&domain=yourblog.com&template=blog&key=sk_YOUR_KEY" />`;

  const themeLayoutSnippet = `{{!-- default.hbs — inside <head>, ABOVE {{ghost_head}} --}}
{{{block "snapog-meta"}}}
{{ghost_head}}`;

  const themeSnippet = `{{!-- post.hbs — anywhere at the top level of the file --}}
{{#contentFor "snapog-meta"}}
{{#post}}
<meta property="og:image"
      content="${origin}/og?title={{encode title}}&author={{encode primary_author.name}}&domain=yourblog.com&template=blog&key=sk_YOUR_KEY" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image"
      content="${origin}/og?title={{encode title}}&domain=yourblog.com&template=blog&key=sk_YOUR_KEY" />
{{/post}}
{{/contentFor}}`;

  const content = [
    step('01', 'Get a free API key', `
          <p>
            Email in, key out — takes 20 seconds at <a href="/register">/register</a>.
            Tip: create a key named <code>ghost-blog</code> so you can rotate it later
            without touching other projects.
          </p>`),
    step('02', 'Option A — per post, zero code', `
          <p>
            Best if you publish a few posts a month and don't want to touch your theme.
            In the Ghost editor, open the post settings sidebar:
          </p>
          <p class="step-path">Post settings (⚙) <b>→</b> Code injection <b>→</b> Post header</p>
          <p>
            Paste this, then replace <code>Your%20Post%20Title</code> with the actual
            post title, URL-encoded (spaces → <code>%20</code>, <code>&amp;</code> →
            <code>%26</code>):
          </p>
          ${codeBlock('HTML — paste into Post header', perPostSnippet)}`),
    step('03', 'Option B — patch the theme once, every post is covered', `
          <p>
            Download your active theme (<span class="step-path" style="margin:0;">Settings <b>→</b> Design &amp; branding <b>→</b> Change theme <b>→</b> download</span>)
            and edit two files. First, declare a content block in
            <code>default.hbs</code>, just above <code>{{ghost_head}}</code>:
          </p>
          ${codeBlock('Handlebars — default.hbs', themeLayoutSnippet)}
          <p>
            Then fill that block from <code>post.hbs</code>, where the post's data is
            in scope (layout files like <code>default.hbs</code> can't reliably read
            post attributes — that's why the tag lives here):
          </p>
          ${codeBlock('Handlebars — post.hbs', themeSnippet)}
          <p>
            Ghost's <code>{{encode}}</code> helper URL-encodes the post title for you,
            so titles with spaces and punctuation just work. Re-upload the theme zip
            when done.
          </p>`),
    step('04', 'Know how this plays with feature images', `
          <p>
            <code>{{ghost_head}}</code> outputs its own <code>og:image</code> when a
            post has a feature image. Most crawlers take the <em>first</em>
            <code>og:image</code> tag they find — that's why the
            <code>{{{block}}}</code> placeholder goes <strong>above</strong>
            <code>{{ghost_head}}</code>: the generated card wins.
            Prefer the feature photo for a specific post? Wrap the snippet in
            <code>{{#unless feature_image}} … {{/unless}}</code> so SnapOG only fills
            the gaps.
          </p>`),
    step('05', 'Verify a post', `
          <p>
            Open any post, view source, and click the <code>og:image</code> URL — you
            should get a PNG with your post title. Then run the URL through
            <a href="https://www.opengraph.xyz" rel="noopener" target="_blank">opengraph.xyz</a>
            or a platform debugger to confirm the card.
          </p>`),
  ].join('');

  return tutorialShell({
    slug: 'ghost',
    pageTitle: 'Add auto-generated OG images to your Ghost blog',
    manRef: 'GHOST(1)',
    h1: 'Auto-generated OG images for your <em>Ghost</em> blog',
    lede: `Two ways in: paste a snippet per post (zero code, 30 seconds each), or
      patch your theme once and every post gets its own generated share card
      automatically. No plugin, no external build step.`,
    facts: `<span>time <b>~5 min</b></span><span>plugin <b>none</b></span><span>works with <b>Ghost 5.x themes</b></span>`,
    content,
    demoTemplate: 'blog',
    origin,
    metaDescription:
      'Auto-generate OG share images for every Ghost post: paste a snippet per post or patch your theme once. No plugin, works with Ghost 5.x.',
  });
}

// ─── /docs/webflow — Webflow sites ───────────────────────────────────────────

export function webflowTutorialPage(origin: string): string {
  const staticUrlSnippet = `${origin}/og?title=Pricing%20%E2%80%94%20Your%20Product&domain=yoursite.com&key=sk_YOUR_KEY`;

  const cmsUrlSnippet = `${origin}/og?title={Name}&domain=yoursite.com&template=article&key=sk_YOUR_KEY

# In Webflow, don't type "{Name}" — click "+ Add field" and
# insert the collection's Name field at that position.`;

  const content = [
    step('01', 'Get a free API key', `
          <p>
            Grab one at <a href="/register">/register</a> — email only, instant key.
            Use a dedicated key for this Webflow site so it can be rotated
            independently.
          </p>`),
    step('02', 'Static pages — paste one URL', `
          <p>
            Webflow already has a field for exactly this. No custom code, works on any
            plan:
          </p>
          <p class="step-path">Pages panel <b>→</b> ⚙ Page settings <b>→</b> Open Graph settings <b>→</b> Open Graph Image URL</p>
          <p>Paste the image URL with your title URL-encoded (spaces → <code>%20</code>):</p>
          ${codeBlock('URL — Open Graph Image URL field', staticUrlSnippet)}
          <p>
            Webflow writes the <code>og:image</code> and <code>twitter:image</code> meta
            tags for you from this field.
          </p>`),
    step('03', 'CMS collection pages — compose the URL from fields', `
          <p>
            This is where it pays off: one setting covers every blog post, product, or
            listing. Open your collection page template:
          </p>
          <p class="step-path">Collection page settings <b>→</b> Open Graph settings <b>→</b> Open Graph Image URL</p>
          <p>
            Type the base URL, and where the title goes, use the purple
            <strong>+&nbsp;Add field</strong> button to insert the collection's
            <code>Name</code> field:
          </p>
          ${codeBlock('URL template — with CMS field', cmsUrlSnippet)}
          <p>
            One honest caveat: Webflow inserts the field text <em>raw</em>, without
            URL-encoding. Spaces are fine (crawlers encode them), but an
            <code>&amp;</code> or <code>#</code> inside an item's name will cut the
            query string short. If your titles use those characters, add a plain-text
            "OG Title" field to the collection with a cleaned-up title and insert that
            instead.
          </p>`),
    step('04', 'Publish and verify', `
          <p>
            Publish the site, open a page, view source, and click the
            <code>og:image</code> URL — it should return your rendered PNG. Then check
            the card with
            <a href="https://www.opengraph.xyz" rel="noopener" target="_blank">opengraph.xyz</a>
            or the debuggers of the platforms you care about. Changing a CMS item's
            name changes the image URL, so crawler caches bust themselves.
          </p>`),
  ].join('');

  return tutorialShell({
    slug: 'webflow',
    pageTitle: 'Auto OG images for Webflow sites',
    manRef: 'WEBFLOW(1)',
    h1: 'Auto OG images for <em>Webflow</em> sites',
    lede: `Use Webflow's built-in Open Graph settings — paste one URL for static
      pages, or compose it from CMS fields so every collection item gets its own
      card. No custom code, no paid add-on.`,
    facts: `<span>time <b>~5 min</b></span><span>custom code <b>not required</b></span><span>works with <b>CMS collections</b></span>`,
    content,
    demoTemplate: 'article',
    origin,
    metaDescription:
      'Generate OG images for Webflow pages and CMS collections using the built-in Open Graph Image URL field. No custom code, no paid add-on.',
  });
}
