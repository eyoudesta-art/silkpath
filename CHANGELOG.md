# Changelog

## 1.0.1 — 2026-10-23
- Deployed to GitHub Pages; Dependabot action updates merged (checkout 7, configure-pages 6, upload-pages-artifact 5, deploy-pages 5).
- Data corrections found by the link checker: Tongji's Shanghai Government Scholarship now matches the live rules (Category B is tuition + insurance; under 25; ¥600 fee); Tianjin architecture tuition shown as a range with its 2023 sources (¥420 fee, HSK 5, five sketches); Southeast University sources replaced and marked as dated.
- Scholarships now respect age limits (`maxAge`), so the ranking no longer counts awards an applicant is too old for.
- Test command fixed for Node 22 (`node --test test/*.test.js`); link-check tuned for bot-blocking university sites.

## 1.0.0 — 2026-10-22
- First release: 16 universities, 25 bachelor's programmes, cost model, match score, compare, application planner, Ethiopia guide.
- Installable offline PWA, self-hosted fonts, strict CSP, WCAG 2.1 AA fixes, CI, GitHub Pages deploy, weekly source-link check.
