/* Silkpath UI — vanilla JS, no build step. */
(function () {
  'use strict';
  var D = window.SILKPATH_DATA, E = window.SilkpathEngine;
  var KEY = 'silkpath.v1';
  var TODAY = E.isoDay(new Date());

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { return /^(https?:|mailto:)/i.test(u || '') ? u : '#'; }

  /* ---------- state ---------- */
  function defaultState() {
    return {
      profile: { field: 'both', langPref: 'any', hsk: 0, englishOk: false, budgetOn: false, budgetUsd: 6000, dorm: 'shared', hasPortfolio: false, age: '', hasBachelor: false, includeUnconfirmed: true, weights: { cost: 7, scholarship: 4, language: 3, quality: 2, speed: 2, ease: 2 } },
      sort: 'score', currency: 'CNY', shortlist: [], compare: [], tracker: {}, docs: {}
    };
  }
  function load() {
    var base = defaultState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var s = JSON.parse(raw);
      Object.keys(base).forEach(function (k) { if (s[k] !== undefined) base[k] = s[k]; });
      base.profile = Object.assign(defaultState().profile, s.profile || {});
      base.profile.weights = Object.assign(defaultState().profile.weights, (s.profile && s.profile.weights) || {});
      return sanitize(base);
    } catch (e) { return base; }
  }
  // Saved state comes from localStorage: never trust its shape or types before it reaches the DOM.
  function sanitize(st) {
    var d = defaultState(), p = st.profile;
    var oneOf = function (v, list, fb) { return list.indexOf(v) > -1 ? v : fb; };
    var num = function (v, lo, hi, fb) { v = Number(v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fb; };
    p.field = oneOf(p.field, ['architecture', 'art', 'both'], d.profile.field);
    p.langPref = oneOf(p.langPref, ['any', 'en', 'zh'], d.profile.langPref);
    p.dorm = oneOf(p.dorm, ['shared', 'single'], d.profile.dorm);
    p.hsk = Math.round(num(p.hsk, 0, 6, 0));
    p.budgetUsd = Math.round(num(p.budgetUsd, 2000, 15000, d.profile.budgetUsd));
    p.age = p.age === '' ? '' : String(Math.round(num(p.age, 10, 80, 20)));
    ['englishOk', 'hasPortfolio', 'hasBachelor', 'budgetOn', 'includeUnconfirmed'].forEach(function (k) { p[k] = p[k] === true; });
    Object.keys(d.profile.weights).forEach(function (k) { p.weights[k] = Math.round(num(p.weights[k], 0, 10, d.profile.weights[k])); });
    var known = D.universities.map(function (u) { return u.id; });
    var onlyKnown = function (a) { return Array.isArray(a) ? a.filter(function (id) { return known.indexOf(id) > -1; }) : []; };
    st.shortlist = onlyKnown(st.shortlist); st.compare = onlyKnown(st.compare).slice(0, 4);
    st.sort = oneOf(st.sort, ['score', 'cost', 'first', 'sch', 'quality'], 'score');
    st.currency = oneOf(st.currency, ['CNY', 'USD', 'ETB'], 'CNY');
    var tr = {}, statuses = ['researching', 'preparing', 'submitted', 'offer', 'declined'];
    known.forEach(function (id) { var t = st.tracker && st.tracker[id]; if (t && typeof t === 'object') tr[id] = { status: oneOf(t.status, statuses, 'researching'), notes: typeof t.notes === 'string' ? t.notes.slice(0, 2000) : '' }; });
    st.tracker = tr;
    var docs = {}; D.docs.forEach(function (x) { if (st.docs && st.docs[x.key] === true) docs[x.key] = true; }); st.docs = docs;
    return st;
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }

  var UI = { drawer: null, drawerProg: 0, lastFocus: null };

  /* ---------- money ---------- */
  var R = D.rates;
  function conv(cny, cur) { return cur === 'USD' ? cny / R.cnyPerUsd : cur === 'ETB' ? cny / R.cnyPerUsd * R.etbPerUsd : cny; }
  function sym(cur) { return { CNY: '¥', USD: '$', ETB: 'Br ' }[cur]; }
  function fmtNum(n) {
    n = Math.round(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
    return n.toLocaleString('en-US');
  }
  function money(cny, cur) { cur = cur || S.currency; return sym(cur) + fmtNum(conv(cny, cur)); }
  function sub(cny) { var o = S.currency === 'CNY' ? 'USD' : S.currency === 'USD' ? 'ETB' : 'USD'; return '≈ ' + money(cny, o); }
  function fmtDate(iso) { var d = new Date(iso + 'T00:00:00Z'); return d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }

  /* ---------- engine glue ---------- */
  function engineProfile(over) {
    var p = S.profile;
    return Object.assign({
      field: p.field, langPref: p.langPref, hsk: +p.hsk || 0, englishOk: !!p.englishOk,
      budgetUsd: p.budgetOn ? +p.budgetUsd : null, dorm: p.dorm, hasPortfolio: !!p.hasPortfolio,
      age: p.age === '' ? null : +p.age, hasBachelor: !!p.hasBachelor, includeUnconfirmed: !!p.includeUnconfirmed,
      weights: Object.assign({}, p.weights)
    }, over || {});
  }
  var cache = { cur: null, all: null };
  function compute() {
    cache.cur = E.rank(D, engineProfile(), TODAY);
    cache.all = E.rank(D, engineProfile({ field: 'any', langPref: 'any', includeUnconfirmed: true }), TODAY);
  }
  function rowFor(id) {
    var r = cache.cur.rows.filter(function (x) { return x.uni.id === id; })[0];
    if (r) return r;
    return cache.all.rows.filter(function (x) { return x.uni.id === id; })[0];
  }
  function uniById(id) { return D.universities.filter(function (u) { return u.id === id; })[0]; }

  /* ---------- small renderers ---------- */
  function seal(score, grade, opts) {
    opts = opts || {};
    return '<div class="seal' + (opts.lg ? ' lg' : '') + (opts.stamp ? ' stamp-in' : '') + '" role="img" aria-label="Match score ' + score + ' out of 100, grade ' + grade + '"><div><b>' + score + '</b><small>Grade ' + grade + '</small></div></div>';
  }
  function segments(bd) {
    var lf = bd.lang.sems / 2;
    return [
      { k: 'Tuition', v: bd.tuitionYear * bd.years, c: 'var(--seg-tuition)' },
      { k: 'Housing', v: bd.dormYear * (bd.years + lf), c: 'var(--seg-housing)' },
      { k: 'Insurance & fees', v: bd.insurance * (bd.years + lf) + bd.application, c: 'var(--seg-fees)' },
      { k: 'Chinese year', v: bd.lang.fee, c: 'var(--seg-lang)' },
      { k: 'Living (est.)', v: bd.livingTotal, c: 'var(--seg-living)' }
    ].filter(function (s) { return s.v > 0; });
  }
  function tuitionText(bd) {
    if (!bd.tuitionKnown) return 'Not published';
    if (bd.tuitionRange) return money(bd.tuitionRange[0]) + '–' + fmtNum(conv(bd.tuitionRange[1], S.currency)) + ' /yr';
    return money(bd.tuitionYear) + ' /yr';
  }
  function firstYearText(bd) { return money(bd.firstYear) + (bd.tuitionKnown ? '' : ' + tuition'); }
  function confLabel(c) { return c === 'official' ? 'Official pages' : c === 'partial' ? 'Partly verified' : 'Third-party only'; }
  function confClass(c) { return c === 'official' ? 'ok' : c === 'partial' ? 'warn' : 'bad'; }

  function badges(r) {
    var u = r.uni, b = [];
    if (u.csc && u.csc.prep) b.push(r.cscEligible ? '<span class="badge ok">Free Chinese year (CSC)</span>' : '<span class="badge warn">Free Chinese year — CSC may not apply to you</span>');
    var hasA = u.programs.some(function (p) { return p.field === 'architecture'; }), hasR = u.programs.some(function (p) { return p.field === 'art'; });
    if (hasA && hasR) b.push('<span class="badge blue">Architecture + Art</span>');
    if (u.programs.some(function (p) { return p.lang === 'en'; })) b.push('<span class="badge blue">English-taught option</span>');
    if (r.fastTrack && r.fastTrack.status === 'verified' && !r.fastTrack.expired) b.push('<span class="badge ok">Spring 2027 start possible</span>');
    if (r.overBudget) b.push('<span class="badge bad">Over your budget</span>');
    if (!r.rankKnown) b.push('<span class="badge warn">Tuition not published</span>');
    b.push('<span class="badge ' + confClass(u.confidence) + '">' + confLabel(u.confidence) + '</span>');
    return b.join('');
  }

  function scholarshipLine(u) {
    var names = [];
    if (u.csc && u.csc.status === 'confirmed') names.push('<b>CSC</b> confirmed');
    else if (u.csc && u.csc.status === 'check') names.push('CSC <span class="muted">(check)</span>');
    u.scholarships.forEach(function (s) {
      if (s.kind === 'csc') return;
      var amt = s.amount ? ' ' + money(s.amount) + '/yr' : s.pct === 100 ? ' up to full tuition' : s.pct ? ' ' + s.pct + '% tuition' : '';
      names.push(esc(s.name.replace(/ \(bachelor\)/, '')) + '<span class="muted">' + esc(amt) + '</span>');
    });
    return names.length ? names.join(' · ') : '<span class="muted">No undergraduate scholarship found on the pages read</span>';
  }

  function optBlock(bd, label) {
    var p = bd.program, segs = segments(bd), tot = segs.reduce(function (a, s) { return a + s.v; }, 0) || 1;
    var full = bd.scenarios.full;
    var bar = segs.map(function (s) { return '<i title="' + esc(s.k + ': ' + money(s.v)) + '" style="width:' + (s.v / tot * 100).toFixed(1) + '%;background:' + s.c + '"></i>'; }).join('');
    var legend = segs.map(function (s) { return '<span style="--c:' + s.c + '">' + esc(s.k) + ' ' + money(s.v) + '</span>'; }).join('');
    var fullTxt = !full ? '<span class="v">—</span><span class="s">no CSC route found</span>'
      : full.eligible ? '<span class="v free">Free*</span><span class="s">+ ' + money(D.defaults.cscStipendMonthly) + '/mo stipend</span>'
      : '<span class="v">n/a</span><span class="s">CSC rules exclude you</span>';
    return '<div class="opt">' +
      '<div class="opt-field">' + esc(label) + '</div>' +
      '<div class="opt-name">' + esc(p.name) + '</div>' +
      '<div class="opt-meta">' + (p.lang === 'en' ? 'English-taught' : 'Chinese-taught') + ' · ' + p.years + ' yrs · ' + tuitionText(bd) + (p.confirmed ? '' : ' · <span class="est">to confirm</span>') + '</div>' +
      '<div class="money">' +
        '<div><span class="k">First-year cash</span><br><span class="v">' + firstYearText(bd) + '</span><br><span class="s">' + sub(bd.firstYear) + '</span></div>' +
        '<div><span class="k">Total, self-funded</span><br><span class="v">' + (bd.tuitionKnown ? money(bd.total) : '—') + '</span><br><span class="s">' + (bd.tuitionKnown ? sub(bd.total) : 'tuition unknown') + '</span></div>' +
        '<div><span class="k">Full CSC award</span><br>' + fullTxt + '</div>' +
      '</div>' +
      '<div class="bar" role="img" aria-label="Cost split">' + bar + '</div><div class="legend">' + legend + '</div></div>';
  }

  function titleblock(r) {
    var u = r.uni, d = r.deadline;
    var dl = !d ? '<b>Not published</b>' : d.lastCycle ? '<b>' + fmtDate(d.close) + '</b>last cycle' : '<b>' + fmtDate(d.close) + '</b>' + d.days + ' days left';
    return '<div class="titleblock">' +
      '<div>CITY<b>' + esc(u.city) + ', ' + esc(u.province) + '</b></div>' +
      '<div>DATA<b>' + esc(confLabel(u.confidence)) + '</b></div>' +
      '<div>DEADLINE<b>' + dl + '</b></div>' +
      '<div>CHECKED<b>' + fmtDate(D.verifiedOn) + '</b></div></div>';
  }

  function card(r, i) {
    var u = r.uni;
    var both = S.profile.field === 'both' && r.byField.architecture && r.byField.art;
    var opts = both ? [['Architecture', r.byField.architecture], ['Art & design', r.byField.art]] : [[r.primary.program.field === 'art' ? 'Art & design' : 'Architecture', r.primary]];
    var inPlan = S.shortlist.indexOf(u.id) > -1, inCmp = S.compare.indexOf(u.id) > -1;
    return '<article class="sheet" style="animation-delay:' + Math.min(i, 8) * 40 + 'ms" aria-labelledby="h-' + u.id + '">' +
      '<div class="sheet-top"><div class="rank">' + (i + 1) + '</div>' +
      '<div><h3 id="h-' + u.id + '">' + esc(u.name) + '<span class="zh" lang="zh-Hans">' + esc(u.zh) + '</span></h3>' +
      '<div class="where">' + esc(u.city) + ' · ' + esc(u.province) + ' · academic standing ' + '●'.repeat(u.strength) + '○'.repeat(5 - u.strength) + '</div></div>' +
      seal(r.score, r.grade, { stamp: i === 0 }) + '</div>' +
      '<div class="badges">' + badges(r) + '</div>' +
      '<div class="opts' + (opts.length > 1 ? ' two' : '') + '">' + opts.map(function (o) { return optBlock(o[1], o[0]); }).join('') + '</div>' +
      '<div class="schol"><span><b>Scholarships:</b> ' + scholarshipLine(u) + '</span></div>' +
      '<div class="actions">' +
        '<button class="btn primary" data-act="open" data-id="' + u.id + '">See full breakdown</button>' +
        '<button class="btn' + (inPlan ? ' on' : '') + '" data-act="plan" data-id="' + u.id + '" aria-pressed="' + inPlan + '">' + (inPlan ? '✓ In my plan' : '+ Add to my plan') + '</button>' +
        '<button class="btn ghost' + (inCmp ? ' on' : '') + '" data-act="cmp" data-id="' + u.id + '" aria-pressed="' + inCmp + '">' + (inCmp ? '✓ Comparing' : 'Compare') + '</button>' +
      '</div>' + titleblock(r) + '</article>';
  }

  /* ---------- tabs / routing ---------- */
  var VIEWS = [['discover', 'Discover'], ['compare', 'Compare'], ['plan', 'My plan'], ['guide', 'Ethiopia guide'], ['data', 'Data & method']];
  function currentView() { var h = (location.hash || '#discover').replace('#', '').split('/')[0]; return VIEWS.some(function (v) { return v[0] === h; }) ? h : 'discover'; }
  function renderTabs() {
    var v = currentView();
    $('#tabs').innerHTML = VIEWS.map(function (t) {
      var n = t[0] === 'compare' ? S.compare.length : t[0] === 'plan' ? S.shortlist.length : 0;
      return '<a href="#' + t[0] + '"' + (t[0] === v ? ' aria-current="page"' : '') + '>' + t[1] + (n ? '<span class="count">' + n + '</span>' : '') + '</a>';
    }).join('');
  }
  function showView() {
    var v = currentView();
    $$('.view').forEach(function (el) { el.hidden = el.id !== 'view-' + v; });
    renderTabs();
    if (v === 'discover') renderResults();
    if (v === 'compare') renderCompare();
    if (v === 'plan') renderPlan();
    if (v === 'guide') renderGuide();
    if (v === 'data') renderData();
    document.body.classList.toggle('printing-plan', v === 'plan');
    var names = { discover: 'Find your university', compare: 'Compare universities', plan: 'My application plan', guide: 'Applying from Ethiopia', data: 'Data and method' };
    document.title = names[v] + ' — Silkpath';
    window.scrollTo(0, 0);
    if (UI.navigated) { var m = $('#main'); if (m) m.focus({ preventScroll: true }); }
  }

  /* ---------- Discover ---------- */
  function segBtn(key, val, label) { return '<button type="button" data-set="' + key + '" data-val="' + val + '" aria-pressed="' + (String(S.profile[key]) === val) + '">' + label + '</button>'; }
  var PRIOS = [['cost', 'Low total cost'], ['scholarship', 'Scholarships'], ['language', 'Free / easy language'], ['quality', 'Academic standing'], ['speed', 'Fast start'], ['ease', 'Easy to enter']];

  function renderBrief() {
    var p = S.profile;
    var hskOpts = [0, 1, 2, 3, 4, 5, 6].map(function (n) { return '<option value="' + n + '"' + (+p.hsk === n ? ' selected' : '') + '>' + (n ? 'HSK ' + n : 'No Chinese yet') + '</option>'; }).join('');
    return '<details class="brief" id="brief"' + (window.innerWidth > 1000 ? ' open' : '') + '>' +
      '<summary class="brief-head"><span>Your brief</span></summary>' +
      '<div class="brief-body">' +
      '<div class="brief-actions"><button type="button" class="btn small ghost" data-act="reset">Reset brief</button></div>' +
      '<div class="fld"><span class="lab">Bachelor’s degree in</span><div class="seg" role="group" aria-label="Field">' + segBtn('field', 'architecture', 'Architecture') + segBtn('field', 'art', 'Art & design') + segBtn('field', 'both', 'Both') + '</div>' +
        '<p class="hint">“Both” keeps only universities that offer architecture and art, so you can choose later.</p></div>' +
      '<div class="fld"><span class="lab">Teaching language</span><div class="seg" role="group" aria-label="Teaching language">' + segBtn('langPref', 'any', 'Either') + segBtn('langPref', 'en', 'English') + segBtn('langPref', 'zh', 'Chinese') + '</div></div>' +
      '<div class="fld"><label for="f-hsk">Your Chinese level</label><select id="f-hsk" data-bind="hsk">' + hskOpts + '</select>' +
        '<label class="check"><input type="checkbox" data-bind="englishOk"' + (p.englishOk ? ' checked' : '') + '><span>I have IELTS/TOEFL, or a letter showing my earlier schooling was in English</span></label></div>' +
      '<div class="fld"><label class="check"><input type="checkbox" data-bind="hasPortfolio"' + (p.hasPortfolio ? ' checked' : '') + '><span>I have a portfolio (3+ works)</span></label>' +
        '<label for="f-age" style="margin-top:10px">Your age</label><input id="f-age" type="number" min="15" max="60" inputmode="numeric" data-bind="age" value="' + esc(p.age) + '" placeholder="e.g. 22">' +
        '<label class="check" style="margin-top:8px"><input type="checkbox" data-bind="hasBachelor"' + (p.hasBachelor ? ' checked' : '') + '><span>I already hold a bachelor’s degree</span></label>' +
        '<p class="hint">Age and prior degree decide whether CSC undergraduate awards are open to you.</p></div>' +
      '<div class="fld"><label class="check"><input type="checkbox" data-bind="budgetOn"' + (p.budgetOn ? ' checked' : '') + '><span>Set a first-year budget</span></label>' +
        '<input class="range" type="range" min="2000" max="15000" step="500" data-bind="budgetUsd" value="' + p.budgetUsd + '" aria-label="First-year budget in US dollars"' + (p.budgetOn ? '' : ' disabled') + '>' +
        '<p class="hint" id="budget-out"></p></div>' +
      '<div class="fld"><span class="lab">Housing</span><div class="seg" role="group" aria-label="Housing">' + segBtn('dorm', 'shared', 'Shared room') + segBtn('dorm', 'single', 'Single room') + '</div></div>' +
      '<div class="fld"><span class="lab">What matters most</span>' + PRIOS.map(function (x) {
        return '<div class="prio"><label for="w-' + x[0] + '">' + x[1] + '</label><input class="range" id="w-' + x[0] + '" type="range" min="0" max="10" data-weight="' + x[0] + '" value="' + p.weights[x[0]] + '"><output>' + p.weights[x[0]] + '</output></div>';
      }).join('') + '</div>' +
      '<div class="fld"><label class="check"><input type="checkbox" data-bind="includeUnconfirmed"' + (p.includeUnconfirmed ? ' checked' : '') + '><span>Include programmes I could not confirm</span></label></div>' +
      '</div></details>';
  }
  function budgetHint() {
    var el = $('#budget-out'); if (!el) return;
    el.textContent = S.profile.budgetOn ? 'Up to $' + (+S.profile.budgetUsd).toLocaleString('en-US') + ' (' + money($('[data-bind="budgetUsd"]').value * R.cnyPerUsd) + ') in the first year, including living costs.' : 'No limit set. Slide on to hide over-budget options.';
  }

  function sortRows(rows) {
    var by = S.sort, a = rows.slice();
    var cmp = {
      score: function (x, y) { return y.score - x.score; },
      cost: function (x, y) { return (x.rankKnown ? 0 : 1) - (y.rankKnown ? 0 : 1) || x.rankTotal - y.rankTotal; },
      first: function (x, y) { return (x.rankKnown ? 0 : 1) - (y.rankKnown ? 0 : 1) || x.rankFirstYear - y.rankFirstYear; },
      sch: function (x, y) { return y.parts.scholarship - x.parts.scholarship || y.score - x.score; },
      quality: function (x, y) { return y.parts.quality - x.parts.quality || y.score - x.score; }
    }[by];
    return a.sort(cmp);
  }

  function asapStrip() {
    var fast = cache.all.rows.filter(function (r) { return r.fastTrack && r.fastTrack.status === 'verified' && r.fastTrack.deadline && !r.fastTrack.expired; })
      .sort(function (a, b) { return a.fastTrack.days - b.fastTrack.days; })[0];
    if (!fast) return '';
    return '<div class="asap"><div class="days">' + fast.fastTrack.days + '<small>DAYS LEFT</small></div>' +
      '<div><b>' + esc(fast.uni.name) + '</b> — ' + esc(fast.fastTrack.label) + ' (closes ' + fmtDate(fast.fastTrack.deadline) + '). Self-funded; ask about the university’s scholarship for language students.</div>' +
      '<div class="sub">Degree programmes start in September 2027. On the 2026 cycle, windows opened between November and March and closed March–June. Exact 2027 dates appear once universities publish them. A March language course lets you arrive early and enter a degree in September.</div></div>';
  }

  function renderDiscover() {
    $('#view-discover').innerHTML =
      '<div class="strip"><h1>Architecture &amp; art degrees in China, <em>priced</em> for you.</h1>' +
      '<p>' + D.universities.length + ' universities, ' + D.universities.reduce(function (a, u) { return a + u.programs.length; }, 0) + ' bachelor’s programmes, every figure linked to its source. Change the brief and the ranking updates.</p></div>' +
      '<div id="asap"></div>' +
      '<div class="layout"><div id="brief-wrap">' + renderBrief() + '</div><div id="results"></div></div>';
    budgetHint();
  }

  function renderResults() {
    if (!$('#results')) renderDiscover();
    compute();
    $('#asap').innerHTML = asapStrip();
    var rows = sortRows(cache.cur.rows);
    var html = '<div class="results-head"><h2>' + rows.length + ' universit' + (rows.length === 1 ? 'y' : 'ies') + ' match' + (rows.length === 1 ? 'es' : '') + ' your brief</h2>' +
      '<label class="muted" style="font-size:13px">Sort by <select id="sort" aria-label="Sort results">' +
      [['score', 'Match score'], ['cost', 'Lowest total cost'], ['first', 'Lowest first-year cash'], ['sch', 'Scholarship strength'], ['quality', 'Academic standing']].map(function (o) { return '<option value="' + o[0] + '"' + (S.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
      '</select></label></div>';
    if (!rows.length) {
      html += '<div class="empty"><h3>No university matches all of that</h3><p class="muted">Try one field at a time, or allow either teaching language.</p>' +
        '<p><button class="btn" data-set="field" data-val="architecture">Architecture only</button> <button class="btn" data-set="field" data-val="art">Art &amp; design only</button> <button class="btn" data-set="langPref" data-val="any">Any language</button></p></div>';
    } else {
      html += '<div class="list">' + rows.map(card).join('') + '</div>';
    }
    $('#results').innerHTML = html;
    var live = $('#sr-status'); if (live) live.textContent = rows.length + ' universit' + (rows.length === 1 ? 'y' : 'ies') + ' match your brief, sorted by ' + ({ score: 'match score', cost: 'lowest total cost', first: 'lowest first-year cash', sch: 'scholarship strength', quality: 'academic standing' })[S.sort] + '.';
  }

  /* ---------- Drawer ---------- */
  function openDrawer(id, opener) {
    UI.drawer = id; UI.drawerProg = 0; UI.lastFocus = opener || document.activeElement;
    renderDrawer();
    $('#scrim').hidden = false; $('#drawer').hidden = false;
    setBackgroundInert(true);
    document.body.style.overflow = 'hidden';
    var c = $('.d-close'); if (c) c.focus();
  }
  function setBackgroundInert(on) {
    ['.masthead', '#main', '.foot'].forEach(function (sel) { var el = $(sel); if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  }
  function closeDrawer() {
    UI.drawer = null; $('#drawer').hidden = true; $('#scrim').hidden = true; document.body.style.overflow = '';
    setBackgroundInert(false);
    if (UI.lastFocus && UI.lastFocus.focus) UI.lastFocus.focus();
  }
  function renderDrawer() {
    var u = uniById(UI.drawer); if (!u) return;
    var row = rowFor(u.id);
    var ev = E.evaluate(u, engineProfile({ field: 'any', langPref: 'any', includeUnconfirmed: true }), D.defaults);
    var opts = ev.options;
    if (UI.drawerProg >= opts.length) UI.drawerProg = 0;
    var bd = opts[UI.drawerProg];
    var inPlan = S.shortlist.indexOf(u.id) > -1, inCmp = S.compare.indexOf(u.id) > -1;
    var lf = bd.lang.sems / 2;
    var ch = (function () { // recompute checks for the selected programme
      var c = []; var p = bd.program, pr = engineProfile();
      if (p.lang === 'zh') c.push(bd.lang.sems > 0 ? { l: 'warn', t: 'Chinese-taught: HSK ' + bd.lang.req + (bd.lang.assumed ? ' assumed (not stated)' : '') + ' needed. About ' + bd.lang.sems + ' semester' + (bd.lang.sems > 1 ? 's' : '') + ' of Chinese first.' } : { l: 'ok', t: 'Your HSK level meets the Chinese-taught requirement.' });
      else c.push(pr.englishOk ? { l: 'ok', t: 'English-taught: no Chinese needed, and you have English proof.' } : { l: 'warn', t: 'English-taught: needs English proof (IELTS/TOEFL, or an English-medium letter).' });
      if (u.englishProof && p.lang === 'en') c.push({ l: 'info', t: u.englishProof });
      if (u.portfolio === true) c.push({ l: pr.hasPortfolio ? 'ok' : 'warn', t: 'Portfolio required.' });
      var cs = E.cscEligibility(pr); if (!cs.ok) c.push({ l: 'warn', t: cs.reason });
      if (!bd.tuitionKnown) c.push({ l: 'warn', t: 'Tuition was not published on the pages read. Ask admissions before applying.' });
      if (!p.confirmed) c.push({ l: 'info', t: 'Programme not confirmed for international undergraduates. Confirm it exists and its fee.' });
      if (bd.dormEstimated) c.push({ l: 'info', t: 'Housing price not published; ' + money(D.defaults.dormEst) + '/yr estimated.' });
      c.push({ l: 'info', t: 'CSCA exam: required for CSC bachelor’s applicants. Math is compulsory; English-taught programmes skip Professional Chinese.' });
      return c;
    })();
    var sc = bd.scenarios;
    var best = sc.partial && sc.partial.saving > 0;
    var rows = [
      ['Tuition', bd.tuitionKnown ? money(bd.tuitionYear) + ' × ' + bd.years + ' yrs' + (bd.tuitionRange ? ' <span class="est">(top of range)</span>' : '') : '<span class="est">not published</span>', bd.tuitionKnown ? bd.tuitionYear * bd.years : null],
      ['Housing', money(bd.dormYear) + ' × ' + (bd.years + lf) + ' yrs' + (bd.dormEstimated ? ' <span class="est">estimate</span>' : ''), bd.dormYear * (bd.years + lf)],
      ['Insurance', money(bd.insurance) + ' × ' + (bd.years + lf) + ' yrs', bd.insurance * (bd.years + lf)],
      ['Application fee', bd.applicationEstimated ? '<span class="est">estimate</span>' : 'one time', bd.application]
    ];
    if (bd.lang.sems) rows.push(['Chinese year (' + bd.lang.sems + ' sem.)', (bd.lang.estimated ? '<span class="est">estimate</span> ' : '') + (u.csc && u.csc.prep ? 'free under CSC' : 'self-funded'), bd.lang.fee]);
    rows.push(['Living (est.)', money(u.living) + '/mo × 10 mo × ' + (bd.years + lf) + ' yrs', bd.livingTotal]);

    var progs = opts.map(function (o, i) {
      var p = o.program;
      return '<div class="prog' + (i === UI.drawerProg ? ' sel' : '') + '"><button data-act="prog" data-i="' + i + '" aria-pressed="' + (i === UI.drawerProg) + '"><div class="top"><b>' + esc(p.name) + '</b><span class="mono" style="font-size:12px">' + (p.field === 'art' ? 'ART' : 'ARCH') + ' · ' + (p.lang === 'en' ? 'ENGLISH' : 'CHINESE') + ' · ' + p.years + ' YRS · ' + (o.tuitionKnown ? money(o.tuitionYear) + '/yr' : 'fee ?') + '</span></div>' +
        '<p>' + (p.confirmed ? '' : '<b class="est">Not confirmed.</b> ') + esc(p.note || '') + '</p></button></div>';
    }).join('');

    var sch = u.scholarships.map(function (s) {
      var w = (u.deadlines || []).filter(function (d) { return d.label.indexOf(s.name.split(' (')[0].split(' ').slice(0, 2).join(' ')) > -1; })[0];
      return '<div class="sch-item"><b>' + esc(s.name) + '</b> <span class="badge ' + (s.covers === 'full' ? 'ok' : 'blue') + '">' + (s.covers === 'full' ? 'Full' : s.covers === 'tuition' ? 'Tuition' : 'Partial') + '</span><p>' + esc(s.note || '') + (w ? ' Window: ' + fmtDate(w.close) + ' (' + esc(w.cycle) + ').' : '') + '</p></div>';
    }).join('') || '<p class="muted">No undergraduate scholarship was found on the pages read. Ask the admissions office.</p>';

    var dl = (u.deadlines || []).map(function (d) {
      var future = d.close >= TODAY;
      return '<tr><td>' + esc(d.label) + '</td><td class="n">' + (d.open ? fmtDate(d.open) + ' → ' : '') + fmtDate(d.close) + '</td><td>' + (future ? '<span class="badge ok">' + E.daysBetween(TODAY, d.close) + ' days left</span>' : '<span class="badge">' + esc(d.cycle) + '</span>') + '</td></tr>';
    }).join('');

    var langFree = u.csc && u.csc.prep
      ? '<p><b>Free Chinese route:</b> ' + esc(u.csc.note) + '</p>'
      : '<p><b>Chinese language:</b> no verified free route here beyond a full scholarship (CSC covers the prep year for Chinese-taught undergraduates). ' + esc(u.csc ? u.csc.note : '') + '</p>';

    $('#drawer').innerHTML =
      '<div class="d-head">' + (row ? seal(row.score, row.grade, { lg: true }) : '<span></span>') +
      '<div><h2 id="drawer-title">' + esc(u.name) + '</h2><div class="where"><span lang="zh-Hans">' + esc(u.zh) + '</span> · ' + esc(u.city) + ', ' + esc(u.province) + '</div></div>' +
      '<button class="d-close" data-act="close" aria-label="Close details">×</button></div>' +
      '<div class="d-body">' +
      '<div class="d-sec"><div class="actions" style="padding:0;border:0">' +
        '<button class="btn primary" data-act="plan" data-id="' + u.id + '">' + (inPlan ? '✓ In my plan' : '+ Add to my plan') + '</button>' +
        '<button class="btn" data-act="cmp" data-id="' + u.id + '">' + (inCmp ? '✓ Comparing' : 'Compare') + '</button>' +
        '<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(safeUrl(u.site)) + '">Official site ↗</a>' +
        '<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(safeUrl(u.apply)) + '">Apply ↗</a></div></div>' +
      '<div class="d-sec"><h3>Programmes — choose one to price</h3>' + progs + '</div>' +
      '<div class="d-sec"><h3>What you would pay (' + esc(bd.program.name) + ')</h3><table class="t"><thead><tr><th>Item</th><th>Basis</th><th class="n">Amount</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="n">' + (r[2] == null ? '—' : money(r[2]) + '<br><span class="muted" style="font-size:11px">' + sub(r[2]) + '</span>') + '</td></tr>'; }).join('') +
        '<tr class="total"><td colspan="2">Total over the whole degree, self-funded</td><td class="n">' + (bd.tuitionKnown ? money(bd.total) : '—') + '</td></tr></tbody></table>' +
        '<p class="muted" style="font-size:12px;margin-top:8px">Not included: flights, visa, medical exam, notarising documents, and spending above the living estimate. Living costs are an editorial estimate per city.</p>' +
        '<div class="scen" style="margin-top:12px">' +
          '<div><div class="k">Self-funded</div><div class="v">' + (bd.tuitionKnown ? money(sc.self) : '—') + '</div><div class="s">First year cash ' + money(bd.firstYear) + '</div></div>' +
          '<div class="' + (best ? 'best' : '') + '"><div class="k">Best partial award</div><div class="v">' + (best ? money(sc.partial.cost) : '—') + '</div><div class="s">' + (best ? 'Saves ' + money(sc.partial.saving) + ' with ' + esc(sc.partial.name) + ' (best case)' : 'No amount published') + '</div></div>' +
          '<div class="' + (sc.full && sc.full.eligible ? 'best' : '') + '"><div class="k">Full CSC award*</div><div class="v">' + (sc.full ? (sc.full.eligible ? 'Free' : 'n/a') : '—') + '</div><div class="s">' + (sc.full ? (sc.full.eligible ? 'Plus about ' + money(sc.full.stipendTotal) + ' stipend over the stay' : esc(sc.full.reason)) : 'No CSC route found') + '</div></div></div>' +
        '<p class="muted" style="font-size:12px;margin-top:6px">*Tuition, housing, insurance and a monthly stipend. Highly competitive.</p></div>' +
      '<div class="d-sec"><h3>Is this realistic for you?</h3><ul class="chk">' + ch.map(function (c) { return '<li class="' + c.l + '"><span class="ic">' + (c.l === 'ok' ? '✓' : c.l === 'warn' ? '!' : 'i') + '</span><span>' + esc(c.t) + '</span></li>'; }).join('') + '</ul></div>' +
      '<div class="d-sec"><h3>Chinese language</h3>' + langFree + (u.fees.languageSemesters ? '<p class="muted">If self-funded: ' + esc(u.fees.languageNote) + '</p>' : '<p class="muted">' + esc(u.fees.languageNote) + '</p>') + (u.fastTrack && u.fastTrack.label ? '<p><b>Start sooner:</b> ' + esc(u.fastTrack.label) + '</p>' : '') + '</div>' +
      '<div class="d-sec"><h3>Scholarships</h3>' + sch + '</div>' +
      '<div class="d-sec"><h3>Dates</h3>' + (dl ? '<table class="t"><tbody>' + dl + '</tbody></table>' : '<p class="muted">No dates published on the pages read.</p>') + '<p class="muted" style="font-size:12px;margin-top:8px">Past dates are the last cycle, shown only to indicate timing. Confirm 2027 dates with the university.</p></div>' +
      '<div class="d-sec"><h3>Where this data comes from</h3><p><span class="badge ' + confClass(u.confidence) + '">' + confLabel(u.confidence) + '</span> Checked ' + fmtDate(D.verifiedOn) + '.</p><div class="srcs">' +
        u.sources.map(function (s) { return '<a target="_blank" rel="noopener" href="' + esc(safeUrl(s.url)) + '">' + esc(s.label) + ' ↗</a>'; }).join('') + '</div>' + reportLink(u) + '</div>' +
      '</div>';
  }

  function reportLink(u) {
    var repo = (window.SILKPATH_CONFIG && window.SILKPATH_CONFIG.repoUrl) || '';
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+/.test(repo)) return '';
    var url = repo.replace(/\/$/, '') + '/issues/new?template=data-correction.yml&title=' + encodeURIComponent('Data correction: ' + u.name);
    return '<p style="margin-top:10px"><a target="_blank" rel="noopener" href="' + esc(url) + '">Spotted a wrong or outdated number? Report it ↗</a></p>';
  }

  /* ---------- Compare ---------- */
  function renderCompare() {
    var el = $('#view-compare');
    var ids = S.compare;
    var head = '<div class="strip"><h1>Compare <em>side by side</em></h1><p>Add up to four universities from Discover. Green marks the lowest cost.</p></div>';
    if (!ids.length) { el.innerHTML = head + '<div class="empty"><h3>Nothing to compare yet</h3><p class="muted">Press “Compare” on any university in Discover.</p><a class="btn primary" href="#discover">Go to Discover</a></div>'; return; }
    var rs = ids.map(rowFor).filter(Boolean);
    function best(fn, low) { var vals = rs.map(fn); var ok = vals.filter(function (v) { return v != null; }); if (!ok.length) return -1; var t = low ? Math.min.apply(null, ok) : Math.max.apply(null, ok); return vals.indexOf(t); }
    var rowsDef = [
      ['Match score', function (r) { return r.score + ' / 100 · Grade ' + r.grade; }, function (r) { return r.score; }, false],
      ['Cheapest programme', function (r) { return esc(r.primary.program.name) + '<br><span class="muted">' + (r.primary.program.lang === 'en' ? 'English' : 'Chinese') + '-taught</span>'; }],
      ['Tuition per year', function (r) { return tuitionText(r.primary); }, function (r) { return r.primary.tuitionKnown ? r.primary.tuitionYear : null; }, true],
      ['Length', function (r) { return r.primary.years + ' years'; }],
      ['First-year cash', function (r) { return firstYearText(r.primary) + '<br><span class="muted">' + sub(r.primary.firstYear) + '</span>'; }, function (r) { return r.primary.firstYear; }, true],
      ['Total, self-funded', function (r) { return r.primary.tuitionKnown ? money(r.primary.total) + '<br><span class="muted">' + sub(r.primary.total) + '</span>' : 'Unknown'; }, function (r) { return r.primary.tuitionKnown ? r.primary.total : null; }, true],
      ['Free Chinese year', function (r) { return r.uni.csc && r.uni.csc.prep ? 'Yes — CSC prep institution' : 'Not verified'; }],
      ['Scholarships', function (r) { return scholarshipLine(r.uni); }],
      ['Language needed', function (r) { var p = r.primary.program; return p.lang === 'en' ? 'English proof' : 'HSK ' + (p.hsk || '4 (assumed)'); }],
      ['Portfolio', function (r) { return r.uni.portfolio === true ? 'Required' : 'Not stated'; }],
      ['Fastest start', function (r) { return r.fastTrack ? esc(r.fastTrack.label) : '—'; }],
      ['Data confidence', function (r) { return confLabel(r.uni.confidence); }]
    ];
    var thead = '<thead><tr><th scope="col"><span class="sr">Measure</span></th>' + rs.map(function (r) { return '<th scope="col">' + esc(r.uni.name) + '<small>' + esc(r.uni.city) + '</small></th>'; }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + rowsDef.map(function (d) {
      var b = d[2] ? best(d[2], d[3]) : -1;
      return '<tr><th scope="row">' + d[0] + '</th>' + rs.map(function (r, i) { return '<td' + (i === b ? ' class="best"' : '') + '>' + d[1](r) + '</td>'; }).join('') + '</tr>';
    }).join('') + '<tr><th scope="row"></th>' + rs.map(function (r) { return '<td><button class="btn small" data-act="open" data-id="' + r.uni.id + '">Details</button> <button class="btn small ghost" data-act="cmp" data-id="' + r.uni.id + '">Remove</button></td>'; }).join('') + '</tr></tbody>';
    el.innerHTML = head + '<div class="cmp-wrap"><table class="cmp">' + thead + tbody + '</table></div>';
  }

  /* ---------- Plan ---------- */
  var STATUS = [['researching', 'Researching'], ['preparing', 'Preparing documents'], ['submitted', 'Submitted'], ['offer', 'Offer received'], ['declined', 'Not continuing']];
  function docItem(d) {
    return '<label class="doc"><input type="checkbox" data-doc="' + d.key + '"' + (S.docs[d.key] ? ' checked' : '') + '><span>' + esc(d.label) + (d.tip ? '<span class="tip">' + esc(d.tip) + '</span>' : '') + '</span></label>';
  }
  function renderPlan() {
    var el = $('#view-plan');
    var core = D.docs.filter(function (d) { return d.all; }), extra = D.docs.filter(function (d) { return !d.all; });
    var done = core.filter(function (d) { return S.docs[d.key]; }).length, pct = Math.round(done / core.length * 100);
    var apps = S.shortlist.map(function (id) { return rowFor(id); }).filter(Boolean);
    var appHtml = apps.length ? apps.map(function (r) {
      var u = r.uni, t = S.tracker[u.id] || { status: 'researching', notes: '' }, d = r.deadline;
      return '<div class="app"><div class="app-head"><h3>' + esc(u.name) + '</h3><span class="mono muted" style="font-size:12px">' + esc(u.city) + '</span></div>' +
        '<div class="row"><label>Status <select data-track="status" data-id="' + u.id + '">' + STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (t.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label>' +
        '<span>Cheapest route: <b>' + esc(r.primary.program.name) + '</b>, ' + firstYearText(r.primary) + ' first year</span></div>' +
        '<div class="row"><span>' + (d ? (d.lastCycle ? 'Last cycle closed ' + fmtDate(d.close) + ' — 2027 date not yet published' : 'Next deadline <b>' + fmtDate(d.close) + '</b> (' + d.days + ' days)') : 'Deadline not published — email admissions') + '</span></div>' +
        '<textarea data-track="notes" data-id="' + u.id + '" placeholder="Notes: contact person, agency number, questions to ask…" aria-label="Notes for ' + esc(u.name) + '">' + esc(t.notes) + '</textarea>' +
        '<div class="row no-print"><button class="btn small" data-act="open" data-id="' + u.id + '">Details</button><a class="btn small primary" target="_blank" rel="noopener" href="' + esc(safeUrl(u.apply)) + '">Open application ↗</a><button class="btn small ghost" data-act="plan" data-id="' + u.id + '">Remove</button></div></div>';
    }).join('') : '<div class="pb"><div class="empty"><h3>No applications yet</h3><p class="muted">Add universities from Discover with “Add to my plan”.</p><a class="btn primary" href="#discover">Go to Discover</a></div></div>';
    el.innerHTML = '<div class="strip"><h1>My <em>application</em> plan</h1><p>Tick each document once; it counts for every application. Everything is saved in this browser only.</p></div>' +
      '<div class="actions no-print" style="padding:0 0 14px"><button class="btn" data-act="copy">Copy summary</button><button class="btn" data-act="print">Print / save as PDF</button></div>' +
      '<div class="cols"><div class="panel"><h2>My documents · ' + done + '/' + core.length + '</h2><div class="pb"><div class="meter" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
      core.map(docItem).join('') + '<p class="muted" style="margin:14px 0 4px;font:500 11px var(--f-mono);letter-spacing:.08em;text-transform:uppercase">If your programme asks</p>' + extra.map(docItem).join('') + '</div></div>' +
      '<div class="panel"><h2>My applications · ' + apps.length + '</h2>' + appHtml + '</div></div>';
  }
  function planText() {
    var lines = ['SILKPATH — my application plan (' + fmtDate(TODAY) + ')', ''];
    S.shortlist.forEach(function (id) {
      var r = rowFor(id); if (!r) return; var t = S.tracker[id] || { status: 'researching', notes: '' };
      lines.push('• ' + r.uni.name + ' (' + r.uni.city + ') — ' + (STATUS.filter(function (s) { return s[0] === t.status; })[0] || [0, 'Researching'])[1]);
      lines.push('  ' + r.primary.program.name + ', first-year cash ' + firstYearText(r.primary) + ', apply: ' + r.uni.apply);
      if (t.notes) lines.push('  Notes: ' + t.notes);
    });
    lines.push('', 'Documents ready:');
    D.docs.forEach(function (d) { lines.push((S.docs[d.key] ? '[x] ' : '[ ] ') + d.label); });
    return lines.join('\n');
  }

  /* ---------- Guide ---------- */
  function renderGuide() {
    $('#view-guide').innerHTML = '<div class="strip"><h1>Applying from <em>Ethiopia</em>, step by step</h1><p>What the official pages say, and what still needs confirming with the Ministry of Education or the Chinese Embassy in Addis Ababa.</p></div>' +
      '<div class="prose">' +
      '<div class="note"><b>Check your category first.</b> Chinese government (CSC) undergraduate scholarships are for high-school graduates under 25. If you already hold a bachelor’s degree, you can still study a second bachelor’s self-funded or on some university awards, but CSC will usually point you to the master’s category. Confirm with each university.</div>' +
      '<h2>Four ways to pay less</h2><div class="routes">' + D.routes.map(function (r) { return '<div class="route"><h3>' + esc(r.name) + '</h3><div class="best">' + esc(r.best) + '</div><p>' + esc(r.body) + '</p><div class="st">' + esc(r.status) + '</div></div>'; }).join('') + '</div>' +
      '<h2>About “free” Chinese language</h2><p>No university I could verify teaches Chinese free to everyone. There are three real routes:</p><ul>' +
      '<li><b>CSC prep year.</b> Chinese-taught CSC undergraduates take a funded preparatory year. Tongji, Tianjin and SCUT are prep institutions (confirm the current list).</li>' +
      '<li><b>English-taught programmes.</b> No Chinese year at all, but you need English proof. A letter from your earlier English-medium school or degree is accepted by some universities (Shandong Jianzhu says so).</li>' +
      '<li><b>Pay as you go.</b> Typically ¥3,500–19,800 for a year at the universities listed here.</li></ul>' +
      '<h2>The new CSCA exam</h2><p>From 2026/27, bachelor’s applicants to Chinese-government-scholarship universities take the China Scholastic Competency Assessment. Math is compulsory for every programme. English-taught programmes skip Professional Chinese. Physics or Chemistry are required for science and engineering majors. Sessions run in January, March, April, June and December; January and March suit Africa. Fees are ¥450 for one subject and ¥700 for two or more. Register at <a href="https://www.csca.cn" target="_blank" rel="noopener">csca.cn</a>. I could not confirm Ethiopian test centres — home-based online testing exists.</p>' +
      '<h2>Steps</h2><ol class="steps">' + D.steps.map(function (s) { return '<li><b>' + esc(s.t) + '</b><span>' + esc(s.d) + '</span></li>'; }).join('') + '</ol>' +
      '<h2>Documents</h2><ul>' + D.docs.map(function (d) { return '<li>' + esc(d.label) + (d.tip ? ' — <span class="muted">' + esc(d.tip) + '</span>' : '') + '</li>'; }).join('') + '</ul>' +
      '<div class="note blue"><b>Avoid scams.</b> Apply only through university portals (.edu.cn, or the portal a university links) and <a href="https://www.campuschina.org" target="_blank" rel="noopener">campuschina.org</a>. Never pay anyone for a “guaranteed” scholarship or a visa letter. Admission notices come from the university.</div></div>';
  }

  /* ---------- Data & method ---------- */
  function renderData() {
    var counts = { official: 0, partial: 0, agency: 0 }; D.universities.forEach(function (u) { counts[u.confidence]++; });
    var np = D.universities.reduce(function (a, u) { return a + u.programs.length; }, 0);
    var W = { cost: 'Total cost over the degree (tuition, housing, insurance, fees, Chinese year, living) ranked against the other matches. Unknown tuition scores zero. Over your budget: ×0.4.', scholarship: 'CSC route (confirmed 40, possible 20), tuition waivers (up to 35), provincial/municipal awards (8–25), summed to 100. CSC drops out if you are 25+ or hold a bachelor’s degree.', language: 'English-taught 95/70, HSK already met 85, free CSC prep year 100, otherwise falls with the language fee.', quality: 'Editorial 1–5 judgement of academic standing in art/architecture. Not an official ranking.', speed: 'Verified spring-2027 route 100, reported 70, none 40.', ease: 'Penalises HSK gap, missing English proof, missing portfolio and unknown tuition.' };
    $('#view-data').innerHTML = '<div class="strip"><h1>Data &amp; <em>method</em></h1><p>How the ranking works and how much to trust each number.</p></div><div class="prose">' +
      '<div class="note"><b>Coverage.</b> ' + D.universities.length + ' universities and ' + np + ' programmes, checked ' + fmtDate(D.verifiedOn) + '. This is not “all universities in China” — there are about 3,000 institutions and most do not publish comparable fee data in English. Silkpath covers universities with art or architecture degrees that publish enough to compare, and marks every gap instead of guessing. ' + counts.official + ' use official pages, ' + counts.partial + ' are partly verified, ' + counts.agency + ' rely on third-party listings.</div>' +
      '<h2>How the match score works</h2><p>Six scores, 0–100, weighted by the sliders in your brief (defaults 7:4:3:2:2:2). Third-party data is discounted slightly. Grades: A 78+, B 66+, C 54+, D 42+, E below.</p><div class="weights">' +
      PRIOS.map(function (x) { return '<div><b>' + x[1] + '</b>' + esc(W[x[0]]) + '</div>'; }).join('') + '</div>' +
      '<h2>Exchange rates</h2><p>$1 = ¥' + R.cnyPerUsd + ' = Br ' + R.etbPerUsd + '. ' + esc(R.note) + '</p>' +
      '<h2>Every university and its sources</h2><div style="overflow-x:auto"><table class="coverage"><thead><tr><th>University</th><th>Confidence</th><th>Sources</th></tr></thead><tbody>' +
      D.universities.map(function (u) { return '<tr><td><b>' + esc(u.name) + '</b><br><span class="muted">' + esc(u.city) + '</span></td><td><span class="badge ' + confClass(u.confidence) + '">' + confLabel(u.confidence) + '</span></td><td>' + u.sources.map(function (s) { return '<a target="_blank" rel="noopener" href="' + esc(safeUrl(s.url)) + '">' + esc(s.label) + ' ↗</a>'; }).join('<br>') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h2>Adding or correcting a university</h2><p>Edit <code>js/data.js</code>. Each entry holds fees, programmes, scholarships, dates and source links. Open <code>test/run.html</code> to check the dataset and cost maths still pass.</p></div>';
  }

  /* ---------- actions & events ---------- */
  function toggle(arr, id, max) {
    var i = arr.indexOf(id);
    if (i > -1) { arr.splice(i, 1); return false; }
    if (max && arr.length >= max) return null;
    arr.push(id); return true;
  }
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2400); }
  function refresh() {
    renderTabs();
    var v = currentView();
    if (v === 'discover') renderResults(); else if (v === 'compare') renderCompare(); else if (v === 'plan') renderPlan();
    if (UI.drawer) renderDrawer();
  }

  document.addEventListener('click', function (e) {
    var set = e.target.closest('[data-set]');
    if (set) {
      S.profile[set.dataset.set] = set.dataset.val; save();
      $$('[data-set="' + set.dataset.set + '"]', $('#brief')).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.val === set.dataset.val)); });
      renderResults(); return;
    }
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.dataset.act, id = a.dataset.id;
    if (act === 'reset') { S.profile = defaultState().profile; save(); renderDiscover(); renderResults(); toast('Brief reset'); }
    else if (act === 'open') openDrawer(id, a);
    else if (act === 'close') closeDrawer();
    else if (act === 'prog') { UI.drawerProg = +a.dataset.i; renderDrawer(); }
    else if (act === 'plan') { var r1 = toggle(S.shortlist, id); save(); toast(r1 ? 'Added to my plan' : 'Removed from my plan'); refresh(); }
    else if (act === 'cmp') { var r2 = toggle(S.compare, id, 4); if (r2 === null) toast('Compare holds four. Remove one first.'); else { toast(r2 ? 'Added to compare' : 'Removed from compare'); } save(); refresh(); }
    else if (act === 'print') window.print();
    else if (act === 'copy') {
      var txt = planText();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('Summary copied'); }, function () { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Summary copied'); } catch (x) { toast('Copy failed — select and copy manually'); } ta.remove(); });
    }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset.weight) { S.profile.weights[t.dataset.weight] = +t.value; t.nextElementSibling.textContent = t.value; save(); renderResults(); return; }
    if (t.dataset.bind === 'budgetUsd') { S.profile.budgetUsd = +t.value; budgetHint(); save(); renderResults(); return; }
    if (t.dataset.bind === 'age') { S.profile.age = t.value; save(); renderResults(); return; }
    if (t.dataset.track === 'notes') { S.tracker[t.dataset.id] = Object.assign({ status: 'researching' }, S.tracker[t.dataset.id], { notes: t.value }); save(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'sort') { S.sort = t.value; save(); renderResults(); }
    else if (t.id === 'currency') { S.currency = t.value; save(); refresh(); budgetHint(); }
    else if (t.dataset.bind === 'hsk') { S.profile.hsk = +t.value; save(); renderResults(); }
    else if (t.dataset.bind && t.type === 'checkbox') {
      S.profile[t.dataset.bind] = t.checked; save();
      if (t.dataset.bind === 'budgetOn') { var rg = $('[data-bind="budgetUsd"]'); rg.disabled = !t.checked; budgetHint(); }
      renderResults();
    }
    else if (t.dataset.doc) { S.docs[t.dataset.doc] = t.checked; save(); renderPlan(); }
    else if (t.dataset.track === 'status') { S.tracker[t.dataset.id] = Object.assign({ notes: '' }, S.tracker[t.dataset.id], { status: t.value }); save(); toast('Status saved'); }
  });
  $('#scrim').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && UI.drawer) closeDrawer(); });
  window.addEventListener('hashchange', function () { UI.navigated = true; showView(); });
  if (window.matchMedia) {
    window.matchMedia('(min-width: 1001px)').addEventListener('change', function (m) { var b = $('#brief'); if (b) b.open = m.matches; });
  }

  /* ---------- boot ---------- */
  $('#currency').value = S.currency;
  compute();
  renderDiscover();
  showView();
})();
