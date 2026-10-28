/* Silkpath UI — vanilla JS, no build step. */
(function () {
  'use strict';
  var D = window.SILKPATH_DATA, E = window.SilkpathEngine, LG = window.SILKPATH_LANG;
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
      sort: 'score', currency: 'CNY', shortlist: [], compare: [], tracker: {}, docs: {},
      lang: { age: '', hskBand: 0, hskk: false, recommendation: false, duration: 'semester', term: 'any', budgetOn: false, budgetUsd: 2500, hideClosed: false, sort: 'score' },
      dir: { q: '', province: -1, level: 'all', own: 'all', moe: false, en: false, site: false, profile: false, shown: 60 },
      langShortlist: [],
      canada: { field: 'arts', situation: 'finalYear', sort: 'cash', prov: -1, q: '' }
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
      base.lang = Object.assign(defaultState().lang, (s && typeof s.lang === 'object' && s.lang) || {});
      base.dir = Object.assign(defaultState().dir, (s && typeof s.dir === 'object' && s.dir) || {});
      base.canada = Object.assign(defaultState().canada, (s && typeof s.canada === 'object' && s.canada) || {});
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
    st.rawTracker = st.tracker; var tr = {}, statuses = ['researching', 'preparing', 'submitted', 'offer', 'declined'];
    known.forEach(function (id) { var t = st.tracker && st.tracker[id]; if (t && typeof t === 'object') tr[id] = { status: oneOf(t.status, statuses, 'researching'), notes: typeof t.notes === 'string' ? t.notes.slice(0, 2000) : '' }; });
    st.tracker = tr;
    var docs = {}; D.docs.forEach(function (x) { if (st.docs && st.docs[x.key] === true) docs[x.key] = true; }); st.docs = docs;
    // language route + directory state
    var l = st.lang, dd = d.lang;
    l.age = l.age === '' ? '' : String(Math.round(num(l.age, 10, 70, 22)));
    l.hskBand = Math.round(num(l.hskBand, 0, 4, 0));
    l.hskk = l.hskk === true; l.recommendation = l.recommendation === true; l.budgetOn = l.budgetOn === true; l.hideClosed = l.hideClosed === true;
    l.duration = oneOf(l.duration, ['semester', 'year'], dd.duration); l.term = oneOf(l.term, ['spring', 'autumn', 'any'], dd.term);
    l.budgetUsd = Math.round(num(l.budgetUsd, 1000, 6000, dd.budgetUsd)); l.sort = oneOf(l.sort, ['score', 'cost', 'tuition', 'date', 'pocket'], 'score');
    var lids = LG.programmes.map(function (p) { return p.id; });
    st.langShortlist = Array.isArray(st.langShortlist) ? st.langShortlist.filter(function (id) { return lids.indexOf(id) > -1; }) : [];
    lids.forEach(function (id) { var t = st.rawTracker && st.rawTracker['lang:' + id]; if (t && typeof t === 'object') st.tracker['lang:' + id] = { status: oneOf(t.status, statuses, 'researching'), notes: typeof t.notes === 'string' ? t.notes.slice(0, 2000) : '' }; });
    var x = st.dir, dx = d.dir;
    x.q = typeof x.q === 'string' ? x.q.slice(0, 80) : ''; x.province = Math.round(num(x.province, -1, 30, -1));
    x.level = oneOf(x.level, ['all', 'degree', 'vocational'], 'all'); x.own = oneOf(x.own, ['all', 'public', 'private'], 'all');
    ['moe', 'en', 'site', 'profile'].forEach(function (k) { x[k] = x[k] === true; }); x.shown = dx.shown;
    var cn = st.canada;
    cn.field = oneOf(cn.field, ['arts', 'science', 'eng'], 'arts'); cn.situation = oneOf(cn.situation, ['finalYear', 'earlierGrad', 'bachelor', 'master'], 'finalYear');
    cn.sort = oneOf(cn.sort, ['cash', 'award', 'coverage', 'credential'], 'cash'); cn.prov = Math.round(num(cn.prov, -1, 10, -1)); cn.q = typeof cn.q === 'string' ? cn.q.slice(0, 60) : '';
    delete st.rawTracker;
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
  var VIEWS = [['start', 'Start here'], ['language', 'Language'], ['universities', 'All universities'], ['canada', 'Canada'], ['degrees', 'Degrees'], ['compare', 'Compare'], ['plan', 'My plan'], ['guide', 'Guide'], ['data', 'Data & method']];
  function currentView() {
    var h = (location.hash || '#start').replace('#', '').split('/')[0];
    if (h === 'discover') h = 'degrees'; // old shared links
    if (h === 'routes') return 'start';
    return VIEWS.some(function (v) { return v[0] === h; }) ? h : 'start';
  }
  function renderTabs() {
    var v = currentView();
    $('#tabs').innerHTML = VIEWS.map(function (t) {
      var n = t[0] === 'compare' ? S.compare.length : t[0] === 'plan' ? S.shortlist.length + S.langShortlist.length : 0;
      if (t[0] === 'compare' && !n && v !== 'compare') return '';
      return '<a href="#' + t[0] + '"' + (t[0] === v ? ' aria-current="page"' : '') + '>' + t[1] + (n ? '<span class="count">' + n + '</span>' : '') + '</a>';
    }).join('');
  }
  function showView() {
    var v = currentView();
    $$('.view').forEach(function (el) { el.hidden = el.id !== 'view-' + v; });
    renderTabs();
    if (v === 'start') renderStart();
    if (v === 'language') renderLanguage();
    if (v === 'universities') renderUniversities();
    if (v === 'canada') renderCanada();
    if (v === 'degrees') renderResults();
    if (v === 'compare') renderCompare();
    if (v === 'plan') renderPlan();
    if (v === 'guide') renderGuide();
    if (v === 'data') renderData();
    document.body.classList.toggle('printing-plan', v === 'plan');
    var names = { start: 'Learn Chinese in China, free', language: 'Chinese-language programmes', universities: 'All universities in China', canada: 'Canada: scholarships and what you must show', degrees: 'Art and architecture degrees', compare: 'Compare universities', plan: 'My application plan', guide: 'Applying from Ethiopia', data: 'Data and method' };
    document.title = names[v] + ' — Silkpath';
    window.scrollTo(0, 0);
    if (location.hash === '#routes') { var rt = $('#routes'); if (rt) rt.scrollIntoView(); }
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
    $('#view-degrees').innerHTML =
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
  function openDrawer(id, opener, kind) {
    UI.drawer = id; UI.drawerKind = kind || 'degree'; UI.drawerProg = 0; UI.lastFocus = opener || document.activeElement;
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
    if (UI.drawerKind === 'lang') return renderLangDrawer();
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
    if (!ids.length) { el.innerHTML = head + '<div class="empty"><h3>Nothing to compare yet</h3><p class="muted">Press “Compare” on any university in Degrees.</p><a class="btn primary" href="#degrees">Go to Degrees</a></div>'; return; }
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
  function appCard(key, title, sub, extraRows, links, name) {
    var t = S.tracker[key] || { status: 'researching', notes: '' };
    return '<div class="app"><div class="app-head"><h3>' + title + '</h3><span class="mono muted" style="font-size:12px">' + sub + '</span></div>' +
      '<div class="row"><label>Status <select data-track="status" data-id="' + esc(key) + '">' + STATUS.map(function (s2) { return '<option value="' + s2[0] + '"' + (t.status === s2[0] ? ' selected' : '') + '>' + s2[1] + '</option>'; }).join('') + '</select></label>' + extraRows + '</div>' +
      '<textarea data-track="notes" data-id="' + esc(key) + '" placeholder="Notes: contact person, agency number, questions to ask…" aria-label="Notes for ' + esc(name) + '">' + esc(t.notes) + '</textarea>' + links + '</div>';
  }
  function renderPlan() {
    var el = $('#view-plan');
    var core = D.docs.filter(function (d) { return d.all; }), extra = D.docs.filter(function (d) { return !d.all; });
    var done = core.filter(function (d) { return S.docs[d.key]; }).length, pct = Math.round(done / core.length * 100);
    var deg = S.shortlist.map(function (id) { return rowFor(id); }).filter(Boolean);
    var lang = S.langShortlist.map(langProgById).filter(Boolean);
    var langHtml = lang.map(function (p) {
      var c = E.langCost(p, S.lang.duration), it = E.intakeFor(p, S.lang.term, TODAY);
      var rowx = '<span>' + (S.lang.duration === 'year' ? 'One year' : 'One semester') + ' all-in: <b>' + money(c.total) + '</b></span>';
      var line = '<div class="row"><span>' + intakeText(it) + '</span></div>';
      var links = '<div class="row no-print"><button class="btn small" data-act="lopen" data-id="' + p.id + '">Details</button><a class="btn small primary" target="_blank" rel="noopener" href="' + esc(safeUrl(p.sources[0].url)) + '">Official page ↗</a><button class="btn small ghost" data-act="lplan" data-id="' + p.id + '">Remove</button></div>';
      return appCard('lang:' + p.id, esc(p.en), esc(p.city) + ' · language', rowx, line + links, p.en);
    }).join('');
    var degHtml = deg.map(function (r) {
      var u = r.uni, d = r.deadline;
      var rowx = '<span>Cheapest route: <b>' + esc(r.primary.program.name) + '</b>, ' + firstYearText(r.primary) + ' first year</span>';
      var line = '<div class="row"><span>' + (d ? (d.lastCycle ? 'Last cycle closed ' + fmtDate(d.close) + ' — 2027 date not yet published' : 'Next deadline <b>' + fmtDate(d.close) + '</b> (' + d.days + ' days)') : 'Deadline not published — email admissions') + '</span></div>';
      var links = '<div class="row no-print"><button class="btn small" data-act="open" data-id="' + u.id + '">Details</button><a class="btn small primary" target="_blank" rel="noopener" href="' + esc(safeUrl(u.apply)) + '">Open application ↗</a><button class="btn small ghost" data-act="plan" data-id="' + u.id + '">Remove</button></div>';
      return appCard(u.id, esc(u.name), esc(u.city) + ' · degree', rowx, line + links, u.name);
    }).join('');
    var any = lang.length + deg.length;
    var appHtml = any ? ((langHtml ? '<div class="pb" style="padding-bottom:0"><b class="mono" style="font-size:11px;letter-spacing:.08em">CHINESE-LANGUAGE PROGRAMMES</b></div>' + langHtml : '') + (degHtml ? '<div class="pb" style="padding-bottom:0"><b class="mono" style="font-size:11px;letter-spacing:.08em">DEGREES</b></div>' + degHtml : '')) :
      '<div class="pb"><div class="empty"><h3>No applications yet</h3><p class="muted">Add programmes from Language or Degrees with “Add to my plan”.</p><a class="btn primary" href="#language">Go to Language</a></div></div>';
    el.innerHTML = '<div class="strip"><h1>My <em>application</em> plan</h1><p>Tick each document once; it counts for every application. Everything is saved in this browser only.</p></div>' +
      '<div class="actions no-print" style="padding:0 0 14px"><button class="btn" data-act="copy">Copy summary</button><button class="btn" data-act="print">Print / save as PDF</button></div>' +
      '<div class="cols"><div class="panel"><h2>My documents · ' + done + '/' + core.length + '</h2><div class="pb"><div class="meter" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
      core.map(docItem).join('') + '<p class="muted" style="margin:14px 0 4px;font:500 11px var(--f-mono);letter-spacing:.08em;text-transform:uppercase">If your programme asks</p>' + extra.map(docItem).join('') + '</div></div>' +
      '<div class="panel"><h2>My applications · ' + any + '</h2>' + appHtml + '</div></div>';
  }
  function planText() {
    var lines = ['SILKPATH — my application plan (' + fmtDate(TODAY) + ')', ''];
    S.langShortlist.forEach(function (id) {
      var p = langProgById(id); if (!p) return; var t = S.tracker['lang:' + id] || { status: 'researching', notes: '' };
      lines.push('• ' + p.en + ' (' + p.city + ') — Chinese language — ' + (STATUS.filter(function (s2) { return s2[0] === t.status; })[0] || [0, 'Researching'])[1]);
      lines.push('  all-in ' + money(E.langCost(p, S.lang.duration).total) + ', page: ' + p.sources[0].url);
      if (t.notes) lines.push('  Notes: ' + t.notes);
    });
    S.shortlist.forEach(function (id) {
      var r = rowFor(id); if (!r) return; var t = S.tracker[id] || { status: 'researching', notes: '' };
      lines.push('• ' + r.uni.name + ' (' + r.uni.city + ') — degree — ' + (STATUS.filter(function (s2) { return s2[0] === t.status; })[0] || [0, 'Researching'])[1]);
      lines.push('  ' + r.primary.program.name + ', first-year cash ' + firstYearText(r.primary) + ', apply: ' + r.uni.apply);
      if (t.notes) lines.push('  Notes: ' + t.notes);
    });
    lines.push('', 'Documents ready:');
    D.docs.forEach(function (d) { lines.push((S.docs[d.key] ? '[x] ' : '[ ] ') + d.label); });
    return lines.join('\n');
  }

  /* ---------- Guide ---------- */
  function renderGuide() {
    var sch = LG.scholarship;
    $('#view-guide').innerHTML = '<div class="strip"><h1>Going to China from <em>Ethiopia</em></h1><p>The fastest, cheapest route first — then degrees. What the official pages say, and what still needs confirming with the Confucius Institute at Addis Ababa University or the Chinese Embassy.</p></div>' +
      '<div class="prose">' +
      '<div class="note"><b>The short version.</b> Study Chinese for one semester (5 months) or one year (11 months) on the ' + esc(sch.name) + '. It pays your tuition, housing and insurance and gives you <b>' + money(sch.allowanceMonthly) + ' a month</b>. You need to be 16–35, have HSK 3 and an HSKK score, and have a recommendation letter. Flights are not covered.</div>' +
      '<h2>Six steps</h2><ol class="steps">' + LG.steps.map(function (st) { return '<li><b>' + esc(st.t) + '</b><span>' + esc(st.d) + '</span></li>'; }).join('') + '</ol>' +
      '<h2>Not at HSK 3 yet? A realistic plan</h2><ol class="steps"><li><b>Start learning now</b><span>HSK 3 is about 300 study hours. Join classes at the Confucius Institute at Addis Ababa University or another Chinese course in Ethiopia; ask them about free classes and about being your recommender.</span></li><li><b>Book HSK 3 and HSKK</b><span>Register on chinesetest.cn. Aim to have scores in hand by April 2027 so you can apply when the September 2027 window opens (about 1 March – 15 May, to be confirmed).</span></li><li><b>If you need to be in China sooner</b><span>Pay for a language semester at one of the low-cost universities on the <a href="#language">Language</a> page, then apply for the scholarship or a degree from inside China.</span></li></ol>' +
      '<h2>Money, honestly</h2><ul><li>The allowance is <b>' + money(sch.allowanceMonthly) + '</b> a month (' + sub(sch.allowanceMonthly) + '). If you enrol after the 15th of a month you get half of that month’s.</li><li>If the university cannot house you, a housing allowance of ' + money(sch.offCampusHousingMonthly) + ' a month applies instead.</li><li>Not covered: international flights, visa fees, the medical exam, textbooks.</li><li>Working while on a student visa generally needs written permission from your university and the immigration office. Do not plan on part-time jobs.</li><li>Stays of more than 180 days need an X1 student visa; shorter ones an X2. Your admission notice and JW202 form say which.</li></ul>' +
      '<h2>Documents</h2><ul>' + D.docs.map(function (d) { return '<li>' + esc(d.label) + (d.tip ? ' — <span class="muted">' + esc(d.tip) + '</span>' : '') + '</li>'; }).join('') + '</ul>' +
      '<h2>After the language year: degree routes</h2><div class="routes">' + D.routes.map(function (r) { return '<div class="route" style="margin:0"><h3>' + esc(r.name) + '</h3><div class="best mono" style="color:var(--ok);font-size:11px">' + esc(r.best) + '</div><p style="font-size:13.5px">' + esc(r.body) + '</p><div class="mono" style="color:var(--warn);font-size:11px">' + esc(r.status) + '</div></div>'; }).join('') + '</div>' +
      '<p>Bachelor’s scholarship applicants also take the new CSCA exam (Math compulsory; sessions in January, March, April, June and December; January and March suit Africa; register at <a href="https://www.csca.cn" target="_blank" rel="noopener">csca.cn</a>). Tongji, Tianjin and SCUT run the funded Chinese preparatory year for CSC undergraduates.</p>' +
      '<div class="note blue"><b>Avoid scams.</b> Apply only through <a href="' + esc(safeUrl(sch.portal)) + '" target="_blank" rel="noopener">chinese.cn</a>, <a href="https://www.campuschina.org" target="_blank" rel="noopener">campuschina.org</a> and university websites (.edu.cn). Nobody can sell you a guaranteed scholarship, and the official recommendation comes from a Confucius Institute, HSK centre or Chinese department — not from an agent.</div>' +
      '<div class="note small"><b>Not confirmed:</b> Ethiopia-specific details — the Addis Ababa HSK test centre and dates, Confucius Institute class fees, whether the Chinese Embassy runs its own nominations, document legalisation rules. Ask the Confucius Institute at Addis Ababa University and the Chinese Embassy. CLEC’s own contact: ' + esc(sch.email) + '.</div></div>';
  }

  /* ---------- Data & method ---------- */
  function renderData() {
    var counts = { official: 0, partial: 0, agency: 0 }; D.universities.forEach(function (u) { counts[u.confidence]++; });
    var np = D.universities.reduce(function (a, u) { return a + u.programs.length; }, 0);
    var lo = LG.programmes.filter(function (p) { return p.conf === 'official'; }).length;
    var W = { cost: 'Total cost over the degree (tuition, housing, insurance, fees, Chinese year, living) ranked against the other matches. Unknown tuition scores zero. Over your budget: ×0.4.', scholarship: 'CSC route (confirmed 40, possible 20), tuition waivers (up to 35), provincial/municipal awards (8–25), summed to 100. Awards with an age limit drop out if you are too old.', language: 'English-taught 95/70, HSK already met 85, free CSC prep year 100, otherwise falls with the language fee.', quality: 'Editorial 1–5 judgement of academic standing in art/architecture. Not an official ranking.', speed: 'Verified spring-2027 route 100, reported 70, none 40.', ease: 'Penalises HSK gap, missing English proof, missing portfolio and unknown tuition.' };
    $('#view-data').innerHTML = '<div class="strip"><h1>Data &amp; <em>method</em></h1><p>What is covered, what is verified, and how the scores work.</p></div><div class="prose">' +
      '<div class="note"><b>Three layers of data, three levels of trust.</b><br>' +
      '<b>1. Every institution — ' + LG.directory.count.toLocaleString('en-US') + '.</b> The Ministry of Education’s official list of regular higher-education institutions (as of 17 June 2026): names, codes, provinces, cities, level, private/public. English names and websites come from Wikidata (open data) where available. This is a directory, not a recommendation: many institutions do not take international students.<br>' +
      '<b>2. ' + LG.programmes.length + ' Chinese-language programmes</b> in ' + new Set(LG.programmes.map(function (p) { return p.province; })).size + ' provinces with published fees: ' + lo + ' read on the university’s own page, ' + (LG.programmes.length - lo) + ' partly verified. Checked ' + fmtDate(LG.verifiedOn) + '.<br>' +
      '<b>3. ' + D.universities.length + ' universities with art or architecture degrees</b> (' + np + ' programmes): ' + counts.official + ' official, ' + counts.partial + ' partly verified, ' + counts.agency + ' third-party only. Checked ' + fmtDate(D.verifiedOn) + '.<br>' +
      '<b>4. Canada.</b> Permit rules and proof-of-funds from the Government of Canada; ' + CA.scholarships.length + ' undergraduate awards and ' + CA.universities.length + ' universities with 2026-27 tuition from their own pages (' + CA.universities.filter(function (u) { return u.conf === 'official'; }).length + ' read in full, the rest partly verified); the ' + CA.members.rows.length + ' Universities Canada members. Checked ' + fmtDate(CA.verifiedOn) + '.</div>' +
      '<h2>Language-programme value score</h2><p>Cost over the whole stay 50%, deadline timing 20%, confirmed scholarship host 10%, pocket money left after living costs 10%, data quality 10%. “Pocket money left” is the ' + money(LG.scholarship.allowanceMonthly) + ' allowance minus an editorial living-cost estimate for the city.</p>' +
      '<h2>Degree match score</h2><p>Six scores, 0–100, weighted by the sliders on the Degrees page (defaults 7:4:3:2:2:2). Third-party data is discounted slightly. Grades: A 78+, B 66+, C 54+, D 42+, E below.</p><div class="weights">' +
      PRIOS.map(function (x) { return '<div><b>' + x[1] + '</b>' + esc(W[x[0]]) + '</div>'; }).join('') + '</div>' +
      '<h2>Exchange rates</h2><p>$1 = ¥' + R.cnyPerUsd + ' = Br ' + R.etbPerUsd + '. ' + esc(R.note) + '</p>' +
      '<h2>Sources: scholarship</h2><ul>' + LG.scholarship.sources.map(function (s2) { return '<li><a target="_blank" rel="noopener" href="' + esc(safeUrl(s2.url)) + '">' + esc(s2.label) + ' ↗</a></li>'; }).join('') + '</ul>' +
      '<h2>Sources: language programmes</h2><div style="overflow-x:auto"><table class="coverage"><thead><tr><th>University</th><th>Confidence</th><th>Sources</th></tr></thead><tbody>' +
      LG.programmes.map(function (p) { return '<tr><td><b>' + esc(p.en) + '</b><br><span class="muted">' + esc(p.city) + ', ' + esc(p.province) + '</span></td><td><span class="badge ' + confClass(p.conf) + '">' + (p.conf === 'official' ? 'Official page' : 'Partly verified') + '</span></td><td>' + p.sources.map(function (s2) { return '<a target="_blank" rel="noopener" href="' + esc(safeUrl(s2.url)) + '">' + esc(s2.label) + ' ↗</a>'; }).join('<br>') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h2>Sources: degree universities</h2><div style="overflow-x:auto"><table class="coverage"><thead><tr><th>University</th><th>Confidence</th><th>Sources</th></tr></thead><tbody>' +
      D.universities.map(function (u) { return '<tr><td><b>' + esc(u.name) + '</b><br><span class="muted">' + esc(u.city) + '</span></td><td><span class="badge ' + confClass(u.confidence) + '">' + confLabel(u.confidence) + '</span></td><td>' + u.sources.map(function (s2) { return '<a target="_blank" rel="noopener" href="' + esc(safeUrl(s2.url)) + '">' + esc(s2.label) + ' ↗</a>'; }).join('<br>') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h2>Adding or correcting data</h2><p>Language fees are in <code>js/language.js</code>, degree data in <code>js/data.js</code>. The all-universities file is generated by <code>scripts/build_institutions.py</code> from the Ministry list. Run <code>test/run.html</code> after any change.</p></div>';
  }

  /* =====================================================================
   * v1.1 — Chinese-language route, all-universities directory
   * ===================================================================== */
  var HSK_BANDS = [[0, 'No Chinese yet'], [1, 'HSK 1 or 2'], [2, 'HSK 3 — 180 to 209 points'], [3, 'HSK 3 — 210 to 269 points'], [4, 'HSK 3 with 270+, or HSK 4 and above']];

  function langProfile(over) {
    var l = S.lang;
    return Object.assign({
      age: l.age === '' ? null : +l.age, hskBand: +l.hskBand || 0, hskk: !!l.hskk, recommendation: !!l.recommendation,
      duration: l.duration, term: l.term, budgetUsd: l.budgetOn ? +l.budgetUsd : null, hideClosed: !!l.hideClosed, rates: R
    }, over || {});
  }
  function langProgById(id) { return LG.programmes.filter(function (p) { return p.id === id; })[0]; }
  function lsegBtn(key, val, label) { return '<button type="button" data-lset="' + key + '" data-val="' + val + '" aria-pressed="' + (String(S.lang[key]) === val) + '">' + label + '</button>'; }
  function daysText(n) { return n === 0 ? 'today' : n === 1 ? '1 day' : n + ' days'; }

  function langForm() {
    var l = S.lang;
    return '<div class="fld"><label for="l-age">Your age</label><input id="l-age" type="number" min="10" max="70" inputmode="numeric" data-lbind="age" value="' + esc(l.age) + '" placeholder="e.g. 22"><p class="hint">The scholarship is for ages 16–35.</p></div>' +
      '<div class="fld"><label for="l-hsk">Your Chinese level</label><select id="l-hsk" data-lbind="hskBand">' + HSK_BANDS.map(function (b) { return '<option value="' + b[0] + '"' + (+l.hskBand === b[0] ? ' selected' : '') + '>' + b[1] + '</option>'; }).join('') + '</select>' +
        '<label class="check"><input type="checkbox" data-lbind="hskk"' + (l.hskk ? ' checked' : '') + '><span>I have an HSKK (speaking test) score</span></label>' +
        '<label class="check"><input type="checkbox" data-lbind="recommendation"' + (l.recommendation ? ' checked' : '') + '><span>I can get a recommendation letter from a Confucius Institute, an HSK test centre or a university Chinese department</span></label></div>' +
      '<div class="fld"><span class="lab">How long do you want to study?</span><div class="seg" role="group" aria-label="Duration">' + lsegBtn('duration', 'semester', 'One semester') + lsegBtn('duration', 'year', 'One year') + '</div></div>' +
      '<div class="fld"><span class="lab">When do you want to start?</span><div class="seg" role="group" aria-label="Start">' + lsegBtn('term', 'spring', 'March 2027') + lsegBtn('term', 'autumn', 'Sept 2027') + lsegBtn('term', 'any', 'Any') + '</div></div>';
  }

  /* ---------- Start ---------- */
  function routeCard(r) {
    var labels = { ready: 'Apply now', prepare: 'Get ready', ask: 'Ask first', tooLate: 'Too late', closed: 'Closed', no: 'Not eligible' };
    var free = r.kind === 'scholarship';
    var when = r.deadline ? (r.deadline.days >= 0 ? 'Closes ' + fmtDate(r.deadline.date) + ' · ' + daysText(r.deadline.days) + ' left' + (r.basis === 'recurring' ? ' (expected, not yet published)' : '') : 'Closed ' + fmtDate(r.deadline.date)) : '';
    var miss = '';
    if (free && r.elig && r.status !== 'closed') {
      var items = r.elig.missing.filter(function (m) { return !(m.key === 'hskk' && r.track === 'year'); });
      if (items.length) miss = '<ul class="miss">' + items.map(function (m) { return '<li><span class="ic">!</span><span>' + esc(m.text) + '</span></li>'; }).join('') + '</ul>';
    }
    var acts = free
      ? '<a class="btn primary small" target="_blank" rel="noopener" href="' + esc(safeUrl(LG.scholarship.portal)) + '">Open the CLEC portal ↗</a><a class="btn small" href="#language">See host universities</a>'
      : (r.pick ? '<button class="btn primary small" data-act="lopen" data-id="' + r.pick.p.id + '">See ' + esc(r.pick.p.en) + '</button>' : '') + '<a class="btn small" href="#language">All programmes</a>';
    return '<article class="route ' + r.status + '"><div class="top"><h3>' + esc(r.title) + '</h3><span class="stamp ' + r.status + '">' + labels[r.status] + '</span></div>' +
      '<div class="money' + (free ? ' free' : '') + '">' + esc(r.money) + '</div><p class="sum">' + esc(r.summary) + '</p>' + miss +
      (when ? '<div class="when">' + esc(when) + '</div>' : '') + '<div class="actions" style="padding:10px 0 0;border:0">' + acts + '</div></article>';
  }

  function renderStart() {
    var sch = LG.scholarship, d1 = sch.deadlines[0];
    var days = E.daysBetween(TODAY, d1.studentClose);
    var allow = sch.allowanceMonthly;
    var clock = days >= 0
      ? '<div class="clock hot"><div class="n">' + days + '<small>' + (days === 1 ? 'DAY' : 'DAYS') + ' LEFT</small></div><p><b>The March 2027 scholarship window closes on ' + fmtDate(d1.studentClose) + '.</b> You need HSK 3, an HSKK score and a recommendation letter. Not ready? Aim for September 2027 and use the months in between.</p><p class="sub">Published by the scholarship’s host universities from the official CLEC guide. The next window is expected to open on 1 March 2027.</p></div>'
      : '<div class="clock"><div class="n">✓<small>CLOSED</small></div><p><b>The March 2027 window has closed (31 Oct 2026).</b> The next one is September 2027; the portal should open around 1 March 2027.</p></div>';
    var routes = E.findRoutes(LG, langProfile(), TODAY);
    // cheapest places to keep pocket money
    var seen = {}, cities = [];
    LG.programmes.slice().sort(function (a, b) { return a.living - b.living; }).forEach(function (p) { if (!seen[p.city]) { seen[p.city] = 1; cities.push(p); } });
    var pocketRows = cities.slice(0, 6).map(function (p) { var pm = E.pocketMoney(p, allow); return '<tr><td>' + esc(p.city) + ', ' + esc(p.province) + '</td><td class="n">' + money(p.living) + '</td><td class="n" style="color:var(--' + (pm.net >= 0 ? 'ok' : 'chop') + ')">' + (pm.net >= 0 ? '+' : '−') + money(Math.abs(pm.net)) + '</td></tr>'; }).join('');
    $('#view-start').innerHTML =
      '<div class="hero"><div><h1>Learn Chinese in China — <em>free</em>, with pocket money.</h1>' +
      '<p class="lede">The easiest way to China is a short Chinese-language course. One scholarship pays your tuition and housing <b>and</b> puts <b>' + money(allow) + ' a month</b> in your pocket. Tell us where you are; we show the fastest route, the deadline, and every university in China.</p>' +
      '<div class="cta"><a class="btn primary big" href="#routes">Find my route</a><a class="btn big" href="#language">Compare language programmes</a><a class="btn big ghost" href="#universities">Search all ' + LG.directory.count.toLocaleString('en-US') + ' universities</a></div></div>' +
      '<div class="spec"><h2>' + esc(sch.name) + '</h2><div class="sub">Formerly the ' + esc(sch.formerly) + '. Run by CLEC, China.</div><div class="spec-grid">' +
        '<div><div class="k">Tuition</div><div class="v free">Free</div><div class="s">paid by the scholarship</div></div>' +
        '<div><div class="k">Housing</div><div class="v free">Free</div><div class="s">shared on-campus</div></div>' +
        '<div><div class="k">Pocket money</div><div class="v">' + money(allow) + ' /mo</div><div class="s">' + sub(allow) + '</div></div>' +
        '<div><div class="k">Length</div><div class="v">5 or 11 months</div><div class="s">semester or year</div></div>' +
        '<div><div class="k">Age</div><div class="v">16 – 35</div><div class="s">on 1 September</div></div>' +
        '<div><div class="k">You need</div><div class="v">HSK 3 + HSKK</div><div class="s">and a recommender</div></div></div>' +
      '<div class="foot">Flights, visa and medical exam are not covered.</div></div></div>' +
      clock +
      '<div id="routes" class="cols2"><div class="situation"><h2>About you</h2><div class="sb">' + langForm() + '<p class="hint">Saved only in your browser.</p></div></div>' +
      '<div><h2 class="sec-title">Your routes, best first</h2><p class="sec-sub">Updated as you change the form. “Scholarship” routes pay you; “Pay yourself” routes cost money but have fewer requirements.</p><div id="routelist">' + routes.map(routeCard).join('') + '</div></div></div>' +
      '<h2 class="sec-title" style="margin-top:30px">Where the pocket money lasts</h2><p class="sec-sub">Estimated monthly living costs (food, transport, phone) against the ' + money(allow) + ' allowance, in the cities where language courses are cheapest. These are editorial estimates; housing is paid by the scholarship.</p>' +
      '<div style="overflow-x:auto"><table class="t" style="max-width:640px;background:var(--sheet);border:1px solid var(--ink)"><thead><tr><th>City</th><th class="n">Living / month</th><th class="n">Left from allowance</th></tr></thead><tbody>' + pocketRows + '</tbody></table></div>' +
      '<div class="note blue" style="margin-top:22px;max-width:78ch"><b>Then what?</b> After a language semester or year you can apply for a bachelor’s degree in China. The <a href="#degrees">Degrees</a> page compares art and architecture programmes, and <a href="#universities">All universities</a> lists every institution in every province. Thinking about Canada? Read <a href="#canada">the honest picture</a> first: it is much harder and costlier than China.</div>';
  }
  function refreshRoutes() { var el = $('#routelist'); if (el) el.innerHTML = E.findRoutes(LG, langProfile(), TODAY).map(routeCard).join(''); }

  /* ---------- Language programmes ---------- */
  function langSort(rows) {
    var by = S.lang.sort, a = rows.slice();
    var cmp = {
      score: function (x, y) { return y.score - x.score; },
      cost: function (x, y) { return x.cost.total - y.cost.total; },
      tuition: function (x, y) { return x.cost.tuition - y.cost.tuition; },
      date: function (x, y) { var dx = x.intake && x.intake.days != null && x.intake.days >= 0 ? x.intake.days : 9999, dy = y.intake && y.intake.days != null && y.intake.days >= 0 ? y.intake.days : 9999; return dx - dy || y.score - x.score; },
      pocket: function (x, y) { return y.pocket.net - x.pocket.net; }
    }[by] || function (x, y) { return y.score - x.score; };
    return a.sort(cmp);
  }

  function intakeText(it) {
    if (!it) return '<span class="muted">No dates published</span>';
    if (!it.deadline) return esc(it.term) + ' · <span class="muted">deadline not published</span>';
    var tail = it.basis === 'recurring' ? ' <span class="muted">(last cycle’s date)</span>' : '';
    return esc(it.term) + ' · ' + (it.open ? 'apply by ' + fmtDate(it.deadline) + ' · ' + daysText(it.days) + ' left' : '<span style="color:var(--chop)">closed ' + fmtDate(it.deadline) + '</span>') + tail;
  }

  function lrow(r, i) {
    var p = r.p, dur = S.lang.duration, allow = LG.scholarship.allowanceMonthly;
    var inPlan = S.langShortlist.indexOf(p.id) > -1;
    var net = r.pocket.net;
    var months = dur === 'year' ? 'year' : 'semester';
    return '<article class="lrow" style="animation-delay:' + Math.min(i, 8) * 30 + 'ms"><div class="rank">' + (i + 1) + '</div>' +
      '<div><h3>' + esc(p.en) + '<span class="zh" lang="zh-Hans">' + esc(p.zh) + '</span></h3><div class="meta">' + esc(p.city) + ' · ' + esc(p.province) + ' · <span class="badge ' + confClass(p.conf) + '" style="display:inline-block">' + (p.conf === 'official' ? 'Official page' : 'Partly verified') + '</span>' + (p.clec ? ' <span class="badge ok" style="display:inline-block">Scholarship host</span>' : '') + (r.overBudget ? ' <span class="badge bad" style="display:inline-block">Over budget</span>' : '') + '</div>' +
      '<div class="figs"><div><span class="k">Tuition, one ' + months + '</span><span class="v">' + money(r.cost.tuition) + '</span><span class="s">' + sub(r.cost.tuition) + (r.cost.estimated.year ? ' · est.' : '') + '</span></div>' +
      '<div><span class="k">Total with housing &amp; living</span><span class="v">' + money(r.cost.total) + '</span><span class="s">' + sub(r.cost.total) + '</span></div>' +
      (p.clec ? '<div><span class="k">With the scholarship</span><span class="v pos">' + money(0) + ' to pay</span><span class="s">+ ' + money(allow) + '/mo to you</span></div><div><span class="k">Left each month</span><span class="v ' + (net >= 0 ? 'pos' : 'neg') + '">' + (net >= 0 ? '+' : '−') + money(Math.abs(net)) + '</span><span class="s">after living costs</span></div>' : '<div><span class="k">Scholarship</span><span class="v" style="font-size:14px">Not a confirmed host</span><span class="s">see the host list below</span></div>') +
      '</div><div class="meta">' + intakeText(r.intake) + '</div></div>' +
      '<div class="seal mini-seal" role="img" aria-label="Value score ' + r.score + ' out of 100"><div><b>' + r.score + '</b><small>Grade ' + r.grade + '</small></div></div>' +
      '<div class="acts"><button class="btn primary small" data-act="lopen" data-id="' + p.id + '">See the full breakdown</button><button class="btn small' + (inPlan ? ' on' : '') + '" data-act="lplan" data-id="' + p.id + '" aria-pressed="' + inPlan + '">' + (inPlan ? '✓ In my plan' : '+ Add to my plan') + '</button><a class="btn small ghost" target="_blank" rel="noopener" href="' + esc(safeUrl(p.sources[0].url)) + '">Official page ↗</a></div></article>';
  }

  function renderLanguage() {
    var el = $('#view-language');
    if (!$('#lresults')) {
      el.innerHTML = '<div class="strip"><h1>Chinese-language <em>programmes</em></h1><p>Real fees from university pages, across ' + new Set(LG.programmes.map(function (p) { return p.province; })).size + ' provinces. See what a semester costs you, or what is left of your pocket money if you win the scholarship.</p></div>' +
        '<div class="cols2"><div class="situation"><h2>Your plan</h2><div class="sb">' + langForm() +
        '<div class="fld"><label class="check"><input type="checkbox" data-lbind="budgetOn"' + (S.lang.budgetOn ? ' checked' : '') + '><span>Set a total budget for the stay</span></label><input class="range" type="range" min="1000" max="6000" step="250" data-lbind="budgetUsd" value="' + S.lang.budgetUsd + '" aria-label="Total budget in US dollars"' + (S.lang.budgetOn ? '' : ' disabled') + '><p class="hint" id="lbudget-out"></p></div>' +
        '<div class="fld"><label class="check"><input type="checkbox" data-lbind="hideClosed"' + (S.lang.hideClosed ? ' checked' : '') + '><span>Hide programmes whose deadline has passed</span></label></div></div></div>' +
        '<div><div id="lresults"></div></div></div>' +
        '<h2 class="sec-title" style="margin-top:30px">Scholarship host universities</h2><p class="sec-sub">These universities published a 2026 guide for the ' + esc(LG.scholarship.name) + '. The full host list is inside the CLEC portal after you register (<a target="_blank" rel="noopener" href="' + esc(LG.scholarship.portal) + '">chinese.cn</a>; questions: ' + esc(LG.scholarship.email) + ').</p>' +
        '<div class="hostgrid">' + LG.hosts.map(function (h) { return '<div class="host"><b>' + esc(h.en) + ' <span lang="zh-Hans" class="muted" style="font-weight:400">' + esc(h.zh) + '</span></b><span class="muted">' + esc(h.city) + ', ' + esc(h.province) + '</span><br>' + esc(h.tracks) + '<br><a target="_blank" rel="noopener" href="' + esc(safeUrl(h.source)) + '">Their guide ↗</a></div>'; }).join('') + '</div>';
    }
    lbudgetHint();
    var res = E.rankLanguage(LG, langProfile(), TODAY);
    var rows = langSort(res.rows);
    var cheapest = rows.slice().sort(function (a, b) { return a.cost.total - b.cost.total; })[0];
    $('#lresults').innerHTML = '<div class="results-head"><h2>' + rows.length + ' programmes' + (cheapest ? ' · cheapest all-in: ' + money(cheapest.cost.total) + ' (' + esc(cheapest.p.city) + ')' : '') + '</h2>' +
      '<label class="muted" style="font-size:13px">Sort by <select id="lsort" aria-label="Sort programmes">' + [['score', 'Best value'], ['cost', 'Lowest total cost'], ['tuition', 'Lowest tuition'], ['date', 'Nearest deadline'], ['pocket', 'Most pocket money']].map(function (o) { return '<option value="' + o[0] + '"' + (S.lang.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label></div>' +
      (rows.length ? rows.map(lrow).join('') : '<div class="empty"><h3>No programme matches</h3><p class="muted">Show closed deadlines or raise the budget.</p></div>') +
      '<p class="muted" style="font-size:12.5px">“Total” adds tuition, application fee, insurance, housing and estimated living costs for ' + (S.lang.duration === 'year' ? 'a ten-month academic year' : 'a five-month semester') + '. Where a housing price or fee is not published an estimate is used and marked. Value score: cost 50%, deadline timing 20%, scholarship host 10%, pocket money 10%, data quality 10%.</p>';
    var live = $('#sr-status'); if (live) live.textContent = rows.length + ' programmes shown.';
  }
  function lbudgetHint() { var el = $('#lbudget-out'); if (el) el.textContent = S.lang.budgetOn ? 'Up to $' + (+S.lang.budgetUsd).toLocaleString('en-US') + ' (' + money(S.lang.budgetUsd * R.cnyPerUsd) + ') all-in.' : 'No limit set.'; }

  /* ---------- Language programme drawer ---------- */
  function renderLangDrawer() {
    var p = langProgById(UI.drawer); if (!p) return;
    var dur = S.lang.duration, c = E.langCost(p, dur), allow = LG.scholarship.allowanceMonthly;
    var pm = E.pocketMoney(p, allow);
    var row = E.rankLanguage(LG, langProfile({ hideClosed: false }), TODAY).rows.filter(function (r) { return r.p.id === p.id; })[0];
    var inPlan = S.langShortlist.indexOf(p.id) > -1;
    var est = function (flag) { return flag ? ' <span class="est">estimate</span>' : ''; };
    var rows = [
      ['Tuition (' + (dur === 'year' ? 'one year' : 'one semester') + ')', '', c.tuition, c.estimated.year],
      ['Application fee', 'one time', c.app, c.estimated.app],
      ['Medical insurance', '', c.ins, false],
      ['Housing', c.months + ' months', c.dorm, c.estimated.dorm],
      ['Living (food, transport, phone)', money(p.living) + '/mo × ' + c.months, c.living, true]
    ];
    var intakes = p.intakes.map(function (i) {
      var days = i.deadline ? E.daysBetween(TODAY, i.deadline) : null;
      var st = i.deadline ? (days >= 0 ? '<span class="badge ok">' + daysText(days) + ' left</span>' : '<span class="badge">closed</span>') : '<span class="badge warn">ask admissions</span>';
      var basis = i.basis === 'published' ? 'published' : i.basis === 'recurring' ? 'repeated from a previous cycle' : 'not published';
      return '<tr><td>' + esc(i.term) + '</td><td>' + (i.deadline ? fmtDate(i.deadline) : '—') + '<br><span class="muted" style="font-size:11.5px">' + basis + '</span></td><td>' + st + '</td></tr>';
    }).join('');
    var host = p.clec
      ? '<div class="pocket' + (pm.net < 0 ? ' neg' : '') + '"><b>If you win the scholarship here:</b> you pay ' + money(0) + ' in tuition, housing and insurance, and receive ' + money(allow) + ' a month. After living costs of about ' + money(p.living) + ' you keep about <b>' + (pm.net >= 0 ? '+' : '−') + money(Math.abs(pm.net)) + ' a month</b>' + (pm.net < 0 ? ' — in this city the allowance does not cover everything.' : '.') + '</div>'
      : '<div class="note blue small">This university is not a confirmed host of the scholarship. Scholarship students are placed in host universities chosen from the CLEC portal. Compare the <a href="#language">host list</a>.</div>';
    $('#drawer').innerHTML =
      '<div class="d-head">' + (row ? seal(row.score, row.grade, { lg: true }) : '<span></span>') +
      '<div><h2 id="drawer-title">' + esc(p.en) + '</h2><div class="where"><span lang="zh-Hans">' + esc(p.zh) + '</span> · ' + esc(p.city) + ', ' + esc(p.province) + '</div></div><button class="d-close" data-act="close" aria-label="Close details">×</button></div>' +
      '<div class="d-body"><div class="d-sec"><div class="actions" style="padding:0;border:0"><button class="btn primary" data-act="lplan" data-id="' + p.id + '">' + (inPlan ? '✓ In my plan' : '+ Add to my plan') + '</button>' +
        '<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(safeUrl(p.sources[0].url)) + '">Official page ↗</a><button class="btn ghost" data-act="finduni" data-q="' + esc(p.zh) + '">Find in directory</button></div></div>' +
      '<div class="d-sec"><h3>What it costs if you pay yourself</h3><table class="t"><thead><tr><th>Item</th><th>Basis</th><th class="n">Amount</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + est(r[3]) + '</td><td class="n">' + money(r[2]) + '<br><span class="muted" style="font-size:11px">' + sub(r[2]) + '</span></td></tr>'; }).join('') +
        '<tr class="total"><td colspan="2">Total</td><td class="n">' + money(c.total) + '</td></tr></tbody></table>' +
        '<p class="muted" style="font-size:12px;margin-top:8px">Not included: flights, visa, medical exam, personal spending beyond the living estimate. ' + esc(p.dormNote || '') + '</p><div class="scen two"><div><div class="k">Fees to the university</div><div class="v">' + money(c.university) + '</div><div class="s">tuition, fees, insurance, housing</div></div><div class="' + (p.clec ? 'best' : '') + '"><div class="k">With the scholarship</div><div class="v">' + (p.clec ? money(0) : 'n/a') + '</div><div class="s">' + (p.clec ? 'plus ' + money(allow) + ' a month to you' : 'not a confirmed host') + '</div></div></div></div>' +
      '<div class="d-sec"><h3>The scholarship here</h3>' + host + '</div>' +
      '<div class="d-sec"><h3>Dates</h3><table class="t"><tbody>' + intakes + '</tbody></table><p class="muted" style="font-size:12px;margin-top:8px">Dates marked “repeated from a previous cycle” are last cycle’s deadlines — confirm for 2027.</p></div>' +
      (p.note ? '<div class="d-sec"><h3>Notes</h3><p>' + esc(p.note) + '</p></div>' : '') +
      '<div class="d-sec"><h3>Where this data comes from</h3><p><span class="badge ' + confClass(p.conf) + '">' + (p.conf === 'official' ? 'Official page read' : 'Partly verified') + '</span> Checked ' + fmtDate(LG.verifiedOn) + '.</p><div class="srcs">' +
        p.sources.map(function (s) { return '<a target="_blank" rel="noopener" href="' + esc(safeUrl(s.url)) + '">' + esc(s.label) + ' ↗</a>'; }).join('') + '</div></div></div>';
  }

  /* ---------- All universities (directory) ---------- */
  var INST = null;
  function loadInstitutions(done) {
    if (INST) return done();
    function build() {
      var raw = window.SILKPATH_INSTITUTIONS, byZh = {};
      D.universities.forEach(function (u) { byZh[u.zh] = byZh[u.zh] || {}; byZh[u.zh].degree = u.id; });
      LG.programmes.forEach(function (p) { byZh[p.zh] = byZh[p.zh] || {}; byZh[p.zh].lang = p.id; });
      LG.hosts.forEach(function (h) { byZh[h.zh] = byZh[h.zh] || {}; byZh[h.zh].host = true; });
      INST = { asOf: raw.asOf, provinces: raw.provinces, cities: raw.cities, byZh: byZh, items: raw.rows.map(function (r) {
        return { code: r[0], zh: r[1], py: r[2], en: r[3], prov: r[4], city: r[5], level: r[6], flags: r[7], site: r[8], hay: (r[1] + ' ' + r[2] + ' ' + r[3]).toLowerCase(), prof: byZh[r[1]] || null };
      }) };
      done();
    }
    if (window.SILKPATH_INSTITUTIONS) { build(); return; }
    var s = document.createElement('script'); s.src = 'js/institutions.js';
    s.onload = build;
    s.onerror = function () { var el = $('#dirbody'); if (el) el.innerHTML = '<div class="empty"><h3>Could not load the list</h3><p class="muted">Check your connection and reload. Once loaded it works offline.</p></div>'; };
    document.head.appendChild(s);
  }

  function dirFilter() {
    var d = S.dir, q = d.q.trim().toLowerCase(), qs = q.replace(/\s+/g, '');
    return INST.items.filter(function (x) {
      if (d.province > -1 && x.prov !== d.province) return false;
      if (d.level === 'degree' && x.level !== 0) return false;
      if (d.level === 'vocational' && x.level !== 1) return false;
      if (d.own === 'private' && !(x.flags & 1)) return false;
      if (d.own === 'public' && (x.flags & 1)) return false;
      if (d.moe && !(x.flags & 8)) return false;
      if (d.en && !x.en) return false;
      if (d.site && !x.site) return false;
      if (d.profile && !x.prof) return false;
      if (q && x.hay.indexOf(q) < 0 && x.py.indexOf(qs) < 0) return false;
      return true;
    });
  }

  function instRow(x) {
    var tags = [];
    tags.push('<span class="badge ' + (x.level === 0 ? 'blue' : '') + '">' + (x.level === 0 ? 'Bachelor’s degrees' : 'Vocational / associate') + '</span>');
    if (x.flags & 1) tags.push('<span class="badge">Private</span>');
    if (x.flags & 2) tags.push('<span class="badge">Sino-foreign joint</span>');
    if (x.flags & 8) tags.push('<span class="badge ok">Run by the Ministry of Education</span>');
    if (x.prof && x.prof.host) tags.push('<span class="badge ok">Scholarship host</span>');
    var links = '';
    if (x.prof && x.prof.lang) links += '<button class="btn small primary" data-act="lopen" data-id="' + esc(x.prof.lang) + '">Language fees</button>';
    if (x.prof && x.prof.degree) links += '<button class="btn small" data-act="open" data-id="' + esc(x.prof.degree) + '">Degree data</button>';
    if (x.site) links += '<a class="btn small ghost" target="_blank" rel="noopener" href="' + esc(safeUrl(x.site)) + '">Website ↗</a>';
    return '<div class="inst"><div><div class="zhn" lang="zh-Hans">' + esc(x.zh) + '</div>' + (x.en ? '<div class="enn">' + esc(x.en) + '</div>' : '<div class="py">' + esc(x.py) + '</div>') +
      '<div class="where">' + esc(INST.cities[x.city].en) + ', ' + esc(INST.provinces[x.prov].en) + ' · code ' + esc(x.code) + '</div><div class="tags">' + tags.join('') + '</div></div><div class="right">' + links + '</div></div>';
  }

  function renderUniversities() {
    var el = $('#view-universities');
    if (!$('#dirbody')) {
      el.innerHTML = '<div class="strip"><h1>Every university and college in <em>China</em></h1><p>The Ministry of Education’s official list, all provinces, with English names and websites where known. Search in English, Chinese or pinyin.</p></div><div id="dirbody"><div class="loading">Loading the list of universities…</div></div>';
    }
    loadInstitutions(function () { drawDirectory(); });
  }

  function drawDirectory() {
    var d = S.dir, el = $('#dirbody'); if (!el || !INST) return;
    var counts = new Array(INST.provinces.length).fill(0);
    INST.items.forEach(function (x) { counts[x.prov]++; });
    var found = dirFilter(), shown = found.slice(0, d.shown);
    if (!$('#dirq')) {
      el.innerHTML = '<div class="note small"><b>Read this first.</b> Being on this list means the Ministry recognises the institution. It does <b>not</b> mean the institution accepts international students or offers scholarships — many do not. Ask its international office, and use the programmes marked “Language fees” or “Scholarship host” first.</div>' +
        '<div class="dir-top"><label class="sr" for="dirq">Search universities</label><input id="dirq" type="search" data-dbind="q" placeholder="Search: Harbin, 哈尔滨, or haerbin…" value="' + esc(d.q) + '" autocomplete="off">' +
        '<select data-dbind="level" aria-label="Level"><option value="all">All levels</option><option value="degree">Bachelor’s degrees</option><option value="vocational">Vocational / associate</option></select>' +
        '<select data-dbind="own" aria-label="Ownership"><option value="all">Public and private</option><option value="public">Public only</option><option value="private">Private only</option></select></div>' +
        '<div class="chk-row"><label class="check"><input type="checkbox" data-dbind="moe"> <span>Run by the Ministry of Education</span></label><label class="check"><input type="checkbox" data-dbind="en"> <span>Has an English name</span></label><label class="check"><input type="checkbox" data-dbind="site"> <span>Has a website</span></label><label class="check"><input type="checkbox" data-dbind="profile"> <span>Has fees in Silkpath</span></label></div>' +
        '<div class="chips" id="dirchips" role="group" aria-label="Province"></div><div class="dir-meta" id="dirmeta"></div><div id="dirlist"></div>';
      var lvl = $('[data-dbind="level"]'); lvl.value = d.level; var own = $('[data-dbind="own"]'); own.value = d.own;
      ['moe', 'en', 'site', 'profile'].forEach(function (k) { $('[data-dbind="' + k + '"]').checked = !!d[k]; });
    }
    $('#dirchips').innerHTML = '<button class="chip" data-act="dprov" data-i="-1" aria-pressed="' + (d.province === -1) + '">All provinces <i>' + INST.items.length.toLocaleString('en-US') + '</i></button>' +
      INST.provinces.map(function (p, i) { return '<button class="chip" data-act="dprov" data-i="' + i + '" aria-pressed="' + (d.province === i) + '">' + esc(p.en) + ' <i>' + counts[i] + '</i></button>'; }).join('');
    $('#dirmeta').innerHTML = '<span><b>' + found.length.toLocaleString('en-US') + '</b> of ' + INST.items.length.toLocaleString('en-US') + ' institutions' + (d.province > -1 ? ' in ' + esc(INST.provinces[d.province].en) : '') + ' · list as of ' + fmtDate(INST.asOf) + '</span><span><button class="btn small ghost" data-act="dcsv">Download this list (CSV)</button></span>';
    $('#dirlist').innerHTML = (found.length ? shown.map(instRow).join('') : '<div class="empty"><h3>Nothing matches</h3><p class="muted">Clear a filter or try a shorter search. Pinyin works without spaces: “beijingdaxue”.</p></div>') +
      (found.length > shown.length ? '<p style="text-align:center;margin:16px 0"><button class="btn" data-act="dmore">Show ' + Math.min(60, found.length - shown.length) + ' more</button></p>' : '');
    var live = $('#sr-status'); if (live) live.textContent = found.length + ' institutions match.';
  }

  function csvCell(v) { v = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }
  function downloadDirectoryCsv() {
    var rows = dirFilter();
    var head = ['Chinese name', 'English name', 'Pinyin', 'Province', 'City', 'Level', 'Ownership', 'Website', 'Ministry code'];
    var lines = [head.map(csvCell).join(',')].concat(rows.map(function (x) {
      return [x.zh, x.en, x.py, INST.provinces[x.prov].en, INST.cities[x.city].en, x.level === 0 ? 'Bachelor’s degrees' : 'Vocational / associate', (x.flags & 1) ? 'Private' : 'Public', x.site, x.code].map(csvCell).join(',');
    }));
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'china-universities.csv'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast(rows.length.toLocaleString('en-US') + ' institutions downloaded');
  }


  /* =====================================================================
   * Canada
   * ===================================================================== */
  var CA = window.SILKPATH_CANADA;
  function cad(n) { return 'CA$' + fmtNum(n); }
  function cadSub(n) { var usd = n / CA.cadPerUsd; return '≈ $' + fmtNum(usd) + ' · Br ' + fmtNum(usd * R.etbPerUsd); }
  function csegBtn(key, val, label) { return '<button type="button" data-cset="' + key + '" data-val="' + val + '" aria-pressed="' + (String(S.canada[key]) === val) + '">' + label + '</button>'; }

  function scholarshipCard(r) {
    var s = r.s, c = S.canada;
    var value = s.fullRide ? 'Full ride' : s.totalMax ? 'Up to ' + cad(s.totalMax) : s.annualMax ? 'Up to ' + cad(s.annualMax) + ' / yr' : 'Partial';
    var elig = !r.eligible ? '<span class="badge bad">Not for your situation</span>' : (r.blocked || r.closed) ? '<span class="badge warn">Closed for this cycle unless you are already nominated</span>' : '<span class="badge ok">You can apply</span>';
    var when = r.blocked ? '<span class="badge bad">Already passed: ' + esc(r.missed[0].label) + ' (' + fmtDate(r.missed[0].date) + ')</span> <span class="badge">Later steps: ' + esc(r.next.label) + ', ' + fmtDate(r.next.date) + '</span>'
      : r.next ? '<span class="badge warn">' + esc(r.next.label) + ': ' + fmtDate(r.next.date) + ' · ' + daysText(r.next.days) + '</span>' : (r.closed ? '<span class="badge">This cycle has closed</span>' : '');
    return '<article class="lrow ' + (r.eligible ? '' : 'dim') + '"><div class="rank"></div><div><h3>' + esc(s.name) + '</h3>' +
      '<div class="meta">' + esc(s.uni) + ' · ' + esc(s.basis) + ' · <span class="badge ' + confClass(s.conf) + '" style="display:inline-block">' + (s.conf === 'official' ? 'Official page' : 'Partly verified') + '</span></div>' +
      '<div class="figs"><div><span class="k">Value</span><span class="v ' + (s.fullRide ? 'pos' : '') + '">' + value + '</span><span class="s">' + esc(s.valueNote) + '</span></div>' +
      (s.count ? '<div><span class="k">Awards a year</span><span class="v">' + (s.count >= 5 ? '~' : '') + s.count + '</span><span class="s">worldwide, for all countries</span></div>' : '') + '</div>' +
      '<p style="margin:6px 0;font-size:13.5px"><b>Who:</b> ' + esc(s.rule) + '</p>' +
      (s.nomination ? '<p style="margin:4px 0;font-size:13.5px"><b>Nomination:</b> ' + esc(s.nomination) + '</p>' : '') +
      (s.note ? '<p class="muted" style="margin:4px 0;font-size:12.5px">' + esc(s.note) + '</p>' : '') +
      '<div class="meta">' + elig + ' ' + (s.auto === true ? '<span class="badge blue">Automatic</span> ' : '') + when + '</div></div><div></div>' +
      '<div class="acts"><a class="btn small primary" target="_blank" rel="noopener" href="' + esc(safeUrl(s.sources[0].url)) + '">Official page ↗</a></div></article>';
  }

  function renderCanada() {
    var el = $('#view-canada'), c = S.canada, rc = CA.reality;
    if (!$('#carows')) {
      var sit = CA.situations.map(function (x) { return '<option value="' + x.id + '">' + esc(x.label) + '</option>'; }).join('');
      el.innerHTML = '<div class="strip"><h1>Canada — the <em>honest</em> picture</h1><p>Canada has generous scholarships, but they go to very few students. It is the hardest and most expensive route in Silkpath. Here is exactly what you must show, what the big awards need, and every university member of Universities Canada.</p></div>' +
        '<div class="factgrid">' +
          '<div><b>' + cad(rc.fundsLiving) + '</b><span>living funds you must show, <em>on top of</em> a year of tuition and your flights (from 1 Sep 2026)</span></div>' +
          '<div><b>' + rc.refusalNew2025 + '%</b><span>of new study-permit applications were refused in 2025 (' + rc.refusalNew2024 + '% in 2024). No Ethiopia figure is published.</span></div>' +
          '<div><b>' + (rc.capNewArrivals2026 / 1000) + ',000</b><span>new international students allowed in 2026, down from 305,900 planned for 2025</span></div>' +
          '<div><b>' + rc.workHoursOffCampus + ' h</b><span>a week is the most you may work off campus during term</span></div></div>' +
        '<div class="note small"><ul style="margin:0;padding-left:18px">' + rc.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul><p class="muted" style="margin:8px 0 0;font-size:12px">Sources: ' + rc.sources.map(function (s2) { return '<a target="_blank" rel="noopener" href="' + esc(safeUrl(s2.url)) + '">' + esc(s2.label) + '</a>'; }).join(' · ') + '</p></div>' +
        '<div class="cols2"><div class="situation"><h2>About you</h2><div class="sb">' +
          '<div class="fld"><label for="c-sit">Where are you now?</label><select id="c-sit" data-cbind="situation">' + sit + '</select></div>' +
          '<div class="fld"><span class="lab">What would you study?</span><div class="seg" role="group" aria-label="Field">' + csegBtn('field', 'arts', 'Arts / humanities') + csegBtn('field', 'science', 'Science') + csegBtn('field', 'eng', 'Engineering') + '</div><p class="hint">You said you are flexible. Arts and Science cost least; Engineering is dearest everywhere.</p></div>' +
          '<div class="fld"><label for="c-sort">Sort universities by</label><select id="c-sort" data-cbind="sort"><option value="cash">Least cash to show</option><option value="award">Biggest award</option><option value="coverage">Award covers most of tuition</option><option value="credential">Lists the Ethiopian exam</option></select></div>' +
        '</div></div><div id="cadvice"></div></div>' +
        '<h2 class="sec-title" style="margin-top:26px">The big undergraduate awards, best first</h2><p class="sec-sub">Merit and need awards for international students entering their first degree. None is open to everyone: each needs a top record, and the two full rides need a school nomination or financial-need assessment.</p><div id="carows"></div>' +
        '<h2 class="sec-title" style="margin-top:30px">What each university needs you to show</h2><p class="sec-sub">“Cash to show” = first-year tuition + required fees + CA$' + fmtNum(rc.fundsLiving) + ' living funds, before flights. “If you win” assumes the university’s largest award you qualify for.</p><div id="catable"></div>' +
        '<h2 class="sec-title" style="margin-top:30px">Mastercard Foundation Scholars in Canada</h2><p class="sec-sub">' + esc(CA.mastercardNote) + '</p><div class="hostgrid">' + CA.mastercard.map(function (m) { return '<div class="host"><b>' + esc(m.uni) + '</b><span class="badge ' + (m.status === 'Open' ? 'ok' : m.status === 'Closed' ? 'bad' : 'warn') + '" style="display:inline-block">' + esc(m.level) + ' · ' + esc(m.status) + '</span><br>' + esc(m.note) + '<br><a target="_blank" rel="noopener" href="' + esc(safeUrl(m.url)) + '">Foundation page ↗</a></div>'; }).join('') + '</div>' +
        '<h2 class="sec-title" style="margin-top:30px">Six steps to a study permit</h2><ol class="steps">' + CA.steps.map(function (st) { return '<li><b>' + esc(st.t) + '</b><span>' + esc(st.d) + '</span></li>'; }).join('') + '</ol>' +
        '<h2 class="sec-title" style="margin-top:30px">All ' + CA.members.rows.length + ' Universities Canada members</h2><p class="sec-sub">Every member university by province. Only <b>designated learning institutions</b> can enrol international students — check the school on <a target="_blank" rel="noopener" href="' + esc(safeUrl(rc.sources[4].url)) + '">IRCC’s list</a> before applying. Colleges and polytechnics are not on this list.</p>' +
        '<div class="dir-top"><label class="sr" for="cq">Search Canadian universities</label><input id="cq" type="search" data-cbind="q" placeholder="Search a university…" autocomplete="off"></div><div class="chips" id="cchips" role="group" aria-label="Province"></div><div id="cdir"></div>' +
        '<div class="note blue" style="margin-top:22px;max-width:78ch"><b>Compare with China.</b> The China language scholarship asks for HSK 3, pays you ' + money(LG.scholarship.allowanceMonthly) + ' a month and needs no proof of funds. <a href="#start">See your China route</a>.</div>';
      $('#c-sit').value = c.situation; $('#c-sort').value = c.sort;
    }
    var rows = E.canadaRows(CA, { field: c.field, situation: c.situation, sort: c.sort }, TODAY);
    var sch = E.rankScholarships(CA, c.situation, TODAY);
    var hasDegree = c.situation === 'bachelor' || c.situation === 'master';
    $('#cadvice').innerHTML = hasDegree
      ? '<div class="note small" style="margin-top:0"><b>You already have a degree.</b> Undergraduate entrance awards are for first degrees, so none apply. Options: a master’s programme (undergraduates need a provincial attestation letter, but master’s and PhD students at public institutions have not since 1 January 2026), the Mastercard Foundation master’s places below, or a second bachelor’s that you pay for. Funding for graduate study is usually decided by each department — ask before applying.</div>'
      : (c.situation === 'earlierGrad' ? '<div class="note small" style="margin-top:0"><b>You finished high school before 2026.</b> You cannot be nominated for the Pearson scholarship, which only takes students still in their last year (or graduated since June 2026). The other awards below can still apply.</div>' : '<div class="note small" style="margin-top:0"><b>Your best-case path:</b> ask your school’s head now whether it can nominate you for the Pearson scholarship (September 2028 entry), and apply to universities with automatic awards such as Queen’s.</div>');
    $('#carows').innerHTML = sch.map(scholarshipCard).join('');
    var best = rows.filter(function (r) { return r.cash != null; });
    var minCash = best.length ? Math.min.apply(null, best.map(function (r) { return r.cash; })) : null;
    $('#catable').innerHTML = '<div style="overflow-x:auto"><table class="t cmpca"><thead><tr><th>University</th><th class="n">Tuition / year</th><th class="n">Cash to show</th><th>Largest award you qualify for</th><th class="n">Cash if you win it</th><th>Ethiopian exam</th></tr></thead><tbody>' + rows.map(function (r) {
      var u = r.u, award = r.full ? '<b style="color:var(--ok)">Full ride</b>' : r.annualBest ? 'CA$' + fmtNum(r.annualBest) + ' / yr' : '<span class="muted">none found</span>';
      var eth = r.ethiopia === 'listed' ? '<span class="badge ok" style="display:inline-block">Listed</span>' : '<span class="badge" style="display:inline-block">Ask</span>';
      return '<tr' + (r.cash != null && r.cash === minCash ? ' class="lowest"' : '') + '><td><b>' + esc(u.name) + '</b><br><span class="muted" style="font-size:12px">' + esc(u.city) + ', ' + esc(u.province) + '</span><br><span class="muted" style="font-size:11.5px">' + esc(u.tuitionNote) + '</span></td>' +
        '<td class="n">' + (r.tuition != null ? cad(r.tuition) : '<span class="muted">not found</span>') + '</td>' +
        '<td class="n">' + (r.cash != null ? '<b>' + cad(r.cash) + '</b><br><span class="muted" style="font-size:11px">' + cadSub(r.cash) + '</span>' : '—') + '</td>' +
        '<td>' + award + (r.coverage != null && !r.full && r.annualBest ? '<br><span class="muted" style="font-size:11.5px">covers ' + Math.round(r.coverage * 100) + '% of tuition</span>' : '') + '</td>' +
        '<td class="n">' + (r.cashAfterBest != null ? cad(r.cashAfterBest) + '<br><span class="muted" style="font-size:11px">' + cadSub(r.cashAfterBest) + '</span>' : '—') + '</td>' +
        '<td>' + eth + (u.ethiopia && u.ethiopia.url ? '<br><a target="_blank" rel="noopener" href="' + esc(safeUrl(u.ethiopia.url)) + '" style="font-size:11.5px">their page ↗</a>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div><p class="muted" style="font-size:12.5px">Fees are in Canadian dollars; ' + fmtDate(CA.verifiedOn) + '. “Ask” means the school’s page for Ethiopian applicants was not found — it does not mean they refuse Ethiopian students. Waterloo, McMaster and Ottawa did not publish an international fee we could read. Rate used: $1 = CA$' + CA.cadPerUsd + '.</p>';
    drawCanadaDir();
  }

  function drawCanadaDir() {
    var c = S.canada, m = CA.members, q = c.q.trim().toLowerCase();
    var counts = new Array(m.provinces.length).fill(0);
    m.rows.forEach(function (r) { counts[r[1]]++; });
    $('#cchips').innerHTML = '<button class="chip" data-act="cprov" data-i="-1" aria-pressed="' + (c.prov === -1) + '">All <i>' + m.rows.length + '</i></button>' + m.provinces.map(function (p, i) { return '<button class="chip" data-act="cprov" data-i="' + i + '" aria-pressed="' + (c.prov === i) + '">' + esc(p) + ' <i>' + counts[i] + '</i></button>'; }).join('');
    var detail = {}; CA.universities.forEach(function (u) { detail[u.name.replace(/ \(.*\)$/, '').replace('’', "'").toLowerCase()] = u; });
    var list = m.rows.filter(function (r) { return (c.prov === -1 || r[1] === c.prov) && (!q || r[0].toLowerCase().indexOf(q) > -1); });
    $('#cdir').innerHTML = '<div class="dir-meta"><span><b>' + list.length + '</b> of ' + m.rows.length + ' universities' + (c.prov > -1 ? ' in ' + esc(m.provinces[c.prov]) : '') + '</span></div>' +
      list.map(function (r) {
        var u = detail[r[0].replace('’', "'").toLowerCase()] || null;
        return '<div class="inst"><div><div class="zhn" style="font-size:16px">' + esc(r[0]) + '</div><div class="where">' + esc(m.provinces[r[1]]) + '</div>' + (u ? '<div class="tags"><span class="badge ok">Fees and awards above</span></div>' : '') + '</div><div class="right">' + (r[2] ? '<a class="btn small ghost" target="_blank" rel="noopener" href="' + esc(safeUrl(r[2])) + '">Website ↗</a>' : '<span class="muted" style="font-size:12px">website not listed</span>') + '</div></div>';
      }).join('') + (list.length ? '' : '<div class="empty"><h3>Nothing matches</h3></div>');
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
  function syncLangForms() {
    var l = S.lang;
    ['duration', 'term'].forEach(function (k) { $$('[data-lset="' + k + '"]').forEach(function (b2) { b2.setAttribute('aria-pressed', String(b2.dataset.val === String(l[k]))); }); });
    $$('[data-lbind="age"]').forEach(function (i) { if (document.activeElement !== i) i.value = l.age; });
    $$('[data-lbind="hskBand"]').forEach(function (i) { i.value = String(l.hskBand); });
    ['hskk', 'recommendation', 'budgetOn', 'hideClosed'].forEach(function (k) { $$('[data-lbind="' + k + '"]').forEach(function (i) { i.checked = !!l[k]; }); });
    $$('[data-lbind="budgetUsd"]').forEach(function (i) { i.disabled = !l.budgetOn; });
  }
  function onLangChange() {
    save(); syncLangForms();
    var v = currentView();
    if (v === 'start') refreshRoutes(); else if (v === 'language') renderLanguage();
    if (UI.drawer && UI.drawerKind === 'lang') renderDrawer();
  }
  function refresh() {
    renderTabs();
    var v = currentView();
    if (v === 'start') renderStart(); else if (v === 'language') renderLanguage(); else if (v === 'universities') { if (INST) drawDirectory(); } else if (v === 'canada') renderCanada();
    else if (v === 'degrees') renderResults(); else if (v === 'compare') renderCompare(); else if (v === 'plan') renderPlan();
    if (UI.drawer) renderDrawer();
  }

  document.addEventListener('click', function (e) {
    var set = e.target.closest('[data-set]');
    if (set) {
      S.profile[set.dataset.set] = set.dataset.val; save();
      $$('[data-set="' + set.dataset.set + '"]', $('#brief')).forEach(function (b2) { b2.setAttribute('aria-pressed', String(b2.dataset.val === set.dataset.val)); });
      renderResults(); return;
    }
    var cs = e.target.closest('[data-cset]');
    if (cs) { S.canada[cs.dataset.cset] = cs.dataset.val; save(); renderCanada(); $$('[data-cset="' + cs.dataset.cset + '"]').forEach(function (b2) { b2.setAttribute('aria-pressed', String(b2.dataset.val === cs.dataset.val)); }); return; }
    var ls = e.target.closest('[data-lset]');
    if (ls) { S.lang[ls.dataset.lset] = ls.dataset.val; onLangChange(); return; }
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.dataset.act, id = a.dataset.id;
    if (act === 'reset') { S.profile = defaultState().profile; save(); renderDiscover(); renderResults(); toast('Brief reset'); }
    else if (act === 'open') openDrawer(id, a, 'degree');
    else if (act === 'lopen') openDrawer(id, a, 'lang');
    else if (act === 'close') closeDrawer();
    else if (act === 'prog') { UI.drawerProg = +a.dataset.i; renderDrawer(); }
    else if (act === 'plan') { var r1 = toggle(S.shortlist, id); save(); toast(r1 ? 'Added to my plan' : 'Removed from my plan'); refresh(); }
    else if (act === 'lplan') { var r3 = toggle(S.langShortlist, id); save(); toast(r3 ? 'Added to my plan' : 'Removed from my plan'); refresh(); }
    else if (act === 'cmp') { var r2 = toggle(S.compare, id, 4); if (r2 === null) toast('Compare holds four. Remove one first.'); else { toast(r2 ? 'Added to compare' : 'Removed from compare'); } save(); refresh(); }
    else if (act === 'finduni') { S.dir.q = a.dataset.q || ''; S.dir.province = -1; S.dir.shown = 60; save(); closeDrawer(); if (currentView() === 'universities') { var qi = $('#dirq'); if (qi) qi.value = S.dir.q; drawDirectory(); } else location.hash = '#universities'; }
    else if (act === 'dprov') { S.dir.province = +a.dataset.i; S.dir.shown = 60; save(); drawDirectory(); }
    else if (act === 'cprov') { S.canada.prov = +a.dataset.i; save(); drawCanadaDir(); }
    else if (act === 'dmore') { S.dir.shown += 60; drawDirectory(); }
    else if (act === 'dcsv') downloadDirectoryCsv();
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
    if (t.dataset.lbind === 'age') { S.lang.age = t.value; onLangChange(); return; }
    if (t.dataset.lbind === 'budgetUsd') { S.lang.budgetUsd = +t.value; lbudgetHint(); onLangChange(); return; }
    if (t.dataset.cbind === 'q') { S.canada.q = t.value.slice(0, 60); save(); drawCanadaDir(); return; }
    if (t.dataset.dbind === 'q') { S.dir.q = t.value.slice(0, 80); S.dir.shown = 60; save(); drawDirectory(); return; }
    if (t.dataset.track === 'notes') { S.tracker[t.dataset.id] = Object.assign({ status: 'researching' }, S.tracker[t.dataset.id], { notes: t.value }); save(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'sort') { S.sort = t.value; save(); renderResults(); }
    else if (t.id === 'lsort') { S.lang.sort = t.value; onLangChange(); }
    else if (t.id === 'currency') { S.currency = t.value; save(); refresh(); budgetHint(); lbudgetHint(); }
    else if (t.dataset.bind === 'hsk') { S.profile.hsk = +t.value; save(); renderResults(); }
    else if (t.dataset.bind && t.type === 'checkbox') {
      S.profile[t.dataset.bind] = t.checked; save();
      if (t.dataset.bind === 'budgetOn') { var rg = $('[data-bind="budgetUsd"]'); rg.disabled = !t.checked; budgetHint(); }
      renderResults();
    }
    else if (t.dataset.cbind) { S.canada[t.dataset.cbind] = t.value; save(); renderCanada(); }
    else if (t.dataset.lbind === 'hskBand') { S.lang.hskBand = +t.value; onLangChange(); }
    else if (t.dataset.lbind && t.type === 'checkbox') { S.lang[t.dataset.lbind] = t.checked; if (t.dataset.lbind === 'budgetOn') lbudgetHint(); onLangChange(); }
    else if (t.dataset.dbind) { S.dir[t.dataset.dbind] = t.type === 'checkbox' ? t.checked : t.value; S.dir.shown = 60; save(); drawDirectory(); }
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
  showView();
})();
