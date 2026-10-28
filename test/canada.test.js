// Canada route: eligibility, cash needed, and dataset integrity. Runs under Node or in test/run.html.
const IN_NODE_C = typeof module === 'object' && module.exports;
let ctest, cassert, CE, CC;
if (IN_NODE_C) {
  ctest = require('node:test'); cassert = require('node:assert');
  global.window = global.window || {};
  require('../public/js/canada.js');
  CE = require('../public/js/engine.js');
} else {
  ctest = window.__test; cassert = window.__assert; CE = window.SilkpathEngine;
}
CC = window.SILKPATH_CANADA;
const CA_TODAY = '2026-10-24';
const rowOf = (rows, id) => rows.find((r) => r.u.id === id);

ctest('canada: the Pearson full scholarship is only for students in their final year of high school', () => {
  const p = CC.scholarships.find((s) => s.id === 'pearson');
  cassert.strictEqual(CE.canadaEligible(p, 'finalYear'), true);
  cassert.strictEqual(CE.canadaEligible(p, 'earlierGrad'), false);
  cassert.strictEqual(CE.canadaEligible(p, 'bachelor'), false);
});

ctest('canada: undergraduate entrance awards are closed to people who already hold a degree', () => {
  ['bachelor', 'master'].forEach((sit) => {
    const rows = CE.rankScholarships(CC, sit, CA_TODAY);
    cassert.ok(rows.every((r) => r.eligible === false), sit + ' has no undergraduate award');
    const c = CE.canadaRows(CC, { field: 'arts', situation: sit }, CA_TODAY);
    cassert.ok(c.every((r) => r.awards.length === 0 && r.coverage === 0 || r.coverage === null), sit + ' sees no coverage');
  });
});

ctest('canada: full rides rank first, then by total value', () => {
  const rows = CE.rankScholarships(CC, 'finalYear', CA_TODAY);
  cassert.ok(rows[0].s.fullRide && rows[1].s.fullRide, 'the two full awards lead');
  const third = rows[2].s, fourth = rows[3].s;
  cassert.ok((third.totalMax || 0) >= (fourth.totalMax || 0));
  cassert.ok(rows.slice(0, rows.filter((r) => r.eligible).length).every((r) => r.eligible), 'eligible awards come before ineligible ones');
});

ctest('canada: cash to show = tuition + required fees + CAD 23,448 living funds', () => {
  const rows = CE.canadaRows(CC, { field: 'arts', situation: 'finalYear', sort: 'cash' }, CA_TODAY);
  const mun = rowOf(rows, 'memorial');
  cassert.strictEqual(mun.cash, 22500 + 945 + 23448);
  cassert.strictEqual(rows[0].u.id, 'memorial', 'Memorial is the cheapest to apply to');
  const queens = rowOf(rows, 'queens');
  cassert.strictEqual(queens.cash, 44810 + 2514 + 23448);
  cassert.ok(rows[rows.length - 1].cash === null, 'universities with unknown tuition sort last');
});

ctest('canada: best-case award reduces the cash you must show, a full ride leaves only living funds', () => {
  const rows = CE.canadaRows(CC, { field: 'arts', situation: 'finalYear' }, CA_TODAY);
  const uoft = rowOf(rows, 'uoft'), ab = rowOf(rows, 'ualberta');
  cassert.strictEqual(uoft.full, true);
  cassert.strictEqual(uoft.cashAfterBest, CC.reality.fundsLiving);
  cassert.ok(ab.cashAfterBest < ab.cash && ab.coverage > 0 && ab.coverage < 1);
  const noScholar = rowOf(rows, 'dalhousie');
  cassert.strictEqual(noScholar.coverage, 0);
  cassert.strictEqual(noScholar.cashAfterBest, noScholar.cash);
});

ctest('canada: engineering costs more than arts at the same university', () => {
  const a = rowOf(CE.canadaRows(CC, { field: 'arts', situation: 'finalYear' }, CA_TODAY), 'ubc');
  const e = rowOf(CE.canadaRows(CC, { field: 'eng', situation: 'finalYear' }, CA_TODAY), 'ubc');
  cassert.ok(e.cash > a.cash);
});

ctest('canada: deadlines count down and closed windows are flagged', () => {
  const rows = CE.rankScholarships(CC, 'finalYear', CA_TODAY);
  const mac = rows.find((r) => r.s.id === 'mcmaster-excellence');
  cassert.strictEqual(mac.next.date, '2027-02-19');
  cassert.strictEqual(mac.next.days, CE.daysBetween(CA_TODAY, '2027-02-19'));
  const p = rows.find((r) => r.s.id === 'pearson');
  cassert.ok(p.next && p.next.date === '2026-11-06', 'scholarship application is the nearest open step');
  const later = CE.rankScholarships(CC, 'finalYear', '2026-12-01').find((r) => r.s.id === 'pearson');
  cassert.strictEqual(later.closed, true);
});

ctest('canada dataset: ids, numbers, sources, links between universities and scholarships', () => {
  const ids = new Set(CC.scholarships.map((s) => s.id));
  cassert.strictEqual(ids.size, CC.scholarships.length);
  CC.scholarships.forEach((s) => {
    cassert.ok(s.sources.length && s.sources.every((x) => /^https:\/\//.test(x.url)), s.id + ' https sources');
    cassert.ok(['official', 'partial'].includes(s.conf), s.id + ' conf');
    cassert.ok(Array.isArray(s.for) && s.for.length, s.id + ' for');
    (s.deadlines || []).forEach((d) => cassert.ok(/^\d{4}-\d{2}-\d{2}$/.test(d.date), s.id + ' date'));
    cassert.ok(s.fullRide || s.totalMax || s.annualMax, s.id + ' has a value');
  });
  CC.universities.forEach((u) => {
    u.scholarships.forEach((id) => cassert.ok(ids.has(id), u.id + ' references ' + id));
    ['arts', 'science', 'eng'].forEach((f) => cassert.ok(u.tuition[f] === null || (u.tuition[f] > 5000 && u.tuition[f] < 120000), u.id + ' ' + f));
    cassert.ok(u.sources.every((x) => /^https:\/\//.test(x.url)), u.id + ' sources');
  });
});

ctest('canada directory: 97 Universities Canada members across 11 provinces and territories', () => {
  cassert.strictEqual(CC.members.rows.length, 97);
  cassert.strictEqual(CC.members.provinces.length, 11);
  CC.members.rows.forEach((r) => {
    cassert.ok(r[0] && r[1] >= 0 && r[1] < 11);
    cassert.ok(r[2] === '' || /^https?:\/\//.test(r[2]), r[0] + ' site');
  });
  const names = new Set(CC.members.rows.map((r) => r[0]));
  CC.universities.forEach((u) => {
    const base = u.name.replace(/ \(.*\)$/, '').replace('’', "'");
    cassert.ok([...names].some((n) => n.replace('’', "'").includes(base.replace('Memorial University of Newfoundland', 'Memorial University of Newfoundland')) || base.includes(n.replace('’', "'"))), base + ' is a member university');
  });
});

ctest('canada: a missed early step (school nomination) blocks the later Pearson dates', () => {
  const p = CE.rankScholarships(CC, 'finalYear', CA_TODAY).find((r) => r.s.id === 'pearson');
  cassert.strictEqual(p.blocked, true);
  cassert.ok(p.missed.some((d) => d.date === '2026-10-09'));
  const earlier = CE.rankScholarships(CC, 'finalYear', '2026-09-20').find((r) => r.s.id === 'pearson');
  cassert.strictEqual(earlier.blocked, false, 'before the nomination deadline nothing is missed');
  const mac = CE.rankScholarships(CC, 'finalYear', CA_TODAY).find((r) => r.s.id === 'mcmaster-excellence');
  cassert.strictEqual(mac.blocked, false);
});
