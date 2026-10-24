// Language-route logic and the institutions directory. Runs under Node or in test/run.html.
const IN_NODE_L = typeof module === 'object' && module.exports;
let ltest, lassert, LE, LL, LI, LD;
if (IN_NODE_L) {
  ltest = require('node:test'); lassert = require('node:assert');
  global.window = global.window || {};
  require('../public/js/data.js'); require('../public/js/language.js'); require('../public/js/institutions.js');
  LE = require('../public/js/engine.js');
} else {
  ltest = window.__test; lassert = window.__assert; LE = window.SilkpathEngine;
}
LL = window.SILKPATH_LANG; LI = window.SILKPATH_INSTITUTIONS; LD = window.SILKPATH_DATA;
const LANG_TODAY = '2026-10-24';
const langProg = (id) => LL.programmes.find((p) => p.id === id);

ltest('language cost: Shandong Jianzhu one semester adds up (tuition, estimated app fee, insurance, housing, living)', () => {
  const c = LE.langCost(langProg('sju'), 'semester');
  // 5,000 + 400 est. application + 400 insurance + 583×5 housing = 8,715 university costs; living 1,800×5 = 9,000
  lassert.strictEqual(c.tuition, 5000);
  lassert.strictEqual(c.university, 5000 + 400 + 400 + 583 * 5);
  lassert.strictEqual(c.total, c.university + 9000);
  lassert.strictEqual(c.estimated.app, true);
  lassert.strictEqual(c.estimated.dorm, false);
});

ltest('language cost: one year uses the published yearly fee, or doubles the semester and says so', () => {
  const hit = LE.langCost(langProg('hit'), 'year');
  lassert.strictEqual(hit.tuition, 14600);
  lassert.strictEqual(hit.estimated.year, false);
  const sju = LE.langCost(langProg('sju'), 'year');
  lassert.strictEqual(sju.tuition, 10000);
  lassert.strictEqual(sju.estimated.year, true);
  lassert.ok(hit.months === 10);
});

ltest('pocket money: the CLEC allowance minus city living cost', () => {
  const jinan = LE.pocketMoney(langProg('sju'), 2500), shanghai = LE.pocketMoney(langProg('shu'), 2500);
  lassert.strictEqual(jinan.net, 700);
  lassert.strictEqual(shanghai.net, -700);
});

ltest('CLEC eligibility: age, HSK band, HSKK and recommendation', () => {
  const ready = { age: 22, hskBand: 2, hskk: true, recommendation: true };
  lassert.strictEqual(LE.clecEligibility(ready, 'semester').ok, true);
  lassert.strictEqual(LE.clecEligibility({ ...ready, hskBand: 1 }, 'semester').ok, false);
  lassert.strictEqual(LE.clecEligibility({ ...ready, hskBand: 2 }, 'year').ok, false, 'one year needs 210+');
  lassert.strictEqual(LE.clecEligibility({ ...ready, hskBand: 3, hskk: false }, 'year').ok, true, 'HSKK is only a priority for the language year');
  lassert.strictEqual(LE.clecEligibility({ ...ready, recommendation: false }, 'semester').ok, false);
  const old = LE.clecEligibility({ ...ready, age: 36 }, 'semester');
  lassert.strictEqual(old.blocked, true);
  lassert.strictEqual(LE.clecEligibility({ ...ready, age: 15 }, 'semester').blocked, true);
  lassert.strictEqual(LE.clecEligibility({ ...ready, age: 35 }, 'semester').blocked, false);
});

ltest('routes: with 7 days left, a person with no Chinese is told the March window is too late', () => {
  const routes = LE.findRoutes(LL, { age: 22, hskBand: 0, hskk: false, recommendation: false, duration: 'semester' }, LANG_TODAY);
  const mar = routes.find((r) => r.id === 'clec-mar27');
  lassert.strictEqual(mar.deadline.days, 7);
  lassert.strictEqual(mar.status, 'tooLate');
  const sep = routes.find((r) => r.id === 'clec-sep27');
  lassert.strictEqual(sep.status, 'prepare');
});

ltest('routes: a fully prepared applicant is told to apply now, and the window closes after 31 Oct', () => {
  const me = { age: 21, hskBand: 3, hskk: true, recommendation: true, duration: 'semester' };
  lassert.strictEqual(LE.findRoutes(LL, me, LANG_TODAY).find((r) => r.id === 'clec-mar27').status, 'ready');
  lassert.strictEqual(LE.findRoutes(LL, me, '2026-11-02').find((r) => r.id === 'clec-mar27').status, 'closed');
  lassert.strictEqual(LE.findRoutes(LL, me, LANG_TODAY)[0].kind, 'scholarship', 'a ready scholarship ranks first');
});

ltest('routes: self-funded options carry a total cost and a deadline when one is published', () => {
  const routes = LE.findRoutes(LL, { age: 22, hskBand: 0, duration: 'semester' }, LANG_TODAY);
  const spring = routes.find((r) => r.id === 'self-spring');
  lassert.ok(spring.pick && spring.pick.cost.total > 0);
  lassert.ok(spring.deadline === null || spring.deadline.days >= 0);
});

ltest('ranking: results are sorted, scores are 0–100, closed windows are flagged', () => {
  const res = LE.rankLanguage(LL, { duration: 'semester', term: 'spring' }, LANG_TODAY);
  let prev = 101;
  res.rows.forEach((r) => { lassert.ok(r.score >= 0 && r.score <= 100); lassert.ok(r.score <= prev); prev = r.score; });
  const later = LE.rankLanguage(LL, { duration: 'semester', term: 'spring' }, '2027-02-01');
  lassert.ok(later.rows.some((r) => r.closed), 'by 1 Feb 2027 the 15 Jan deadlines have passed');
  const hidden = LE.rankLanguage(LL, { duration: 'semester', term: 'spring', hideClosed: true }, '2027-02-01');
  lassert.ok(hidden.rows.length < later.rows.length);
});

ltest('ranking: the cheapest published tuition (Shandong Jianzhu) beats the most expensive (Peking) on cost', () => {
  const res = LE.rankLanguage(LL, { duration: 'semester', term: 'any' }, LANG_TODAY);
  const a = res.rows.find((r) => r.p.id === 'sju'), b = res.rows.find((r) => r.p.id === 'pku');
  lassert.ok(a.parts.cost > b.parts.cost);
  lassert.ok(b.cost.total > 2 * a.cost.total / 1.5);
});

ltest('language dataset: unique ids, sane numbers, https sources, valid dates', () => {
  const iso = /^\d{4}-\d{2}(-\d{2})?$/; const ids = new Set();
  LL.programmes.forEach((p) => {
    lassert.ok(!ids.has(p.id), 'duplicate ' + p.id); ids.add(p.id);
    lassert.ok(p.semester > 0 && p.semester < 30000, p.id + ' semester');
    lassert.ok(p.year === null || p.year >= p.semester, p.id + ' year >= semester');
    lassert.ok(p.living >= 1000 && p.living <= 5000, p.id + ' living');
    lassert.ok(['official', 'partial'].includes(p.conf), p.id + ' conf');
    lassert.ok(p.sources.length > 0 && p.sources.every((s) => /^https?:\/\//.test(s.url)), p.id + ' sources');
    p.intakes.forEach((i) => {
      lassert.ok(iso.test(i.start), p.id + ' start'); lassert.ok(['published', 'recurring', 'unknown'].includes(i.basis), p.id + ' basis');
      lassert.ok(i.deadline === null || /^\d{4}-\d{2}-\d{2}$/.test(i.deadline), p.id + ' deadline');
      if (i.basis !== 'unknown') lassert.ok(i.deadline, p.id + ' dated intake needs a deadline');
    });
  });
  LL.hosts.forEach((h) => lassert.ok(/^https?:\/\//.test(h.source), h.zh + ' host source'));
  lassert.ok(LL.scholarship.allowanceMonthly === 2500);
});

ltest('every university named in Silkpath exists in the Ministry list (so profiles link to the directory)', () => {
  const names = new Set(LI.rows.map((r) => r[1]));
  const wanted = [].concat(LL.programmes.map((p) => p.zh), LL.hosts.map((h) => h.zh), LD.universities.map((u) => u.zh));
  const missing = [...new Set(wanted)].filter((n) => !names.has(n));
  lassert.ok(missing.length === 0, 'not in Ministry list: ' + missing.join(', '));
});

ltest('directory: 2,952 institutions, 31 provinces, province totals match, unique codes, valid indices', () => {
  lassert.strictEqual(LI.rows.length, 2952);
  lassert.strictEqual(LI.provinces.length, 31);
  lassert.strictEqual(new Set(LI.rows.map((r) => r[0])).size, LI.rows.length);
  const count = new Array(LI.provinces.length).fill(0);
  LI.rows.forEach((r) => {
    lassert.ok(r[4] >= 0 && r[4] < LI.provinces.length && r[5] >= 0 && r[5] < LI.cities.length);
    lassert.ok(r[6] === 0 || r[6] === 1);
    lassert.ok(/^[a-z0-9]*$/.test(r[2]), 'pinyin must be lowercase ascii: ' + r[1]);
    lassert.ok(r[8] === '' || /^https?:\/\//.test(r[8]), 'site ' + r[1]);
    count[r[4]]++;
  });
  LI.provinces.forEach((p, i) => lassert.strictEqual(count[i], p.n, p.en));
  lassert.strictEqual(LI.rows.filter((r) => r[6] === 0).length, 1412);
  lassert.strictEqual(LI.rows.filter((r) => r[6] === 1).length, 1540);
});

ltest('directory: famous universities are present with English names and the right province', () => {
  const by = (zh) => LI.rows.find((r) => r[1] === zh);
  lassert.strictEqual(by('北京大学')[3], 'Peking University');
  lassert.strictEqual(LI.provinces[by('同济大学')[4]].en, 'Shanghai');
  lassert.strictEqual(LI.provinces[by('哈尔滨工业大学')[4]].en, 'Heilongjiang');
  lassert.strictEqual(LI.cities[by('哈尔滨工业大学')[5]].en, 'Harbin');
  lassert.ok((by('清华大学')[7] & 8) === 8, 'Tsinghua is directly under the Ministry of Education');
});

ltest('routes: scholarship routes lead when achievable, even if you must prepare; "too late" ones sink below paid routes', () => {
  const none = LE.findRoutes(LL, { age: 22, hskBand: 0, hskk: false, recommendation: false, duration: 'semester' }, LANG_TODAY);
  lassert.strictEqual(none[0].id, 'clec-sep27', 'prepare-for-September comes first');
  lassert.strictEqual(none[none.length - 1].id, 'clec-mar27', 'the too-late March window is last');
  const ready = LE.findRoutes(LL, { age: 22, hskBand: 3, hskk: true, recommendation: true, duration: 'semester' }, LANG_TODAY);
  lassert.ok(ready[0].kind === 'scholarship' && ready[1].kind === 'scholarship');
  const closed = LE.findRoutes(LL, { age: 22, hskBand: 3, hskk: true, recommendation: true, duration: 'semester' }, '2026-11-05');
  lassert.strictEqual(closed[0].id, 'clec-sep27');
});

ltest('the directory size shown in the text matches the generated file', () => {
  lassert.strictEqual(LL.directory.count, LI.rows.length);
  lassert.strictEqual(LL.directory.asOf, LI.asOf);
});
