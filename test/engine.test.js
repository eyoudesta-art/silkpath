// Runs under Node (`node --test test/*.test.js`) or in a browser via test/run.html.
const IN_NODE = typeof module === 'object' && module.exports;
let test, assert, E, data;
if (IN_NODE) {
  test = require('node:test');
  assert = require('node:assert');
  global.window = {};
  require('../public/js/data.js');
  E = require('../public/js/engine.js');
  data = window.SILKPATH_DATA;
} else {
  test = window.__test; assert = window.__assert; E = window.SilkpathEngine; data = window.SILKPATH_DATA;
}
const uni = (id) => data.universities.find((u) => u.id === id);
const prog = (u, id) => u.programs.find((p) => p.id === id);

test('ZUST English-taught architecture: cost arithmetic', () => {
  const z = uni('zust');
  const bd = E.costFor(z, prog(z, 'zust-arch-en'), { ...E.DEFAULT_PROFILE }, data.defaults);
  // 5 yrs × (21,000 tuition + 6,000 dorm + 800 insurance) + 400 application = 139,400
  assert.strictEqual(bd.universityCosts, 5 * (21000 + 6000 + 800) + 400);
  // living 2,500 × 10 months × 5 years
  assert.strictEqual(bd.livingTotal, 125000);
  assert.strictEqual(bd.total, 139400 + 125000);
  assert.strictEqual(bd.lang.sems, 0);
  assert.strictEqual(bd.firstYear, 400 + 21000 + 6000 + 800 + 25000);
});

test('Chinese-taught with no HSK adds language semesters and living time', () => {
  const t = uni('tongji');
  const bd = E.costFor(t, prog(t, 'tongji-arch-zh'), { ...E.DEFAULT_PROFILE, hsk: 0 }, data.defaults);
  assert.strictEqual(bd.lang.sems, 2);
  assert.strictEqual(bd.lang.assumed, true);
  assert.strictEqual(bd.lang.fee, 14500 + 19350);
  assert.strictEqual(bd.dormEstimated, true);
  const withHsk = E.costFor(t, prog(t, 'tongji-arch-zh'), { ...E.DEFAULT_PROFILE, hsk: 4 }, data.defaults);
  assert.strictEqual(withHsk.lang.sems, 0);
  assert.ok(withHsk.total < bd.total);
});

test('HSK gap of one level needs one semester', () => {
  const j = uni('jnu');
  assert.strictEqual(E.semestersNeeded(prog(j, 'jnu-design-zh'), 3).sems, 1);
  assert.strictEqual(E.semestersNeeded(prog(j, 'jnu-design-zh'), 4).sems, 0);
  assert.strictEqual(E.semestersNeeded(prog(j, 'jnu-design-zh'), 1).sems, 2);
});

test('"both" mode only returns universities with architecture AND art', () => {
  const res = E.rank(data, { field: 'both' }, '2026-10-22');
  assert.ok(res.rows.length >= 3);
  res.rows.forEach((r) => {
    const fields = new Set(r.uni.programs.map((p) => p.field));
    assert.ok(fields.has('architecture') && fields.has('art'), r.uni.id);
  });
  assert.ok(res.rows.find((r) => r.uni.id === 'zust'));
  assert.ok(!res.rows.find((r) => r.uni.id === 'jnu'), 'design-only school must be excluded in both-mode');
});

test('unknown tuition sinks to the bottom of cost score and is flagged', () => {
  const res = E.rank(data, { field: 'architecture' }, '2026-10-22');
  const scut = res.rows.find((r) => r.uni.id === 'scut');
  assert.ok(scut);
  assert.strictEqual(scut.primary.tuitionKnown, false);
  assert.strictEqual(scut.parts.cost, 0);
  assert.ok(scut.checks.some((c) => /Tuition/.test(c.text)));
});

test('CSC eligibility: age 25+ or an existing bachelor removes the CSC score', () => {
  assert.strictEqual(E.cscEligibility({ age: 22 }).ok, true);
  assert.strictEqual(E.cscEligibility({ age: 25 }).ok, false);
  assert.strictEqual(E.cscEligibility({ age: 21, hasBachelor: true }).ok, false);
  const s = uni('scut');
  const young = E.scholarshipScore(s, { age: 20 });
  const old = E.scholarshipScore(s, { age: 30 });
  assert.ok(young > old);
});

test('budget cap penalises over-budget first-year cost', () => {
  const free = E.rank(data, { field: 'art' }, '2026-10-22');
  const capped = E.rank(data, { field: 'art', budgetUsd: 3000 }, '2026-10-22');
  const caa1 = free.rows.find((r) => r.uni.id === 'caa');
  const caa2 = capped.rows.find((r) => r.uni.id === 'caa');
  assert.strictEqual(caa2.overBudget, true);
  assert.ok(caa2.parts.cost <= caa1.parts.cost);
});

test('deadline helper: upcoming vs last cycle, and SCUT fast track', () => {
  const s = uni('scut');
  const d = E.nextDeadline(s, '2026-10-22');
  assert.strictEqual(d.close, '2026-12-31');
  assert.strictEqual(d.days, 70);
  const ft = E.fastTrackInfo(s, '2026-10-22');
  assert.strictEqual(ft.status, 'verified');
  assert.strictEqual(ft.days, 70);
  const after = E.nextDeadline(s, '2027-01-05');
  assert.strictEqual(after.lastCycle, true);
});

test('"both" mode ranks on the average of the cheapest architecture and art options', () => {
  const res = E.rank(data, { field: 'both' }, '2026-10-22');
  const z = res.rows.find((r) => r.uni.id === 'zust');
  assert.ok(z.byField.architecture && z.byField.art);
  assert.strictEqual(Math.round(z.rankTotal), Math.round((z.byField.architecture.total + z.byField.art.total) / 2));
});

test('scores are 0–100 and sorted descending', () => {
  const res = E.rank(data, { field: 'both' }, '2026-10-22');
  let prev = 101;
  res.rows.forEach((r) => {
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.ok(r.score <= prev);
    prev = r.score;
  });
});

test('dataset sanity: every university has sources, programs and ids are unique', () => {
  const ids = new Set();
  data.universities.forEach((u) => {
    assert.ok(!ids.has(u.id)); ids.add(u.id);
    assert.ok(u.sources.length > 0, u.id + ' has sources');
    assert.ok(u.programs.length > 0, u.id + ' has programs');
    assert.ok(['official', 'partial', 'agency'].includes(u.confidence));
    u.programs.forEach((p) => assert.ok(['architecture', 'art'].includes(p.field) && ['zh', 'en'].includes(p.lang)));
  });
});

test('dataset validation: urls, dates, numbers, enums', () => {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const money = (v) => v === null || v === undefined || (typeof v === 'number' && v >= 0 && Number.isFinite(v));
  const SCH = ['csc', 'university', 'provincial', 'municipal'];
  const COVERS = ['full', 'tuition', 'partial'];
  const FT = ['verified', 'reported', 'none'];
  assert.ok(isoDate.test(data.verifiedOn));
  data.universities.forEach((u) => {
    const id = u.id;
    assert.ok(/^[a-z0-9-]+$/.test(id), id + ' id format');
    assert.ok(u.name && u.zh && u.city && u.province, id + ' names');
    assert.ok(u.living > 0 && u.strength >= 1 && u.strength <= 5, id + ' living/strength');
    [u.site, u.apply].forEach((x) => assert.ok(/^(https?:\/\/|mailto:)/.test(x), id + ' bad url ' + x));
    u.sources.forEach((s) => { assert.ok(/^https:\/\//.test(s.url), id + ' source must be https: ' + s.url); assert.ok(s.label, id + ' source label'); });
    const pids = new Set();
    u.programs.forEach((p) => {
      assert.ok(!pids.has(p.id), id + ' duplicate program ' + p.id); pids.add(p.id);
      assert.ok(money(p.tuition) && money(p.tuitionMax), p.id + ' tuition');
      if (p.tuitionMax != null) assert.ok(p.tuitionMax >= p.tuition, p.id + ' tuitionMax >= tuition');
      assert.ok(Number.isInteger(p.years) && p.years >= 3 && p.years <= 6, p.id + ' years');
      assert.strictEqual(typeof p.confirmed, 'boolean', p.id + ' confirmed flag');
      if (p.lang === 'zh' && p.hsk != null) assert.ok(p.hsk >= 1 && p.hsk <= 6, p.id + ' hsk');
    });
    const f = u.fees;
    ['application', 'insurance', 'dormShared', 'dormSingle'].forEach((k) => assert.ok(money(f[k]), id + ' fees.' + k));
    if (f.languageSemesters) f.languageSemesters.forEach((v) => assert.ok(v > 0, id + ' language fee'));
    u.scholarships.forEach((s) => {
      assert.ok(SCH.includes(s.kind) && COVERS.includes(s.covers), id + ' scholarship enums: ' + s.name);
      assert.ok(money(s.amount), id + ' scholarship amount');
      if (s.pct != null) assert.ok(s.pct > 0 && s.pct <= 100, id + ' pct');
    });
    (u.deadlines || []).forEach((d) => {
      assert.ok(isoDate.test(d.close) && (!d.open || isoDate.test(d.open)), id + ' deadline dates');
      if (d.open) assert.ok(d.open <= d.close, id + ' deadline order');
    });
    assert.ok(FT.includes(u.fastTrack.status), id + ' fastTrack');
    if (u.fastTrack.status === 'verified') assert.ok(isoDate.test(u.fastTrack.deadline), id + ' verified fast track needs a deadline');
    assert.ok(['confirmed', 'check'].includes(u.csc.status), id + ' csc.status');
  });
});

test('freshness: data older than 400 days must be re-verified', () => {
  const age = E.daysBetween(data.verifiedOn, E.isoDay(new Date()));
  assert.ok(age < 400, 'Dataset was last verified ' + age + ' days ago — re-check fees and update verifiedOn');
});
