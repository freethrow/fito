# Друштво за фитотерапију Србије — website

The one-page design from this repository, rebuilt with **[Astro](https://astro.build)**
and **[DatoCMS](https://www.datocms.com)**:

- **Home page** — every part (hero, О нама, Митологија … Контакт) is a named
  **Секција** record in DatoCMS. Sections not (yet) in DatoCMS show the
  original design text.
- **Чланци** (`/clanci`) — articles in Serbian from DatoCMS. With no published
  articles, nothing about articles appears on the site.

| Guide | |
|---|---|
| **[DATOCMS.md](DATOCMS.md)** | everything about DatoCMS: project, tokens, structure (automatic or by hand), editing sections, writing articles, images, troubleshooting |
| **[NETLIFY.md](NETLIFY.md)** | deploying on Netlify, automatic rebuilds on publish, custom domain |

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | local development server |
| `npm run build` | builds the static site into `dist/` |
| `npm run preview` | serves `dist/` locally |
| `npm run check` | TypeScript / Astro checks |
| `npm run cms:setup` | creates the DatoCMS models and the 13 sections (once; safe to repeat) |

## Structure

```
src/
  lib/sections.ts       section keys, menu labels, original design text (fallback)
  lib/datocms.ts        GraphQL query to DatoCMS
  lib/content.ts        loads sections + articles once per build
  pages/index.astro     the home page, section by section
  pages/clanci/         articles list and article pages
  components/           header, contact band, cards
  styles/global.css     Tailwind theme (colours from the design)
scripts/datocms-setup.ts  creates the DatoCMS structure
public/                 video, favicons, social image
```

Heading font: **Literata** instead of Newsreader — Newsreader has no Cyrillic
letters, so the original headings fell back to a system font. Fonts are
self-hosted.
