# Фитотерапеутско удружење Србије

Static one-page site for the Phytotherapy Association of Serbia, built with Tailwind CSS (via CDN) — no build step required.

## Structure

- `index.html` — the site (self-contained, loads Tailwind + Google Fonts from CDN)
- `logo.svg` — association seal logo, used in the header and hero
- `video.mp4` — background video for the hero section
- `design-source/` — original design-tool export, kept for reference only; not used by the live site

## Local preview

Open `index.html` directly in a browser, or serve it locally:

```bash
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Select the `main` branch and `/ (root)` folder, then **Save**.
5. The site will be published at `https://<username>.github.io/<repo-name>/`.
