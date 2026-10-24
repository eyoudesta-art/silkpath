# Contributing

The most valuable contribution is **correct, sourced data**.

## Adding or fixing a language programme

1. Edit `public/js/language.js`. Copy a programme for the shape.
2. Fees must come from the university's own page; link it in `sources`. Use `null` for anything unpublished.
3. For each intake set `basis`: `published` (date for this intake is on the page), `recurring` (a yearly or last-year date), or `unknown`.
4. The Chinese name (`zh`) must match the Ministry list exactly — a test checks it.

## Adding or fixing a degree university

1. Edit `public/js/data.js`. Copy an existing entry for the shape.
2. Use only figures you have read on an official page (`.edu.cn`, campuschina.org, csca.cn) and link it under `sources`.
3. Unknown values are `null`. Never estimate fees silently. If a programme is expected but you did not see it, set `confirmed: false`.
4. Update `verifiedOn` when you re-check the whole dataset.
5. Run the checks: `node --test test/*.test.js`, or open `test/run.html` through any local web server.

## Running locally

```bash
python3 -m http.server 4173 --directory public    # http://localhost:4173
python3 scripts/build.py --out dist               # production build
```

No install step. The code is plain HTML, CSS and JavaScript on purpose: free hosts serve it as is, and anyone can read it.

## Principles

- Honest over impressive: show gaps, label estimates, link sources.
- Works on a slow phone: no framework, ~450 KB total, usable offline.
- Accessible: keyboard operable, WCAG 2.1 AA contrast, no colour-only meaning.
- Privacy: no accounts, no tracking, no third-party requests.
