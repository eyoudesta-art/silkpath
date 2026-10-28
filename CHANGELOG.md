# Changelog

## 1.2.0 — 2026-10-28
- **Correction:** the CLEC application address `cis.chinese.cn` no longer works (returns "Not Found"). The app now points to `www.chinese.cn`, as named in Shanghai Jiao Tong University's 2026 notice, and keeps scholarships@chinese.cn as the fallback.
- Added the three-year rule: someone who received a similar scholarship in the last three years generally cannot get the one-semester or one-year award again.
- Removed the Kunming University of Science and Technology language programme: its source page is gone and the 2026 brochure says beginners must first complete a one-year prep programme. Now 21 programmes in 13 provinces (12 read on the university's own page, 9 partly verified).
- Shanghai Jiao Tong host source replaced with its live 2026 notice.
- **Canada page:** permit and funds reality check from IRCC; 10 undergraduate scholarships (full rides, need-based, automatic) with eligibility by situation and deadline logic that notices a missed nomination step; tuition and "cash to show" for 12 universities (CA$ with USD and birr); Mastercard Foundation partner status; all 97 Universities Canada members by province.
- Honest framing: refusal rate, cap and proof-of-funds up front; undergraduate awards marked closed to people who already hold a degree.
- 11 new tests (46 total).

## 1.1.0 — 2026-10-24
Refocused on the easiest way to China: learning Chinese for free, with pocket money.
- **Start here:** route finder. Checks age, HSK level, HSKK and recommendation against the CLEC International Chinese Language Teachers Scholarship (formerly the Confucius Institute Scholarship: free tuition, housing and insurance plus ¥2,500 a month), shows what is missing, and counts down to the deadline (March 2027 window closes 31 Oct 2026).
- **Language programmes:** 22 programmes in 14 provinces with fees from university pages (12 read on the university's own page, 10 partly verified), all-in cost, "money left each month" under the scholarship, deadlines labelled published / repeated / unknown, 8 universities that published a 2026 scholarship guide (6 confirmed for the language track).
- **All universities:** the Ministry of Education's official list — all 2,952 regular institutions in 31 provinces, searchable in English, Chinese or pinyin; filters; CSV download; English names and websites for most (Wikidata, CC0).
- Art and architecture degree finder kept as "Degrees". Plan and guide now cover the language route.
- New tests: language costs, eligibility, route ordering, directory integrity (19 → 36 tests).

## 1.0.1 — 2026-10-23
- Deployed to GitHub Pages; Dependabot action updates merged (checkout 7, configure-pages 6, upload-pages-artifact 5, deploy-pages 5).
- Data corrections found by the link checker: Tongji's Shanghai Government Scholarship now matches the live rules (Category B is tuition + insurance; under 25; ¥600 fee); Tianjin architecture tuition shown as a range with its 2023 sources (¥420 fee, HSK 5, five sketches); Southeast University sources replaced and marked as dated.
- Scholarships now respect age limits (`maxAge`), so the ranking no longer counts awards an applicant is too old for.
- Test command fixed for Node 22 (`node --test test/*.test.js`); link-check tuned for bot-blocking university sites.

## 1.0.0 — 2026-10-22
- First release: 16 universities, 25 bachelor's programmes, cost model, match score, compare, application planner, Ethiopia guide.
- Installable offline PWA, self-hosted fonts, strict CSP, WCAG 2.1 AA fixes, CI, GitHub Pages deploy, weekly source-link check.
