// SnapOG — Tutorial pages for static site generators (/docs/hugo, /docs/jekyll,
// /docs/astro). Shares the "Carbon Terminal" shell, steps, and code blocks with
// tutorial-pages.ts — this file only adds platform-specific content.

import { tutorialShell, step, codeBlock } from './tutorial-pages';

// ─── /docs/hugo — Hugo sites ─────────────────────────────────────────────────

export function hugoTutorialPage(origin: string): string {
  const partialSnippet = `{{/* layouts/partials/head.html — with your other meta tags */}}
<meta property="og:image"
      content="${origin}/og?title={{ .Title | urlquery }}&domain=yoursite.com&template=blog&key=sk_YOUR_KEY" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image"
      content="${origin}/og?title={{ .Title | urlquery }}&domain=yoursite.com&template=blog&key=sk_YOUR_KEY" />`;

  const overrideSnippet = `# Never edit the theme directly — shadow its partial instead.
# Your site's layouts/ wins over themes/<name>/layouts/.
cp themes/YOUR_THEME/layouts/partials/head.html layouts/partials/head.html`;

  const content = [
    step('01', 'Get a free API key', `
          <p>
            Email in, key out at <a href="/register">/register</a>. Create a key named
            <code>hugo-site</code> so you can rotate it later without touching other
            projects. Free tier: 100 fresh images/month; cached images are free.
          </p>`),
    step('02', 'Shadow your theme’s head partial', `
          <p>
            Hugo resolves templates from your site’s <code>layouts/</code> directory
            before the theme’s, so copy the head partial up and edit the copy —
            theme updates won’t wipe your change:
          </p>
          ${codeBlock('shell', overrideSnippet)}
          <p>
            Theme names the file differently? Look for the partial that renders
            <code>&lt;head&gt;</code> content — commonly <code>head.html</code>,
            <code>head/meta.html</code> or <code>meta.html</code>.
          </p>`),
    step('03', 'Add the meta tags, URL-encoded by Hugo', `
          <p>
            Hugo’s built-in <code>urlquery</code> function percent-encodes the title
            for you — spaces, ampersands, CJK characters all just work:
          </p>
          ${codeBlock('Go template — head partial', partialSnippet)}
          <p>
            If your theme embeds Hugo’s internal template
            (<code>{{ template "_internal/opengraph.html" . }}</code>), place these tags
            <strong>above</strong> it — crawlers take the first
            <code>og:image</code> they find, so the generated card wins. Prefer real
            page images when set? Wrap the snippet in
            <code>{{ if not .Params.images }} … {{ end }}</code> so SnapOG only fills
            the gaps.
          </p>`),
    step('04', 'Verify before you publish', `
          <p>
            Run <code>hugo server</code>, view source on any page, and open the
            <code>og:image</code> URL — you should get a 1200×630 PNG with that page’s
            title. Then confirm the card with
            <a href="https://www.opengraph.xyz" rel="noopener" target="_blank">opengraph.xyz</a>
            or the platform debuggers. Retitling a page changes the image URL, so
            crawler caches bust themselves.
          </p>`),
  ].join('');

  return tutorialShell({
    slug: 'hugo',
    pageTitle: 'Dynamic OG images for Hugo sites — no build step',
    manRef: 'HUGO(1)',
    h1: 'Dynamic OG images for <em>Hugo</em> sites',
    lede: `Hugo builds static HTML — it can’t render a unique share image per page
      at build time without extra tooling. SnapOG does it at request time instead:
      one partial edit, and every page gets its own 1200×630 card.`,
    facts: `<span>time <b>~5 min</b></span><span>build step <b>none</b></span><span>works with <b>any Hugo theme</b></span>`,
    content,
    demoTemplate: 'blog',
    origin,
    metaDescription:
      'Add dynamic Open Graph images to a Hugo site with one head-partial edit. No build-time tooling, URL-encoding handled by Hugo’s urlquery.',
  });
}

// ─── /docs/jekyll — Jekyll & GitHub Pages ────────────────────────────────────

export function jekyllTutorialPage(origin: string): string {
  const headSnippet = `{% comment %} _includes/custom-head.html {% endcomment %}
<meta property="og:image"
      content="${origin}/og?title={{ page.title | default: site.title | uri_escape }}&domain=yoursite.com&template=article&key=sk_YOUR_KEY" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image"
      content="${origin}/og?title={{ page.title | default: site.title | uri_escape }}&domain=yoursite.com&template=article&key=sk_YOUR_KEY" />`;

  const content = [
    step('01', 'Get a free API key', `
          <p>
            Register at <a href="/register">/register</a> — email only, instant key.
            This works on GitHub Pages too: the tag is plain HTML in your built
            output, no plugin or custom Ruby required.
          </p>`),
    step('02', 'Find where your theme’s head lives', `
          <p>
            Using <strong>minima</strong> (the default theme)? It ships an empty
            <code>_includes/custom-head.html</code> hook for exactly this — create
            that file in your site and minima pulls it into <code>&lt;head&gt;</code>
            automatically. On other themes, copy the theme’s
            <code>_includes/head.html</code> into your own <code>_includes/</code>
            (your copy shadows the theme’s) and edit it there.
          </p>`),
    step('03', 'Paste the meta tags, encoded by Liquid', `
          <p>
            Jekyll’s <code>uri_escape</code> filter percent-encodes the title —
            spaces, ampersands and punctuation are handled for you. The
            <code>default:</code> filter keeps the homepage covered:
          </p>
          ${codeBlock('Liquid — custom-head.html', headSnippet)}`),
    step('04', 'Know how this plays with jekyll-seo-tag', `
          <p>
            If your site uses the <code>{% seo %}</code> tag (most do), it outputs its
            own <code>og:image</code> — but only for pages with an
            <code>image:</code> in their front matter. Crawlers take the first
            <code>og:image</code> tag they find, so make sure our snippet renders
            <strong>above</strong> <code>{% seo %}</code>. Want hand-picked images to
            win where they exist? Wrap the snippet in
            <code>{% unless page.image %} … {% endunless %}</code>.
          </p>`),
    step('05', 'Verify locally, then push', `
          <p>
            Run <code>bundle exec jekyll serve</code>, view source, and open the
            <code>og:image</code> URL — you should get a PNG with the post’s title.
            After pushing, run a post URL through
            <a href="https://www.opengraph.xyz" rel="noopener" target="_blank">opengraph.xyz</a>
            or the platform debuggers to confirm the card.
          </p>`),
  ].join('');

  return tutorialShell({
    slug: 'jekyll',
    pageTitle: 'Auto OG images for Jekyll and GitHub Pages blogs',
    manRef: 'JEKYLL(1)',
    h1: 'Auto OG images for <em>Jekyll</em> &amp; GitHub Pages',
    lede: `No plugin, no Ruby, no build change — one Liquid include and every post
      gets its own generated share card, even on plain GitHub Pages where custom
      plugins aren’t allowed.`,
    facts: `<span>time <b>~5 min</b></span><span>plugin <b>none</b></span><span>works on <b>GitHub Pages</b></span>`,
    content,
    demoTemplate: 'article',
    origin,
    metaDescription:
      'Add auto-generated Open Graph images to Jekyll or GitHub Pages with one Liquid include. No plugin needed, titles encoded via uri_escape.',
  });
}

// ─── /docs/astro — Astro sites ───────────────────────────────────────────────

export function astroTutorialPage(origin: string): string {
  const layoutSnippet = `---
// src/layouts/Layout.astro
interface Props { title: string; description?: string }
const { title, description } = Astro.props;

const ogImage =
  \`${origin}/og?title=\${encodeURIComponent(title)}\` +
  \`&domain=yoursite.com&key=sk_YOUR_KEY\`;
---
<html lang="en">
  <head>
    <title>{title}</title>
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={ogImage} />
    <slot name="head" />
  </head>
  <body><slot /></body>
</html>`;

  const collectionSnippet = `---
// src/pages/blog/[...slug].astro — content collection pages
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
---
<Layout title={post.data.title} description={post.data.description}>
  <!-- the layout builds the og:image URL from the title — nothing else to do -->
</Layout>`;

  const content = [
    step('01', 'Get a free API key', `
          <p>
            Grab one at <a href="/register">/register</a> — email only, instant key,
            100 fresh images/month free. Cached images don’t count against the
            quota, so published pages never break.
          </p>`),
    step('02', 'Build the image URL in your layout', `
          <p>
            Your layout already receives the page title as a prop — build the
            <code>og:image</code> URL right there. <code>encodeURIComponent</code>
            handles spaces, ampersands and unicode:
          </p>
          ${codeBlock('Astro — src/layouts/Layout.astro', layoutSnippet)}
          <p>
            This works identically for static builds, <code>output: 'server'</code>,
            and hybrid rendering — the URL is just a string in your HTML.
          </p>`),
    step('03', 'Content collections come along for free', `
          <p>
            Because the layout owns the tag, every page that passes a
            <code>title</code> is covered — including collection entries:
          </p>
          ${codeBlock('Astro — collection page', collectionSnippet)}`),
    step('04', 'Why not satori / astro-og-canvas?', `
          <p>
            Build-time generators like <code>astro-og-canvas</code> or
            satori-based setups are great — if you want to own the template code,
            fonts, and the extra build dependency. SnapOG is the zero-build
            alternative: no packages, no font files in your repo, works the same in
            SSR where build-time generation can’t run, and changing a design means
            changing a query parameter.
          </p>`),
    step('05', 'Verify before you ship', `
          <p>
            Run <code>npm run dev</code>, view source, and open the
            <code>og:image</code> URL — you should get a 1200×630 PNG with the page’s
            title. Then confirm the card with
            <a href="https://www.opengraph.xyz" rel="noopener" target="_blank">opengraph.xyz</a>
            or the platform debuggers.
          </p>`),
  ].join('');

  return tutorialShell({
    slug: 'astro',
    pageTitle: 'OG images for Astro without satori or build plugins',
    manRef: 'ASTRO(1)',
    h1: 'OG images for <em>Astro</em> — no satori, no build plugins',
    lede: `Skip the build-time image pipeline. Build the og:image URL in your
      layout’s frontmatter and every page — static, SSR, or content collection —
      gets its own generated 1200×630 card.`,
    facts: `<span>time <b>~5 min</b></span><span>dependencies <b>zero</b></span><span>works with <b>static + SSR</b></span>`,
    content,
    demoTemplate: 'default',
    origin,
    metaDescription:
      'Add Open Graph images to an Astro site with zero dependencies: build the og:image URL in your layout frontmatter. Works with SSR and content collections.',
  });
}
