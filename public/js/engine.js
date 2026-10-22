/* Silkpath engine — pure functions, no DOM. Works in the browser (window.SilkpathEngine) and Node (tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SilkpathEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_WEIGHTS = { cost: 35, scholarship: 20, language: 15, quality: 10, speed: 10, ease: 10 };
  var LANG_FEE_EST = 8000; // per semester, used only when a university publishes no language fee

  var DEFAULT_PROFILE = {
    field: 'both',          // 'architecture' | 'art' | 'both'
    langPref: 'any',        // 'any' | 'en' | 'zh'
    hsk: 0,                 // 0–6
    englishOk: false,       // has IELTS/TOEFL or an English-medium letter
    budgetUsd: null,        // first-year cash ceiling in USD, null = no cap
    dorm: 'shared',         // 'shared' | 'single'
    hasPortfolio: false,
    age: null,
    hasBachelor: false,
    includeUnconfirmed: true,
    weights: DEFAULT_WEIGHTS
  };

  function num(v) { return typeof v === 'number' && isFinite(v); }
  function round(v) { return Math.round(v); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------- eligibility for CSC undergraduate awards ---------- */
  function cscEligibility(profile) {
    if (num(profile.age) && profile.age >= 25) return { ok: false, reason: 'CSC undergraduate applicants must be under 25.' };
    if (profile.hasBachelor) return { ok: false, reason: 'The CSC undergraduate category is for high-school graduates. If you already hold a bachelor’s degree, expect to be directed to the master’s category — confirm with the university.' };
    return { ok: true, reason: '' };
  }

  /* ---------- cost model ---------- */
  function semestersNeeded(program, userHsk) {
    if (program.lang !== 'zh') return { sems: 0, req: null, assumed: false };
    var assumed = !num(program.hsk);
    var req = assumed ? 4 : program.hsk;
    var gap = req - (userHsk || 0);
    return { sems: gap <= 0 ? 0 : (gap === 1 ? 1 : 2), req: req, assumed: assumed };
  }

  function costFor(uni, program, profile, defaults) {
    var D = defaults;
    var months = D.academicMonths;
    var f = uni.fees || {};

    var tuitionKnown = num(program.tuition);
    var tuitionYear = tuitionKnown ? (num(program.tuitionMax) ? program.tuitionMax : program.tuition) : 0;

    var dormEstimated = false, dormYear;
    var wantSingle = profile.dorm === 'single';
    if (wantSingle && num(f.dormSingle)) dormYear = f.dormSingle;
    else if (num(f.dormShared)) dormYear = f.dormShared;
    else if (num(f.dormSingle)) dormYear = f.dormSingle;
    else { dormYear = D.dormEst; dormEstimated = true; }

    var insurance = num(f.insurance) ? f.insurance : D.insurance;
    var applicationEstimated = !num(f.application);
    var application = applicationEstimated ? D.applicationEst : f.application;
    var livingYear = uni.living * months;

    var lang = semestersNeeded(program, profile.hsk);
    var langFee = 0, langEstimated = false;
    if (lang.sems > 0) {
      if (f.languageSemesters && f.languageSemesters.length) {
        for (var i = 0; i < lang.sems; i++) langFee += f.languageSemesters[Math.min(i, f.languageSemesters.length - 1)];
      } else { langFee = LANG_FEE_EST * lang.sems; langEstimated = true; }
    }
    var langFrac = lang.sems / 2; // fraction of an academic year spent on the language prep
    var runningYear = dormYear + insurance + livingYear;
    var langExtra = langFrac * runningYear;

    var degreeCost = program.years * (tuitionYear + dormYear + insurance);
    var livingTotal = program.years * livingYear + langFrac * livingYear;
    var universityCosts = application + langFee + langFrac * (dormYear + insurance) + degreeCost;
    var total = universityCosts + livingTotal;
    var firstYear = application + langFee + langFrac * runningYear + (1 - Math.min(1, langFrac)) * (tuitionYear + runningYear);

    var bd = {
      program: program,
      tuitionYear: tuitionYear, tuitionKnown: tuitionKnown, tuitionRange: num(program.tuitionMax) ? [program.tuition, program.tuitionMax] : null,
      years: program.years,
      dormYear: dormYear, dormEstimated: dormEstimated,
      insurance: insurance, application: application, applicationEstimated: applicationEstimated,
      livingYear: livingYear,
      lang: { sems: lang.sems, req: lang.req, assumed: lang.assumed, fee: langFee, estimated: langEstimated },
      universityCosts: round(universityCosts), livingTotal: round(livingTotal),
      total: round(total), firstYear: round(firstYear)
    };
    bd.scenarios = scenarios(uni, bd, profile, D);
    return bd;
  }

  function scenarios(uni, bd, profile, D) {
    var self = bd.total;
    // partial: best numeric non-CSC award
    var best = null;
    (uni.scholarships || []).forEach(function (s) {
      if (s.kind === 'csc') return;
      var perYear = null;
      if (num(s.amount)) perYear = s.amount;
      else if (num(s.pct) && bd.tuitionKnown) perYear = bd.tuitionYear * s.pct / 100;
      if (perYear === null) return;
      var yrs = s.years === 'all' ? bd.years : (num(s.years) ? s.years : 1);
      var cap = bd.tuitionYear * bd.years + (s.name && /accommodation/i.test(s.note || '') ? bd.dormYear * bd.years : 0);
      var saving = Math.min(perYear * yrs, cap || perYear * yrs);
      if (!best || saving > best.saving) best = { name: s.name, saving: round(saving), cost: round(self - saving) };
    });
    var csc = cscEligibility(profile);
    var full = null;
    if (uni.csc && (uni.csc.status === 'confirmed' || uni.csc.status === 'check')) {
      var months = (bd.years + bd.lang.sems / 2) * 12;
      full = {
        cost: 0, eligible: csc.ok, reason: csc.reason, confirmed: uni.csc.status === 'confirmed',
        stipendTotal: round(D.cscStipendMonthly * months)
      };
    }
    return { self: self, partial: best, full: full };
  }

  /* ---------- scholarship / language / ease scores ---------- */
  function scholarshipScore(uni, profile) {
    var pts = 0;
    var csc = cscEligibility(profile);
    if (uni.csc) {
      if (csc.ok) pts += uni.csc.status === 'confirmed' ? 40 : 20;
    }
    (uni.scholarships || []).forEach(function (s) {
      if (s.kind === 'csc') return;
      if (s.kind === 'university') {
        if (s.covers === 'tuition' && s.pct === 100) pts += 35;
        else if (s.covers === 'tuition') pts += 20;
        else if (num(s.amount) && s.amount >= 20000) pts += 25;
        else if (num(s.amount)) pts += 15;
        else pts += 10;
      } else { // provincial / municipal
        if (s.covers === 'tuition') pts += 25;
        else if (num(s.amount) && s.amount >= 20000) pts += 20;
        else if (num(s.amount)) pts += 12;
        else pts += 8;
      }
    });
    return clamp(pts, 0, 100);
  }

  function languageScore(uni, bd, profile) {
    var csc = cscEligibility(profile);
    if (bd.program.lang === 'en') return profile.englishOk ? 95 : 70;
    if (bd.lang.sems === 0) return 85;
    if (uni.csc && uni.csc.prep && csc.ok) return 100;
    if (!num(bd.lang.fee) || bd.lang.estimated) return 30;
    return clamp(100 - bd.lang.fee / 200, 0, 90);
  }

  function easeScore(uni, bd, profile) {
    var s = 100;
    var notes = [];
    if (bd.program.lang === 'zh' && bd.lang.sems > 0) { s -= bd.lang.sems === 1 ? 12 : 25; }
    if (bd.program.lang === 'en' && !profile.englishOk) { s -= 25; }
    var needsPortfolio = uni.portfolio === true;
    if (needsPortfolio && !profile.hasPortfolio) s -= 20;
    if (!bd.tuitionKnown) s -= 10;
    return clamp(s, 0, 100);
  }

  function speedScore(uni) {
    var st = uni.fastTrack && uni.fastTrack.status;
    return st === 'verified' ? 100 : st === 'reported' ? 70 : 40;
  }

  /* ---------- checks shown to the student ---------- */
  function checksFor(uni, bd, profile) {
    var c = [];
    var p = bd.program;
    if (p.lang === 'zh') {
      if (bd.lang.sems > 0) {
        c.push({ level: 'warn', text: 'Chinese-taught: needs HSK ' + bd.lang.req + (bd.lang.assumed ? ' (assumed — not stated)' : '') + '. You would study Chinese for about ' + bd.lang.sems + ' semester' + (bd.lang.sems > 1 ? 's' : '') + ' first.' });
      } else {
        c.push({ level: 'ok', text: 'Your HSK level meets the Chinese-taught requirement (HSK ' + bd.lang.req + ').' });
      }
    } else {
      c.push({ level: profile.englishOk ? 'ok' : 'warn', text: profile.englishOk ? 'English-taught: no Chinese needed. You have English proof.' : 'English-taught: needs English proof (IELTS/TOEFL, or a letter from your previous English-medium school or degree).' });
    }
    if (uni.portfolio === true) c.push({ level: profile.hasPortfolio ? 'ok' : 'warn', text: 'Portfolio required (at least 3 works at some schools).' });
    var csc = cscEligibility(profile);
    if (!csc.ok) c.push({ level: 'warn', text: csc.reason });
    if (!bd.tuitionKnown) c.push({ level: 'warn', text: 'Tuition for this programme was not published on the pages I could read. Ask admissions before applying.' });
    if (!p.confirmed) c.push({ level: 'info', text: 'Programme listing not confirmed for international undergraduates — confirm it exists and the fee.' });
    if (bd.dormEstimated) c.push({ level: 'info', text: 'Dorm price not published; an estimated figure is used.' });
    if (uni.confidence === 'agency') c.push({ level: 'info', text: 'Data comes from third-party listings only. Verify on the official site.' });
    return c;
  }

  /* ---------- evaluate / rank ---------- */
  function matchingPrograms(uni, profile) {
    return uni.programs.filter(function (p) {
      if (!profile.includeUnconfirmed && !p.confirmed) return false;
      if (profile.langPref !== 'any' && p.lang !== profile.langPref) return false;
      if (profile.field === 'architecture' && p.field !== 'architecture') return false;
      if (profile.field === 'art' && p.field !== 'art') return false;
      return true;
    });
  }

  function evaluate(uni, profile, defaults) {
    var progs = matchingPrograms(uni, profile);
    if (!progs.length) return null;
    if (profile.field === 'both') {
      var hasA = progs.some(function (p) { return p.field === 'architecture'; });
      var hasR = progs.some(function (p) { return p.field === 'art'; });
      if (!(hasA && hasR)) return null;
    }
    var options = progs.map(function (p) { return costFor(uni, p, profile, defaults); });
    var byCost = function (a, b) {
      if (a.tuitionKnown !== b.tuitionKnown) return a.tuitionKnown ? -1 : 1;
      return a.total - b.total;
    };
    options.sort(byCost);
    var byField = {};
    ['architecture', 'art'].forEach(function (f) {
      var inField = options.filter(function (o) { return o.program.field === f; });
      if (inField.length) byField[f] = inField[0];
    });
    var primary = options[0];
    // "Both": rank on the average of the cheapest architecture and cheapest art option,
    // because the student needs both to be available at the same university.
    var basis = (profile.field === 'both') ? [byField.architecture, byField.art] : [primary];
    var rankTotal = basis.reduce(function (s, o) { return s + o.total; }, 0) / basis.length;
    var rankFirstYear = basis.reduce(function (s, o) { return s + o.firstYear; }, 0) / basis.length;
    var rankKnown = basis.every(function (o) { return o.tuitionKnown; });
    return { uni: uni, options: options, primary: primary, byField: byField, rankTotal: rankTotal, rankFirstYear: rankFirstYear, rankKnown: rankKnown };
  }

  function rank(data, profileIn, today) {
    var profile = Object.assign({}, DEFAULT_PROFILE, profileIn || {});
    profile.weights = Object.assign({}, DEFAULT_WEIGHTS, (profileIn && profileIn.weights) || {});
    var rates = data.rates;
    var rows = data.universities.map(function (u) { return evaluate(u, profile, data.defaults); }).filter(Boolean);

    var known = rows.filter(function (r) { return r.rankKnown; }).map(function (r) { return r.rankTotal; });
    var lo = known.length ? Math.min.apply(null, known) : 0;
    var hi = known.length ? Math.max.apply(null, known) : 1;
    var span = Math.max(1, hi - lo);

    var weights = profile.weights;
    var wsum = 0; Object.keys(weights).forEach(function (k) { wsum += weights[k]; });
    if (wsum === 0) { weights = DEFAULT_WEIGHTS; wsum = 100; }

    rows.forEach(function (r) {
      var bd = r.primary, u = r.uni;
      var cost = r.rankKnown ? 100 * (1 - (r.rankTotal - lo) / span) : 0;
      var overBudget = false;
      if (num(profile.budgetUsd)) {
        var cap = profile.budgetUsd * rates.cnyPerUsd;
        overBudget = r.rankFirstYear > cap;
        if (overBudget) cost *= 0.4;
      }
      var parts = {
        cost: cost,
        scholarship: scholarshipScore(u, profile),
        language: languageScore(u, bd, profile),
        quality: u.strength * 20,
        speed: speedScore(u),
        ease: easeScore(u, bd, profile)
      };
      var score = 0;
      Object.keys(weights).forEach(function (k) { score += weights[k] * parts[k]; });
      score = score / wsum;
      var conf = u.confidence === 'official' ? 1 : u.confidence === 'partial' ? 0.94 : 0.85; // small trust discount
      r.parts = parts;
      r.overBudget = overBudget;
      r.score = round(score * conf);
      r.grade = gradeFor(r.score);
      r.checks = checksFor(u, bd, profile);
      r.freeLanguage = !!(u.csc && u.csc.prep);
      r.cscEligible = cscEligibility(profile).ok;
      r.deadline = nextDeadline(u, today);
      r.fastTrack = fastTrackInfo(u, today);
    });
    rows.sort(function (a, b) { return b.score - a.score; });
    return { profile: profile, rows: rows, min: lo, max: hi };
  }

  function gradeFor(score) {
    return score >= 78 ? 'A' : score >= 66 ? 'B' : score >= 54 ? 'C' : score >= 42 ? 'D' : 'E';
  }

  /* ---------- dates ---------- */
  function daysBetween(fromIso, toIso) {
    var a = Date.parse(fromIso + 'T00:00:00Z'), b = Date.parse(toIso + 'T00:00:00Z');
    return Math.round((b - a) / 86400000);
  }
  function isoDay(d) { return (d instanceof Date ? d : new Date()).toISOString().slice(0, 10); }

  function nextDeadline(uni, today) {
    var t = today || isoDay(new Date());
    var upcoming = (uni.deadlines || []).filter(function (d) { return d.close && d.close >= t; })
      .sort(function (a, b) { return a.close < b.close ? -1 : 1; });
    if (upcoming.length) return { label: upcoming[0].label, close: upcoming[0].close, days: daysBetween(t, upcoming[0].close), cycle: upcoming[0].cycle };
    var past = (uni.deadlines || []).filter(function (d) { return d.close; }).sort(function (a, b) { return a.close < b.close ? 1 : -1; });
    if (past.length) return { label: past[0].label, close: past[0].close, days: null, cycle: past[0].cycle, lastCycle: true };
    return null;
  }

  function fastTrackInfo(uni, today) {
    var ft = uni.fastTrack;
    if (!ft || ft.status === 'none') return null;
    var t = today || isoDay(new Date());
    var out = { status: ft.status, label: ft.label };
    if (ft.deadline) { out.deadline = ft.deadline; out.days = daysBetween(t, ft.deadline); if (out.days < 0) out.expired = true; }
    return out;
  }

  return {
    DEFAULT_PROFILE: DEFAULT_PROFILE, DEFAULT_WEIGHTS: DEFAULT_WEIGHTS,
    cscEligibility: cscEligibility, semestersNeeded: semestersNeeded, costFor: costFor,
    scholarshipScore: scholarshipScore, languageScore: languageScore, easeScore: easeScore,
    evaluate: evaluate, rank: rank, gradeFor: gradeFor, nextDeadline: nextDeadline, fastTrackInfo: fastTrackInfo,
    daysBetween: daysBetween, isoDay: isoDay
  };
});
