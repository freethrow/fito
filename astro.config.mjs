// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL is the public address of the site (e.g. https://fitoterapija.rs).
// Netlify sets URL automatically; locally it falls back to localhost.
const site = process.env.SITE_URL || process.env.URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
