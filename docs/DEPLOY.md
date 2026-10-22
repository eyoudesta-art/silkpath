# Deploying Silkpath for free

Silkpath is a static site: no server, no database, no paid service. `python3 scripts/build.py` turns `public/` into a `dist/` folder, and any static host can serve it. Pick one.

| Host | Cost | Best for | Needs |
|---|---|---|---|
| **GitHub Pages** (recommended) | Free for public repositories | Zero config, auto-deploy on every push | GitHub account |
| **Cloudflare Pages** | Free tier | Fast in Africa, custom headers, analytics | Cloudflare account |
| **Netlify** | Free tier | Drag-and-drop with no Git | Netlify account |

## A. GitHub Pages (recommended)

The workflow in `.github/workflows/deploy.yml` tests, builds with the real URL, and publishes.

1. Create an empty **public** repository on github.com, for example `silkpath`. Do not add a README.
2. From this folder:
   ```bash
   git remote add origin https://github.com/YOUR-USER/silkpath.git
   git branch -M main
   git push -u origin main
   ```
3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab. When "Deploy to GitHub Pages" turns green, the site is live at `https://YOUR-USER.github.io/silkpath/`.

Every later `git push` to `main` redeploys automatically. Pull requests run the tests only.

## B. Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick the repository.
2. Build command: `python3 scripts/build.py --out dist --site-url https://YOUR-PROJECT.pages.dev`
3. Build output directory: `dist`
4. Save and deploy. `_headers` and `_redirects` in the build are applied automatically (security headers, caching, 404 page).

## C. Netlify

- **With Git:** New site → Import from Git. `netlify.toml` already holds the build command and publish folder.
- **Without Git:** run `python3 scripts/build.py --out dist --site-url https://YOUR-NAME.netlify.app`, then drag the `dist` folder onto app.netlify.com/drop.

## Custom domain

Add the domain in the host's settings and follow its DNS instructions. Then rebuild with `--site-url https://yourdomain/` (GitHub Pages: add the domain in Settings → Pages; the workflow picks the new base URL up automatically).

## Before you tell people

- [ ] The site opens over `https://`
- [ ] Discover shows results; open a university and add it to a plan
- [ ] Install works (Chrome menu → Install app) and the app opens offline after one visit
- [ ] Paste the link into WhatsApp or Telegram and check the preview card shows
- [ ] Every figure you promote has been checked on the university's page (the dataset is dated)

## Rolling back

GitHub Pages: `git revert <bad-commit>` and push; the workflow redeploys the previous state in about a minute. Cloudflare and Netlify keep past deployments you can re-publish with one click. Visitors pick up the fix on their next online visit because the service worker fetches pages network-first and each build has its own cache.

## Keeping it healthy (all free)

- **Broken source links:** the weekly workflow `link-check.yml` opens an issue.
- **Uptime:** a free UptimeRobot monitor on the site URL.
- **Traffic:** Cloudflare Web Analytics or GoatCounter are privacy-friendly. Both need a script tag, so add their domain to `script-src` and `connect-src` in the CSP in `public/index.html` and `public/_headers`. Nothing is collected by default.
- **Stale data:** the test suite fails once `verifiedOn` is over 400 days old. Re-verify each October.
