# Silkpath

**Compare Chinese universities for a bachelor's in architecture or art & design — by total cost, scholarships and entry rules.** Built for applicants from Ethiopia. Free to host, free to use, works offline.

- Ranked "sheets" with a match score stamped as a seal, itemised costs (tuition, housing, insurance, Chinese year, living), and self-funded vs partial vs full-scholarship pricing
- Compare up to four universities, plan applications with a shared document checklist
- Ethiopia guide: CSC routes, the new CSCA exam, steps and scam warnings
- Every figure links to its source and carries a confidence label
- Installable PWA, ~450 KB, no tracking, no accounts, no third-party requests

## Run it

```bash
python3 -m http.server 4173 --directory public
# open http://localhost:4173
```

There is no install step and no build step in development.

## Deploy it for free

See **[docs/DEPLOY.md](docs/DEPLOY.md)**. Short version for GitHub Pages:

```bash
git remote add origin https://github.com/YOUR-USER/silkpath.git
git branch -M main
git push -u origin main
# then: repository Settings → Pages → Source: GitHub Actions
```

Cloudflare Pages and Netlify are configured too (`_headers`, `_redirects`, `netlify.toml`).

## How it is built

```
public/                 the site (what gets deployed)
  index.html            shell, CSP, SEO, social cards
  styles.css            drafting-sheet design; light "vellum", dark "blueprint"
  js/data.js            the dataset: universities, fees, scholarships, guide content
  js/engine.js          cost model and scoring (pure functions, unit-tested)
  js/app.js             interface
  js/pwa.js, sw.js      offline support and install prompt
  fonts/, icons/        self-hosted fonts (OFL), app icons, social image
scripts/build.py        stamps the live URL and build id, verifies the output
test/                   engine and dataset tests (Node, or test/run.html in a browser)
.github/workflows/      CI, GitHub Pages deploy, weekly source-link check
docs/                   deployment guide, release checklist
```

Decisions worth knowing: no framework (free hosts serve plain files, the whole app loads in one round trip, and anyone can audit it); network-first service worker so a changed fee is never hidden behind a stale cache; strict Content-Security-Policy with no inline scripts; all dataset text escaped before rendering.

## Honest limits

- **Not "all universities in China."** There are ~3,000 institutions and most publish no comparable English fee data. Silkpath has 16 universities / 25 programmes, each labelled **Official**, **Partly verified** or **Third-party only**. Gaps are shown, never guessed.
- Data checked **22 Oct 2026**. Fees change yearly; 2027 application dates were not published yet.
- "Free Chinese language" is not offered free to everyone anywhere I could verify. The real routes are the CSC prep year, English-taught programmes, or paying ¥3,500–19,800.
- Not confirmed: the 2026/27 Ethiopia CSC notice and agency number, document legalisation rules, CSCA centres in Ethiopia. Ask the Ministry of Education and the Chinese Embassy in Addis Ababa.
- Living costs and the academic-standing score are editorial estimates, labelled as such.

## Contributing

Corrections to fees are the most useful contribution. See [CONTRIBUTING.md](CONTRIBUTING.md). Licence: MIT for the code; fonts are SIL OFL 1.1; the dataset is compiled from the public pages linked beside each entry.
