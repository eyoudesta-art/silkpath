# Silkpath

**The easy way to China: learn Chinese for free, with pocket money.** Find your route, see the deadline, compare language fees by province, and search every university and college in China. Built for applicants from Ethiopia. Free to host, free to use, works offline.

**Live:** https://eyoudesta-art.github.io/silkpath/

## What it does

| Screen | Purpose |
|---|---|
| **Start here** | Route finder for the CLEC *International Chinese Language Teachers Scholarship* (formerly the Confucius Institute Scholarship): free tuition, housing and insurance **plus ¥2,500 a month**. Checks age, HSK, HSKK and the recommendation letter, shows what is missing, and counts down to each deadline. |
| **Language** | 22 self-funded Chinese-language programmes with real fees, in 14 provinces. All-in cost, deadline, and "money left each month" if you win the scholarship. 8 universities that published a 2026 scholarship guide (6 confirmed for the language track). |
| **All universities** | The Ministry of Education's official list: **2,952 institutions, 31 provinces**. Search in English, Chinese or pinyin, filter by province, level and ownership, download a CSV. |
| **Degrees** | Art and architecture bachelor's programmes: cost, scholarships, free-Chinese-year routes (CSC). |
| **My plan, Guide, Data** | Document checklist and tracker for language and degree applications; the Ethiopia steps; every source and how the scores work. |

Currency toggles between yuan, US dollar and Ethiopian birr.

## Run it

```bash
python3 -m http.server 4173 --directory public
# open http://localhost:4173
```

No install step and no build step in development.

## Deploy it for free

See **[docs/DEPLOY.md](docs/DEPLOY.md)**. It deploys to GitHub Pages from `main` with the workflow in `.github/workflows/deploy.yml`; Cloudflare Pages and Netlify are configured too.

## How it is built

```
public/                 the site (what gets deployed)
  index.html            shell, CSP, SEO, social cards
  styles.css            drafting-sheet design; light "vellum", dark "blueprint"
  js/language.js        the language route: scholarship rules, programme fees, hosts, steps
  js/institutions.js    GENERATED: all 2,952 institutions (loaded only on the directory page)
  js/data.js            art and architecture degree dataset + guide content
  js/engine.js          cost model, eligibility, route finder, scoring (pure functions, tested)
  js/app.js             interface
  js/pwa.js, sw.js      offline support and install prompt
  fonts/, icons/        self-hosted fonts (OFL), app icons, social image
scripts/build.py                stamps the live URL and build id, verifies the output
scripts/build_institutions.py   regenerates the directory from the Ministry list + Wikidata
test/                   engine, dataset, service-worker and directory tests (Node, or test/run.html)
.github/workflows/      CI, GitHub Pages deploy, weekly source-link check
docs/                   deployment guide, release checklist
```

Decisions worth knowing: no framework (free hosts serve plain files and anyone can audit it); the 390 KB directory is loaded only when opened and cached for offline use; network-first service worker so a changed fee is never hidden behind a stale cache; strict Content-Security-Policy with no inline scripts; all dataset text escaped before rendering.

## Honest limits

- **Directory ≠ endorsement.** All 2,952 institutions are on the Ministry's list, but many do not take international students or offer scholarships. Only the ones marked "Language fees", "Scholarship host" or "Degree data" have fee data here.
- **Fee data is partial.** 22 language programmes (12 read on the university's own page, 10 partly verified) and 16 degree universities. Gaps are shown, never guessed. Checked 24 Oct 2026; fees change yearly and most 2027 deadlines are not published yet.
- **Scholarship dates:** only the March 2027 deadline (31 Oct 2026) is confirmed. The September 2027 window (about 1 Mar – 15 May) is inferred from the 2026 cycle. The full list of scholarship host universities is inside the CLEC portal.
- **Not confirmed for Ethiopia:** the Addis Ababa HSK test centre and dates, Confucius Institute class fees, document legalisation rules, CSCA test centres, the 2026/27 Ethiopia CSC notice and agency number. Ask the Confucius Institute at Addis Ababa University and the Chinese Embassy.
- Living costs and the academic-standing score are editorial estimates, labelled as such. Housing prices that universities do not publish are estimated (¥600/month) and marked.

## Updating the data

- **Language fees:** edit `public/js/language.js` (one object per programme, with source links).
- **Directory:** when the Ministry publishes a new list (usually June), download the `.xls`, then run `python3 scripts/build_institutions.py --moe regular.xls --wikidata wd.json --as-of YYYY-MM-DD`. The query for `wd.json` is in the script header. Update `directory.count/asOf` in `language.js`; a test fails if they disagree.
- Then run the tests: `node --test test/*.test.js` or open `test/run.html`.

## Contributing

Corrections to fees are the most useful contribution. See [CONTRIBUTING.md](CONTRIBUTING.md). Licence: MIT for the code; fonts are SIL OFL 1.1; university lists are compiled from the public sources linked beside each entry (Ministry of Education; Wikidata under CC0).
