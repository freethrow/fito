# Deploying on Netlify — Друштво за фитотерапију Србије

How to put the website online on Netlify (free plan), connect it to DatoCMS so
that publishing content updates the site, and attach your own domain.

Before this, do parts 1–4 of **[DATOCMS.md](DATOCMS.md)** (project, tokens,
content structure). You need the **read-only** DatoCMS token from there.

```
GitHub (code) ──► Netlify: npm run build ──► static website
                      ▲
DatoCMS "Publish" ────┘ (build trigger / webhook)
```

---

## Contents

1. [What you need](#1-what-you-need)
2. [Test the site on your computer](#2-test-the-site-on-your-computer)
3. [Put the code on GitHub](#3-put-the-code-on-github)
4. [Create the Netlify site](#4-create-the-netlify-site)
5. [Check the first deploy](#5-check-the-first-deploy)
6. [Rebuild automatically when content is published](#6-rebuild-automatically-when-content-is-published)
7. [Your own domain and HTTPS](#7-your-own-domain-and-https)
8. [Day-to-day: deploys, rollbacks, logs](#8-day-to-day-deploys-rollbacks-logs)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. What you need

| | |
|---|---|
| **Node.js 22.23 or newer** (or 24 LTS) | <https://nodejs.org>. Check with `node -v` |
| **Git** and a **GitHub** account | Netlify builds the site from a GitHub repository |
| **Netlify** account | <https://app.netlify.com/signup>. Sign up **with GitHub**, which makes step 4 easier |
| DatoCMS **read-only token** | DATOCMS.md, part 3.1 |

Cost: everything here fits the free plans.

---

## 2. Test the site on your computer

In the project folder:

```bash
npm install
npm run dev
```

Open <http://localhost:4321>.

- **Without** a `.env` file the site shows the original design text and no articles.
- **With** `DATOCMS_API_TOKEN=…` in `.env` (DATOCMS.md, part 4A) the site shows
  what is published in DatoCMS. The dev server reads DatoCMS **once at
  start**, so restart it (Ctrl+C, `npm run dev`) to see new changes.

Optional: `npm run build` builds the final site into `dist/`, and `npm run preview`
serves it at <http://localhost:4321>. If `npm run build` works on your
computer, it will work on Netlify.

---

## 3. Put the code on GitHub

The repository `freethrow/fito` holds the old static `index.html`. Put the new
project there on a **new branch**, check it, then merge.

```bash
git clone https://github.com/freethrow/fito.git
cd fito
git checkout -b astro-datocms
```

Copy **everything from the project folder** into this `fito` folder **except**
`node_modules/`, `dist/`, `.astro/` and `.env`. Then:

- Delete the old `index.html` (the new site generates its own). You can keep
  `design-source/` for reference, or delete it.
- `logofito.png` and `video.mp4` are already inside the project
  (`src/assets/` and `public/`), so the copies in the root can be deleted.

```bash
git add -A
git status            # .env must NOT be listed
git commit -m "Astro + DatoCMS website"
git push -u origin astro-datocms
```

On GitHub, open the repository → **Compare & pull request** → create it →
**Merge** into `main` when you're ready.

> `.gitignore` already excludes `.env`, `node_modules` and `dist`. Never commit
> `.env`, because it contains your tokens.

---

## 4. Create the Netlify site

1. Log in at <https://app.netlify.com>.
2. **Add new project** (older interface: **Add new site**) → **Import an existing project**.
3. **GitHub** → authorize Netlify if asked → choose the repository **fito**.
   If it isn't listed, click **Configure the Netlify app on GitHub** and give
   access to that repository.
4. **Branch to deploy:** `main` (or `astro-datocms` to test before merging).
5. **Build settings:** filled automatically from `netlify.toml`, so leave them:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Environment variables → Add environment variables → Add a single variable:**
   - Key: `DATOCMS_API_TOKEN`
   - Value: the DatoCMS **read-only** token
   - (Scope / contexts: leave all selected.)
7. Click **Deploy** (or **Deploy fito**).

Netlify now installs, builds and publishes the site. Your site name looks like
`https://wonderful-name-123.netlify.app`. To rename it: **Project configuration
(Site configuration) → General → Project details → Change name**, e.g.
`fitoterapija-srbije` → `https://fitoterapija-srbije.netlify.app`.

> **Never** add the full-access token (`DATOCMS_CMA_TOKEN`) to Netlify. The
> website only needs the read-only one.

**Optional variables** (Project configuration → Environment variables):

| Key | When |
|---|---|
| `SITE_URL` | Not needed on Netlify, which provides the address automatically. Set it only on other hosts. |
| `NODE_VERSION` | Only if a build complains about the Node version: set `24`. |
| `DATOCMS_ENVIRONMENT` | Only if you use DatoCMS sandbox environments. |

Changing a variable has **no effect until the next deploy**: **Deploys →
Trigger deploy → Deploy project**.

---

## 5. Check the first deploy

1. **Deploys**. The newest deploy shows **Published** (green) after 1–2 minutes.
2. Click it → **Deploy log**. Near the end you should see something like
   `[build] 3 page(s) built` (more pages once there are articles).
3. Open the site and check:
   - [ ] the hero video plays and the logo shows
   - [ ] the texts match what is published in DatoCMS
   - [ ] the menu links scroll to the sections, including on a phone (☰ menu)
   - [ ] if you have published articles: **Блог** opens `/clanci`, and each article opens
   - [ ] `/sitemap-index.xml` and `/robots.txt` exist

If the deploy **Failed**, open the log and see part 9.

---

## 6. Rebuild automatically when content is published

The site is static, so it changes only when Netlify builds it again. Connect
DatoCMS so that every **Publish** triggers a build. Choose **one** method.

### Method A — DatoCMS build trigger for Netlify (recommended)

1. In DatoCMS: **Project settings → Build triggers → Add new build trigger** (or **+**).
2. Choose **Netlify**.
3. A Netlify window opens. Click **Grant access / Authorize**.
4. Choose your Netlify site and the branch **`main`**. Save.

Result: when editors publish, DatoCMS starts a Netlify build automatically.
DatoCMS shows the build status at the top of the screen, and there is a
**Build** button to rebuild by hand.

### Method B — Netlify build hook + DatoCMS webhook

1. In Netlify: **Project configuration → Build & deploy → Continuous
   deployment → Build hooks → Add build hook**. Name it `DatoCMS`, branch `main`.
   **Save** and copy the URL (`https://api.netlify.com/build_hooks/…`).
2. In DatoCMS: **Project settings → Webhooks → Add new webhook**.
   - Name: `Netlify rebuild`
   - URL: the build hook URL
   - Events / Triggers: **Record → Publish**, **Record → Unpublish**,
     **Record → Delete**
   - Leave the other settings as they are. Save.

### Test it

Change a text in DatoCMS → **Publish** → in Netlify → **Deploys** a new deploy
starts within seconds ("Triggered by DatoCMS" / "build hook") → after it is
Published, refresh the site.

> Many quick publishes in a row are fine. Netlify queues them and the last
> build always contains the latest content.

---

## 7. Your own domain and HTTPS

1. Netlify → **Domain management → Add a domain** (or **Add custom domain**).
2. Type the domain, e.g. `fitoterapija.rs`, → **Verify** → **Add domain**.
3. Connect it in one of two ways:
   - **Netlify DNS (simplest):** choose *Set up Netlify DNS*. Netlify shows 4
     nameservers (`dns1.p0X.nsone.net`…). Enter them at your domain registrar
     (for `.rs` domains: in your registrar's control panel). Changes take
     a few hours, up to 48 h.
   - **Keep your current DNS:** add the records Netlify shows: an `A` (or
     `ALIAS`) record for `fitoterapija.rs` to Netlify's load balancer, and a
     `CNAME` for `www` → `your-site.netlify.app`.
4. **HTTPS:** under **Domain management → HTTPS** Netlify issues a free Let's
   Encrypt certificate automatically once DNS works. Click **Verify DNS
   configuration** / **Provision certificate** if it doesn't start by itself.
5. Mark the new domain as **Primary domain**. Netlify then redirects the
   `netlify.app` address to it, and the next build uses it for the sitemap,
   social sharing previews and canonical links.
6. Trigger a new deploy once so those links use the new domain.

---

## 8. Day-to-day: deploys, rollbacks, logs

- **See what's happening:** **Deploys** lists every build with who/what
  triggered it (DatoCMS, a Git push, manual).
- **Undo a bad change quickly:** in **Deploys** click an earlier, working
  deploy → **Publish deploy**. The site goes back immediately. Then fix the
  content in DatoCMS (or restore the old version, DATOCMS.md part 11) and publish again.
- **Rebuild by hand:** **Deploys → Trigger deploy → Deploy project** (or the
  **Build** button in DatoCMS).
- **Clear the cache** (rarely needed): **Trigger deploy → Clear cache and deploy project**.
- **Code changes:** every push to the `main` branch on GitHub deploys automatically.
  Pull requests get a **Deploy Preview** link to check before merging.
- **Build minutes:** a build of this site takes well under a minute, far inside the free allowance.

---

## 9. Troubleshooting

| What you see (deploy log or site) | What to do |
|---|---|
| `401` / `Invalid API token` / `Unauthorized` | `DATOCMS_API_TOKEN` in Netlify is wrong or missing. Copy the **read-only** token again (DATOCMS.md 3.1), update the variable, **Trigger deploy**. |
| Error mentioning `allSections` / `Cannot query field` | The DatoCMS structure is missing or different. Run `npm run cms:setup` (DATOCMS.md 4A) or check API keys against DATOCMS.md 4B. |
| `Unsupported engine` / Node version error | Add environment variable `NODE_VERSION` = `24`, redeploy. |
| `npm ERR!` during install | Make sure `package-lock.json` was committed. Try **Clear cache and deploy**. |
| Deploy is green but the site shows the original design text | The token variable isn't set (the site falls back to the design text), or sections aren't published in DatoCMS. Check both, then redeploy. |
| Publishing in DatoCMS doesn't start a deploy | Part 6 isn't set up, or the build trigger points to another branch/site. Check **Project settings → Build triggers / Webhooks** in DatoCMS. Webhooks show a log of recent calls. |
| Article page gives 404 | The article isn't published, or its slug changed. Rebuild after publishing. |
| `Page not found` on the custom domain | DNS is not finished yet (wait), or the domain isn't added in Netlify. |
| Video doesn't play on a phone | Phones in power-saving mode block autoplay. The rest of the hero still works. |

Still stuck: the deploy log almost always names the problem in its last
20 lines. Copy them when asking for help.
