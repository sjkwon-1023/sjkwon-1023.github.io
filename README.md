# sjkwon-1023.github.io

Personal technical blog and portfolio, served at <https://sjkwon-1023.github.io>.

Next.js 16 (App Router) exported as a fully static site and deployed to GitHub Pages
by GitHub Actions. Content is MDX in `content/` — git is the CMS.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, `output: "export"`) |
| UI | React 19, Tailwind CSS v4, `@tailwindcss/typography` |
| Content | MDX via `@next/mdx`, frontmatter via `gray-matter` |
| Code highlighting | `rehype-pretty-code` + Shiki (build time, zero client JS) |
| Deploy | GitHub Actions → GitHub Pages (Pages source = Actions) |

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # static export into ./out
npm run lint    # eslint (runs in CI; a failure blocks deploy)
```

There is no test suite yet. `npm run lint` plus a successful `npm run build` is the
current gate — the same two commands CI runs.

To inspect the exported site as GitHub Pages will serve it:

```bash
npm run build && npx serve out
```

## Writing content

### A post — `content/posts/<slug>.mdx`

The filename is the URL: `content/posts/my-post.mdx` → `/blog/my-post/`.
Slugs must match `^[a-z0-9][a-z0-9-]*$`; the loader throws at build time otherwise.

```yaml
---
title: "Post title"
date: "2026-08-07"        # MUST be quoted, and must be a real calendar date
description: "One or two sentences, used in listings and meta tags."
tags: ["nextjs", "tailwind"]
draft: false              # true → visible in `npm run dev`, absent from the build
---
```

`date` is validated twice at build time and fails loudly on either check. It must be a
quoted string — unquoted, YAML parses it as a date and *silently rolls overflow over*
(`2026-02-30` becomes March 2nd), losing what you meant before the loader ever sees it.
It must also exist on the calendar; a shape-valid `"2026-13-45"` would otherwise reach RSS
as `Invalid Date` and pin itself to the top of every listing, since dates sort lexically.

Tags are free text and are displayed verbatim, but their URL segment is a derived slug
(`slugifyTag` in `src/lib/content.ts`): lowercased, with every run of non-alphanumerics
collapsed to `-`. Routing on the raw tag is what breaks — Next percent-encodes only `/?#`
when writing export paths, so a `c#` tag lands on disk as `c%23` while links single-encode
to `/tags/c%23/`, which servers decode back to `c#` and fail to find. If two tags collapse
to the same slug (`c#` and `c`), the build fails rather than silently dropping one.

### A project — `content/projects/<slug>.mdx`

```yaml
---
title: "Project name"
description: "What it is, in one sentence."
period: "2026.08 –"
role: "Design · Implementation"
stack: ["Next.js", "TypeScript"]
repo: "https://github.com/..."   # optional
demo: "https://..."              # optional
featured: true                   # surfaces it on the home page
order: 1                         # ascending; unset sorts last
---
```

`content/about.mdx` is the body of `/about/`.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` runs lint, builds `out/`, and publishes it.
Nothing built is committed — `out/` and `.next/` are gitignored.

The Pages build source must stay set to **GitHub Actions** (not a branch):

```bash
gh api repos/sjkwon-1023/sjkwon-1023.github.io/pages --jq .build_type   # -> "workflow"
```

## Constraints of a static export

No server exists at runtime, so these are unavailable by construction: SSR, API routes,
Route Handlers other than `GET`, middleware/`proxy.ts`, ISR and `revalidate`, server
actions, `cookies()`/`headers()`, and `next/image` optimization (hence
`images.unoptimized: true`). `redirects()`, `rewrites()`, and `headers()` in
`next.config.ts` are silently ignored — they warn at build and then do nothing, so a
renamed post slug leaves a dead URL. `i18n` is a hard build error.

Two rules follow from this and are easy to violate accidentally:

- Every `[param]` route needs `generateStaticParams()`, or the build fails. Each also sets
  `dynamicParams = false` so unknown slugs render 404 instead of attempting an impossible
  runtime render.
- Every `route.ts`, plus `sitemap.ts` and `robots.ts`, needs `export const dynamic = "force-static"`.
  Without it the build fails with an error that does not mention the missing directive.
- Do not set `cacheComponents` — it is incompatible with the `dynamic = "force-static"`
  those files require.
