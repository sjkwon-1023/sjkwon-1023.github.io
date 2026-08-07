# sjkwon-1023.github.io

My personal site — a technical blog and a portfolio of the things I build.

**→ [sjkwon-1023.github.io](https://sjkwon-1023.github.io)**

## What's here

- **Blog** — notes on problems I ran into while building something, and what the fix
  turned out to be. Mostly the things that cost me an afternoon and aren't in the docs.
- **Projects** — what I've made, with the reasoning behind the choices.
- **About** — who I am and how to reach me.

## Built with

Next.js 16 (App Router) exported as a fully static site, React 19, Tailwind CSS v4, and
MDX for content. Code samples are highlighted at build time with Shiki, so no highlighter
ships to the browser. Every push to `main` builds and deploys to GitHub Pages via GitHub
Actions — nothing built is committed.

## Running it locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export into ./out
npm run lint
```

## Adding content

Posts live in `content/posts/`, projects in `content/projects/`. Copy the `_template.mdx`
sitting in either directory, rename it, and fill in the frontmatter — the filename becomes
the URL, so keep it lowercase with hyphens. Files must be `.mdx` (plain Markdown works
inside it unchanged), and files starting with `_` are templates rather than content.
