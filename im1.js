/* im1.js — Integrated Math 1 (CPM Core Connections Integrated I) problem generators for Priyaan's Hub.
   Works in the browser (window.IM1) and in Node (require('./im1.js')). No dependencies, no modules.
   API: IM1.TOPICS, IM1.generate(opts), IM1.checkAnswer(problem, typed), IM1.renderWorksheet(ws, opts). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IM1 = factory();
})(this, function () {
  'use strict';

  var MINUS = '−';

  /* ---------------------------------------------------------------- random (mulberry32, same as PH.rng) */
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function rint(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function rnz(r, lo, hi) { var v; do { v = rint(r, lo, hi); } while (v === 0); return v; }
  function rex(r, lo, hi, exclude) { var v, n = 0; do { v = rint(r, lo, hi); } while (exclude.indexOf(v) >= 0 && ++n < 1000); return v; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuffle(r, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function chance(r, p) { return r() < p; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }

  /* ---------------------------------------------------------------- formatting */
  function N(v) { // number → text with a real minus sign and no float noise
    if (typeof v !== 'number' || !isFinite(v)) return String(v);
    var s = Math.abs(v) < 1e-12 ? '0' : String(+v.toFixed(6));
    return s.replace('-', MINUS);
  }
  function commas(v) { var s = String(Math.abs(Math.round(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (v < 0 ? MINUS : '') + s; }
  function money(v) { var f = Math.abs(v).toFixed(2).split('.'); f[0] = f[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (v < 0 ? MINUS : '') + '$' + f.join('.'); }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return N(n); return (n < 0 ? MINUS : '') + Math.abs(n) + '/' + d; }
  function sup(e) { return '<sup>' + (typeof e === 'number' ? N(e) : e) + '</sup>'; }
  function pow(base, e) { return e === 1 ? base : base + sup(e); }
  function paren(v) { return v < 0 ? '(' + N(v) + ')' : N(v); }
  function coefTerm(c, v) { if (!v) return N(c); if (c === 1) return v; if (c === -1) return MINUS + v; return N(c) + v; }
  function joinTerms(terms) {
    var out = '';
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i]; if (!t.c) continue;
      if (!out) out = coefTerm(t.c, t.v); else out += (t.c < 0 ? ' ' + MINUS + ' ' : ' + ') + coefTerm(Math.abs(t.c), t.v);
    }
    return out || '0';
  }
  function lin(a, b, v) { return joinTerms([{ c: a, v: v || 'x' }, { c: b, v: '' }]); }
  function poly(coeffs, v) { v = v || 'x'; var n = coeffs.length - 1; return joinTerms(coeffs.map(function (c, i) { var e = n - i; return { c: c, v: e === 0 ? '' : pow(v, e) }; })); }
  function pt(x, y) { return '(' + N(x) + ', ' + N(y) + ')'; }
  function plain(html) { return String(html).replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
  function P(q, a, accept, work) { return { question: q, answer: a, accept: accept || [], work: work || '' }; }
  var ARROW = ' → ';

  /* ---------------------------------------------------------------- topics */
  var TOPICS = [
    { id: 'linear', name: 'Solving linear equations', unit: 'Ch 3', chapter: 3, unitName: 'Simplifying & Solving', description: 'One- and two-step equations, variables on both sides, distributing; fractions and nested parentheses at level 3.' },
    { id: 'slope', name: 'Slope & linear equations', unit: 'Ch 2', chapter: 2, unitName: 'Linear Functions', description: 'Slope between two points, y = mx + b from points or slope, reading slope and intercept, finding y for an x.' },
    { id: 'systems', name: 'Systems of equations', unit: 'Ch 6', chapter: 6, unitName: 'Systems of Equations', description: 'Two linear equations with an integer solution: Equal Values, substitution, then elimination with multiplying.' },
    { id: 'exponents', name: 'Exponent rules', unit: 'Ch 8', chapter: 8, unitName: 'Exponential Functions', description: 'Product, quotient and power rules, zero and negative exponents, e.g. simplify (3x²y)³.' },
    { id: 'sequences', name: 'Arithmetic & geometric sequences', unit: 'Ch 5', chapter: 5, unitName: 'Sequences', description: 'Next terms, explicit formula t(n), a far term such as t(20), and telling arithmetic from geometric from neither.' },
    { id: 'exponential', name: 'Exponential growth & decay', unit: 'Ch 8', chapter: 8, unitName: 'Exponential Functions', description: 'y = a·bˣ word problems: multipliers from percents, savings CDs (APY), population, depreciation, halving.' },
    { id: 'inequalities', name: 'Solving inequalities', unit: 'Ch 9', chapter: 9, unitName: 'Inequalities', description: 'One- and two-step inequalities, flipping the sign when dividing by a negative; compound "and" inequalities at level 3.' },
    { id: 'expressions', name: 'Simplifying & factoring', unit: 'Ch 3 / Ch 8', chapter: 3, unitName: 'Simplifying & Solving', description: 'Distribute, combine like terms, multiply binomials with a generic rectangle, factor out the GCF; trinomials at level 3.' },
    { id: 'functions', name: 'Function notation', unit: 'Ch 1', chapter: 1, unitName: 'Functions', description: 'Evaluate f(x), find x when f(x) = k, domain and range of a set of points, decide whether a table is a function.' },
    { id: 'coordinate', name: 'Coordinate geometry', unit: 'Ch 7', chapter: 7, unitName: 'Congruence & Coordinate Geometry', description: 'Distance (Pythagorean triples, exact radicals at level 3), midpoint, reflecting, translating and rotating points.' },
    { id: 'data', name: 'Two-variable data', unit: 'Ch 4', chapter: 4, unitName: 'Modeling Two-Variable Data', description: 'Predict with a line of best fit, interpret slope and intercept in context, describe an association from r, mean and median.' }
  ];
  var TOPIC_BY_ID = {};
  TOPICS.forEach(function (t) { TOPIC_BY_ID[t.id] = t; });

  /* ================================================================ 1. linear equations */
  function genLinear(d, r) {
    var kinds = d === 1 ? ['step1a', 'step1b', 'step1c', 'step2', 'step2', 'step2r']
      : d === 2 ? ['both', 'both', 'dist', 'distplus', 'distin', 'combine', 'distminus']
      : ['fracx', 'fracall', 'fraccoef', 'decimal', 'nested', 'twodist'];
    var kind = pick(r, kinds), x = rnz(r, -9, 9), a, b, c, dd, e, k, q, work;
    switch (kind) {
      case 'step1a': b = rnz(r, -12, 12); c = x + b;
        q = lin(1, b) + ' = ' + N(c); work = 'x = ' + N(c) + (b > 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) + ' = ' + N(x); break;
      case 'step1b': a = rex(r, -9, 9, [0, 1, -1]); c = a * x;
        q = coefTerm(a, 'x') + ' = ' + N(c); work = 'x = ' + N(c) + ' ÷ ' + paren(a) + ' = ' + N(x); break;
      case 'step1c': a = rint(r, 2, 6); x = a * rnz(r, -9, 9);
        q = 'x/' + a + ' = ' + N(x / a); work = 'x = ' + a + ' · ' + paren(x / a) + ' = ' + N(x); break;
      case 'step1c2': break;
      case 'step2': a = rint(r, 2, 9); b = rnz(r, -15, 15); c = a * x + b;
        q = lin(a, b) + ' = ' + N(c); work = a + 'x = ' + N(c - b) + ', so x = ' + N(x); break;
      case 'step2r': a = rint(r, 2, 9); b = rnz(r, -15, 15); c = a * x + b;
        q = joinTerms([{ c: b, v: '' }, { c: a, v: 'x' }]) + ' = ' + N(c); work = a + 'x = ' + N(c - b) + ', so x = ' + N(x); break;
      case 'both': a = rint(r, 2, 9); c = rex(r, -9, 9, [0, a]); b = rnz(r, -15, 15); dd = (a - c) * x + b;
        q = lin(a, b) + ' = ' + lin(c, dd); work = coefTerm(a - c, 'x') + ' = ' + N(dd - b) + ', so x = ' + N(x); break;
      case 'dist': a = rex(r, -9, 9, [0, 1, -1]); do { b = rnz(r, -9, 9); } while (x + b === 0); c = a * (x + b);
        q = coefTerm(a, '(' + lin(1, b) + ')') + ' = ' + N(c); work = lin(1, b) + ' = ' + N(x + b) + ', so x = ' + N(x); break;
      case 'distplus': a = rint(r, 2, 9) * (chance(r, 0.3) ? -1 : 1); do { b = rnz(r, -9, 9); } while (x + b === 0); c = rnz(r, -12, 12); dd = a * (x + b) + c;
        q = joinTerms([{ c: a, v: '(' + lin(1, b) + ')' }, { c: c, v: '' }]) + ' = ' + N(dd);
        work = coefTerm(a, '(' + lin(1, b) + ')') + ' = ' + N(dd - c) + ARROW + lin(1, b) + ' = ' + N(x + b) + ARROW + 'x = ' + N(x); break;
      case 'distin': a = rint(r, 2, 5); b = rint(r, 2, 5); c = rnz(r, -9, 9); e = a * (b * x + c);
        q = a + '(' + lin(b, c) + ') = ' + N(e); work = lin(b, c) + ' = ' + N(b * x + c) + ARROW + b + 'x = ' + N(b * x) + ARROW + 'x = ' + N(x); break;
      case 'combine': a = rnz(r, -9, 9); do { c = rnz(r, -9, 9); } while (a + c === 0); b = rnz(r, -12, 12); dd = (a + c) * x + b;
        q = joinTerms([{ c: a, v: 'x' }, { c: b, v: '' }, { c: c, v: 'x' }]) + ' = ' + N(dd);
        work = lin(a + c, b) + ' = ' + N(dd) + ARROW + coefTerm(a + c, 'x') + ' = ' + N(dd - b) + ARROW + 'x = ' + N(x); break;
      case 'distminus': a = rint(r, 2, 9); b = rex(r, 2, 6, [a]); c = rnz(r, -9, 9); dd = (a - b) * x - b * c;
        q = joinTerms([{ c: a, v: 'x' }, { c: -b, v: '(' + lin(1, c) + ')' }]) + ' = ' + N(dd);
        work = lin(a - b, -b * c) + ' = ' + N(dd) + ARROW + coefTerm(a - b, 'x') + ' = ' + N(dd + b * c) + ARROW + 'x = ' + N(x); break;
      case 'fracx': a = rint(r, 2, 6); x = a * rnz(r, -9, 9); b = rnz(r, -9, 9); c = x / a + b;
        q = joinTerms([{ c: 1, v: 'x/' + a }, { c: b, v: '' }]) + ' = ' + N(c); work = 'x/' + a + ' = ' + N(x / a) + ARROW + 'x = ' + N(x); break;
      case 'fracall': c = rint(r, 2, 6); a = rint(r, 2, 5); do { dd = rnz(r, -9, 9); x = rnz(r, -9, 9); b = c * dd - a * x; } while (b === 0);
        q = '(' + lin(a, b) + ')/' + c + ' = ' + N(dd); work = lin(a, b) + ' = ' + N(c * dd) + ARROW + a + 'x = ' + N(a * x) + ARROW + 'x = ' + N(x); break;
      case 'fraccoef': b = rint(r, 2, 5); do { a = rint(r, 2, 7); } while (a % b === 0); k = rnz(r, -6, 6); x = b * k; c = rnz(r, -12, 12); dd = a * k + c;
        q = joinTerms([{ c: 1, v: a + 'x/' + b }, { c: c, v: '' }]) + ' = ' + N(dd);
        work = a + 'x/' + b + ' = ' + N(a * k) + ARROW + a + 'x = ' + N(a * x) + ARROW + 'x = ' + N(x); break;
      case 'decimal': a = pick(r, [0.5, 1.5, 2.5, 0.2, 0.4, 0.25, 0.75, 1.2]); b = rnz(r, -19, 19) / 2; c = +(a * x + b).toFixed(4);
        q = joinTerms([{ c: a, v: 'x' }, { c: b, v: '' }]) + ' = ' + N(c); work = N(a) + 'x = ' + N(+(c - b).toFixed(4)) + ARROW + 'x = ' + N(x); break;
      case 'nested': a = rint(r, 2, 4); b = rint(r, 2, 4); c = rnz(r, -6, 6); dd = rnz(r, -9, 9); e = a * (b * (x + c) - dd);
        q = a + '(' + joinTerms([{ c: b, v: '(' + lin(1, c) + ')' }, { c: -dd, v: '' }]) + ') = ' + N(e);
        work = joinTerms([{ c: b, v: '(' + lin(1, c) + ')' }, { c: -dd, v: '' }]) + ' = ' + N(e / a) + ARROW + b + '(' + lin(1, c) + ') = ' + N(b * (x + c)) + ARROW + lin(1, c) + ' = ' + N(x + c) + ARROW + 'x = ' + N(x); break;
      default: /* twodist */ a = rint(r, 2, 6); c = rex(r, -6, 6, [0, -a]); b = rnz(r, -9, 9); dd = rnz(r, -9, 9); e = a * (x + b) + c * (x + dd);
        q = joinTerms([{ c: a, v: '(' + lin(1, b) + ')' }, { c: c, v: '(' + lin(1, dd) + ')' }]) + ' = ' + N(e);
        work = lin(a + c, a * b + c * dd) + ' = ' + N(e) + ARROW + coefTerm(a + c, 'x') + ' = ' + N(e - a * b - c * dd) + ARROW + 'x = ' + N(x);
    }
    return P('Solve for x: ' + q, 'x = ' + N(x), [N(x)], work);
  }

  /* ================================================================ 2. slope & linear equations */
  function mxb(p, q, b) { // right-hand side of y = (p/q)x + b
    if (q === 1) return lin(p, b);
    var m = (p < 0 ? MINUS + '(' : '(') + Math.abs(p) + '/' + q + ')x';
    return b ? m + (b < 0 ? ' ' + MINUS + ' ' : ' + ') + Math.abs(b) : m;
  }
  function mxbAccepts(p, q, b) {
    var eq = 'y = ' + mxb(p, q, b), out = [plain(eq)];
    if (q !== 1) {
      var tail = b ? (b < 0 ? ' - ' : ' + ') + Math.abs(b) : '';
      out.push('y = ' + (p < 0 ? '-' : '') + Math.abs(p) + '/' + q + 'x' + tail);
      out.push('y = ' + (p < 0 ? '-' : '') + Math.abs(p) + 'x/' + q + tail);
    }
    return out;
  }
  function genSlope(d, r) {
    var kinds = d === 1 ? ['between', 'between', 'twopts', 'fromeq', 'fromeq', 'findy']
      : d === 2 ? ['between', 'twopts', 'slopept', 'fromeq', 'findy', 'findx']
      : ['between', 'twopts', 'slopept', 'standard', 'standard', 'findy', 'findx'];
    var kind = pick(r, kinds), p, q, b, k1, k2, x1, x2, y1, y2, m;
    if (d === 1) { q = 1; p = rnz(r, -5, 5); }
    else { q = pick(r, [1, 2, 2, 3, 3, 4, 5]); do { p = rnz(r, -7, 7); } while (gcd(p, q) !== 1); if (d >= 2 && chance(r, 0.08)) p = 0; }
    b = rint(r, -9, 9);
    var kr = q === 1 ? 7 : 3;
    k1 = rint(r, -kr, kr); do { k2 = rint(r, -kr, kr); } while (k2 === k1);
    x1 = q * k1; x2 = q * k2; y1 = p * k1 + b; y2 = p * k2 + b;
    if (p === 0 && kind !== 'between' && kind !== 'twopts') { p = 1; y1 = k1 + b; y2 = k2 + b; }
    m = frac(p, q);
    var mp = p < 0 ? '(' + m + ')' : m; // slope wrapped in parentheses when negative, for work strings
    switch (kind) {
      case 'between':
        if (d === 3 && chance(r, 0.2)) { x2 = x1; y2 = y1 + rnz(r, -8, 8); return P('Find the slope of the line through ' + pt(x1, y1) + ' and ' + pt(x2, y2) + '.', 'undefined', ['no slope', 'vertical', 'does not exist'], 'The x-values are equal, so the line is vertical: the slope is undefined.'); }
        var raw = N(y2 - y1) + '/' + paren(x2 - x1), red = frac(y2 - y1, x2 - x1);
        return P('Find the slope of the line through ' + pt(x1, y1) + ' and ' + pt(x2, y2) + '.', red, [],
          'm = (' + N(y2) + ' ' + MINUS + ' ' + paren(y1) + ')/(' + N(x2) + ' ' + MINUS + ' ' + paren(x1) + ') = ' + raw + (raw === red ? '' : ' = ' + red));
      case 'twopts':
        return P('Write the equation of the line through ' + pt(x1, y1) + ' and ' + pt(x2, y2) + ' in y = mx + b form.', 'y = ' + mxb(p, q, b), mxbAccepts(p, q, b),
          'm = ' + N(y2 - y1) + '/' + paren(x2 - x1) + ' = ' + m + '; b = y ' + MINUS + ' mx = ' + N(y1) + ' ' + MINUS + ' ' + mp + '·' + paren(x1) + ' = ' + N(b));
      case 'slopept':
        return P('A line has slope ' + m + ' and passes through ' + pt(x1, y1) + '. Write its equation in y = mx + b form.', 'y = ' + mxb(p, q, b), mxbAccepts(p, q, b),
          'b = y ' + MINUS + ' mx = ' + N(y1) + ' ' + MINUS + ' ' + mp + '·' + paren(x1) + ' = ' + N(b));
      case 'fromeq':
        if (chance(r, 0.5)) return P('What is the slope of the line y = ' + mxb(p, q, b) + '?', m, ['m = ' + plain(m)], 'In y = mx + b the slope is the coefficient of x: m = ' + m + '.');
        return P('What is the y-intercept of the line y = ' + mxb(p, q, b) + '?', N(b), ['(0, ' + plain(N(b)) + ')', 'b = ' + plain(N(b))], 'In y = mx + b the y-intercept is b = ' + N(b) + ', the point (0, ' + N(b) + ').');
      case 'standard': {
        var A = rnz(r, -6, 6), B = rex(r, -6, 6, [0, 1, -1]), C = B * rint(r, -5, 5), g = gcd(A, B);
        var eq = joinTerms([{ c: A, v: 'x' }, { c: B, v: 'y' }]) + ' = ' + N(C), pp = -A / g, qq = B / g; if (qq < 0) { pp = -pp; qq = -qq; }
        var bb = C / B, form = 'y = ' + mxb(pp, qq, bb);
        var t = rint(r, 0, 2);
        if (t === 0) return P('What is the slope of the line ' + eq + '?', frac(-A, B), [], 'Solve for y: ' + form + ', so m = ' + frac(-A, B) + '.');
        if (t === 1) return P('What is the y-intercept of the line ' + eq + '?', N(bb), ['(0, ' + plain(N(bb)) + ')'], 'Set x = 0: ' + coefTerm(B, 'y') + ' = ' + N(C) + ', y = ' + N(bb) + '.');
        return P('Rewrite ' + eq + ' in y = mx + b form.', form, mxbAccepts(pp, qq, bb), coefTerm(B, 'y') + ' = ' + lin(-A, C) + ARROW + form);
      }
      case 'findy':
        return P('For the line y = ' + mxb(p, q, b) + ', find y when x = ' + N(x1) + '.', N(y1), [], 'y = ' + mp + '·' + paren(x1) + (b ? (b < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) : '') + ' = ' + N(y1));
      default: /* findx */
        return P('For the line y = ' + mxb(p, q, b) + ', find x when y = ' + N(y1) + '.', 'x = ' + N(x1), [N(x1)], N(y1) + ' = ' + mxb(p, q, b) + ARROW + coefTerm(p, 'x') + (q === 1 ? '' : '/' + q) + ' = ' + N(y1 - b) + ARROW + 'x = ' + N(x1));
    }
  }

  /* ================================================================ 3. systems */
  function std(A, B, C) { return joinTerms([{ c: A, v: 'x' }, { c: B, v: 'y' }]) + ' = ' + N(C); }
  function genSystems(d, r) {
    var x = rnz(r, -6, 6), y = rnz(r, -6, 6), a, b1, A, B, C, A2, B2, C2, e1, e2, work, kind;
    kind = d === 1 ? pick(r, ['equal', 'equal', 'subst']) : d === 2 ? pick(r, ['subst', 'substx', 'std1', 'std1']) : 'elim';
    switch (kind) {
      case 'equal': { a = rnz(r, -4, 4); var c = rex(r, -4, 4, [0, a]); b1 = y - a * x; var b2 = y - c * x;
        e1 = 'y = ' + lin(a, b1); e2 = 'y = ' + lin(c, b2);
        work = 'Equal Values: ' + lin(a, b1) + ' = ' + lin(c, b2) + ARROW + coefTerm(a - c, 'x') + ' = ' + N(b2 - b1) + ARROW + 'x = ' + N(x) + ', y = ' + N(y); break; }
      case 'subst': { var lim = d === 1 ? 3 : 6; a = rnz(r, -lim, lim); b1 = y - a * x;
        do { A = rnz(r, -lim, lim); B = rnz(r, -lim, lim); } while (A + B * a === 0); C = A * x + B * y;
        e1 = 'y = ' + lin(a, b1); e2 = std(A, B, C);
        work = 'Substitute: ' + coefTerm(A, 'x') + (B < 0 ? ' ' + MINUS + ' ' : ' + ') + coefTerm(Math.abs(B), '(' + lin(a, b1) + ')') + ' = ' + N(C) + ARROW + coefTerm(A + B * a, 'x') + ' = ' + N(C - B * b1) + ARROW + 'x = ' + N(x) + ', y = ' + N(y); break; }
      case 'substx': { a = rnz(r, -5, 5); b1 = x - a * y;
        do { A = rnz(r, -6, 6); B = rnz(r, -6, 6); } while (B + A * a === 0); C = A * x + B * y;
        e1 = 'x = ' + lin(a, b1, 'y'); e2 = std(A, B, C);
        work = 'Substitute for x: ' + coefTerm(A, '(' + lin(a, b1, 'y') + ')') + (B < 0 ? ' ' + MINUS + ' ' : ' + ') + coefTerm(Math.abs(B), 'y') + ' = ' + N(C) + ARROW + coefTerm(B + A * a, 'y') + ' = ' + N(C - A * b1) + ARROW + 'y = ' + N(y) + ', x = ' + N(x); break; }
      case 'std1': { B = rnz(r, -6, 6); C = x + B * y;
        do { A2 = rnz(r, -6, 6); B2 = rnz(r, -6, 6); } while (B2 - A2 * B === 0); C2 = A2 * x + B2 * y;
        e1 = std(1, B, C); e2 = std(A2, B2, C2);
        work = 'From eq. 1: x = ' + lin(-B, C, 'y') + '. Substitute: ' + coefTerm(A2, '(' + lin(-B, C, 'y') + ')') + (B2 < 0 ? ' ' + MINUS + ' ' : ' + ') + coefTerm(Math.abs(B2), 'y') + ' = ' + N(C2) + ARROW + coefTerm(B2 - A2 * B, 'y') + ' = ' + N(C2 - A2 * C) + ARROW + 'y = ' + N(y) + ', x = ' + N(x); break; }
      default: { /* elim */
        do { A = rint(r, 2, 6) * (chance(r, 0.4) ? -1 : 1); B = rint(r, 2, 6) * (chance(r, 0.5) ? -1 : 1); A2 = rint(r, 2, 6) * (chance(r, 0.4) ? -1 : 1); B2 = rint(r, 2, 6) * (chance(r, 0.5) ? -1 : 1); }
        while (A * B2 - A2 * B === 0 || Math.abs(A) === Math.abs(A2) || Math.abs(B) === Math.abs(B2));
        C = A * x + B * y; C2 = A2 * x + B2 * y; e1 = std(A, B, C); e2 = std(A2, B2, C2);
        var g = gcd(B, B2), k1 = Math.abs(B2) / g, k2 = Math.abs(B) / g, add = (B > 0) !== (B2 > 0);
        var cx = k1 * A + (add ? 1 : -1) * k2 * A2, cc = k1 * C + (add ? 1 : -1) * k2 * C2;
        work = 'Eliminate y: ' + (k1 === 1 ? '' : k1 + '·') + '(eq. 1) ' + (add ? '+' : MINUS) + ' ' + (k2 === 1 ? '' : k2 + '·') + '(eq. 2)' + ARROW + coefTerm(cx, 'x') + ' = ' + N(cc) + ARROW + 'x = ' + N(x) + '; then y = ' + N(y);
      }
    }
    return P('Solve the system:<br>' + e1 + '<br>' + e2, pt(x, y), ['x = ' + plain(N(x)) + ', y = ' + plain(N(y)), plain(N(x)) + ', ' + plain(N(y))], work);
  }

  /* ================================================================ 4. exponents */
  function mono(k, ex, ey) { // k x^ex y^ey as HTML (negative exponents shown as such)
    var s = '';
    if (ex) s += ex === 1 ? 'x' : 'x' + sup(ex);
    if (ey) s += ey === 1 ? 'y' : 'y' + sup(ey);
    if (k !== 1 || !s) s = N(k) + s;
    return s;
  }
  function monoAns(kn, kd, ex, ey) { // positive exponents only: numerator/denominator
    var num = mono(kn, Math.max(ex, 0), Math.max(ey, 0));
    var dparts = (kd !== 1 ? 1 : 0) + (ex < 0 ? 1 : 0) + (ey < 0 ? 1 : 0);
    if (!dparts) return num;
    var den = mono(kd, Math.max(-ex, 0), Math.max(-ey, 0));
    return num + '/' + (dparts > 1 ? '(' + den + ')' : den);
  }
  function monoAccepts(kn, kd, ex, ey) { // typed alternatives with negative exponents
    var s = kn === 1 ? '' : String(kn);
    if (ex) s += 'x' + (ex === 1 ? '' : '^' + ex);
    if (ey) s += 'y' + (ey === 1 ? '' : '^' + ey);
    if (!s) s = '1';
    return kd === 1 ? [s] : [s + '/' + kd, '(' + s + ')/' + kd];
  }
  function genExponents(d, r) {
    var kinds = d === 1 ? ['prod', 'quot', 'powpow', 'coefpow', 'zero', 'single', 'mixed']
      : d === 2 ? ['powprod', 'powprod', 'negmix', 'negnum', 'negvar', 'powdiv', 'powtimes', 'multiprod']
      : ['fracpow', 'negpow', 'coefneg', 'quotneg', 'numneg', 'mixneg'];
    var kind = pick(r, kinds), a, b, c, e, k, m, q, ans, acc, work;
    var instr = d === 1 ? 'Simplify: ' : 'Simplify (positive exponents only): ';
    switch (kind) {
      case 'prod': a = rint(r, 2, 9); b = rint(r, 2, 9); q = pow('x', a) + ' · ' + pow('x', b); ans = pow('x', a + b); work = 'Same base: add the exponents, ' + a + ' + ' + b + ' = ' + (a + b) + '.'; break;
      case 'quot': b = rint(r, 1, 6); a = b + rint(r, 1, 6); q = pow('x', a) + '/' + pow('x', b); ans = pow('x', a - b); work = 'Same base: subtract the exponents, ' + a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) + '.'; break;
      case 'powpow': a = rint(r, 2, 6); b = rint(r, 2, 4); q = '(' + pow('x', a) + ')' + sup(b); ans = pow('x', a * b); work = 'Power of a power: multiply the exponents, ' + a + ' · ' + b + ' = ' + (a * b) + '.'; break;
      case 'coefpow': k = rint(r, 2, 5); a = rint(r, 1, 4); b = k > 3 ? 2 : rint(r, 2, 3); q = '(' + mono(k, a, 0) + ')' + sup(b); ans = mono(Math.pow(k, b), a * b, 0); work = 'Raise each factor: ' + k + sup(b) + ' = ' + Math.pow(k, b) + ' and (' + pow('x', a) + ')' + sup(b) + ' = ' + pow('x', a * b) + '.'; break;
      case 'zero': k = rint(r, 2, 9); q = chance(r, 0.5) ? k + sup(0) : '(' + mono(k, rint(r, 1, 3), chance(r, 0.5) ? 1 : 0) + ')' + sup(0); ans = '1'; work = 'Anything (except 0) to the zero power is 1.'; break;
      case 'single': k = rint(r, 2, 5); a = rint(r, 1, 5); b = rint(r, 1, 5);
        if (chance(r, 0.6)) { q = k + sup(a) + ' · ' + k + sup(b); e = a + b; work = 'Same base: add the exponents, ' + a + ' + ' + b + ' = ' + e + '.'; }
        else { b = rint(r, 2, 3); q = '(' + k + sup(a) + ')' + sup(b); e = a * b; work = 'Power of a power: multiply the exponents, ' + a + ' · ' + b + ' = ' + e + '.'; }
        return P('Write as a single power: ' + q, k + sup(e), [String(Math.pow(k, e))], work + ' (' + k + sup(e) + ' = ' + commas(Math.pow(k, e)) + ')');
      case 'mixed': a = rint(r, 1, 5); b = rint(r, 1, 5); c = rint(r, 1, 5); q = mono(1, a, b) + ' · ' + pow('x', c); ans = mono(1, a + c, b); work = 'Add the exponents of x: ' + a + ' + ' + c + ' = ' + (a + c) + '; y' + sup(b) + ' stays.'; break;
      case 'powprod': k = pick(r, [1, 2, 2, 3, 3]); a = rint(r, 1, 4); b = rint(r, 1, 3); c = k === 3 ? rint(r, 2, 3) : rint(r, 2, 3); q = '(' + mono(k, a, b) + ')' + sup(c); ans = mono(Math.pow(k, c), a * c, b * c);
        work = 'Raise every factor to the power ' + c + ': ' + (k === 1 ? '' : k + sup(c) + ' = ' + Math.pow(k, c) + ', ') + '(' + pow('x', a) + ')' + sup(c) + ' = ' + pow('x', a * c) + ', (' + pow('y', b) + ')' + sup(c) + ' = ' + pow('y', b * c) + '.'; break;
      case 'negmix': b = rint(r, 1, 4); c = rint(r, 1, 3); a = b + c + rint(r, 1, 4); q = pow('x', a) + ' · x' + sup(-b) + '/' + pow('x', c); ans = pow('x', a - b - c); work = 'Add, then subtract, the exponents: ' + a + ' + (' + N(-b) + ') ' + MINUS + ' ' + c + ' = ' + (a - b - c) + '.'; break;
      case 'negnum': k = rint(r, 2, 5); a = k > 3 ? rint(r, 1, 2) : rint(r, 1, 3); q = k + sup(-a); ans = '1/' + Math.pow(k, a); acc = [String(+(1 / Math.pow(k, a)).toFixed(4)), '1/' + k + '^' + a]; work = k + sup(-a) + ' = 1/' + k + sup(a) + ' = 1/' + Math.pow(k, a) + '.'; break;
      case 'negvar': a = rint(r, 1, 6); k = chance(r, 0.4) ? rint(r, 2, 5) : 1; q = mono(k, -a, 0); ans = monoAns(k, 1, -a, 0); acc = monoAccepts(k, 1, -a, 0); work = 'A negative exponent means the reciprocal: ' + q + ' = ' + ans + '.'; break;
      case 'powdiv': a = rint(r, 1, 3); b = rint(r, 1, 3); c = rint(r, 2, 3); k = rint(r, 1, a * c - 1); m = rint(r, 1, b * c - 1); q = '(' + mono(1, a, b) + ')' + sup(c) + '/(' + mono(1, k, m) + ')'; ans = mono(1, a * c - k, b * c - m);
        work = 'Numerator: ' + mono(1, a * c, b * c) + '. Then subtract exponents: x' + sup(a * c) + '/x' + sup(k) + ' = ' + pow('x', a * c - k) + ', y' + sup(b * c) + '/y' + sup(m) + ' = ' + pow('y', b * c - m) + '.'; break;
      case 'powtimes': k = rint(r, 2, 3); a = rint(r, 1, 3); b = rint(r, 2, 3); c = rint(r, 1, 4); q = '(' + mono(k, a, 0) + ')' + sup(b) + ' · ' + pow('x', c); ans = mono(Math.pow(k, b), a * b + c, 0);
        work = '(' + mono(k, a, 0) + ')' + sup(b) + ' = ' + mono(Math.pow(k, b), a * b, 0) + '; then add exponents: ' + (a * b) + ' + ' + c + ' = ' + (a * b + c) + '.'; break;
      case 'multiprod': k = rint(r, 2, 4); m = rint(r, 2, 4); a = rint(r, 1, 4); b = rint(r, 1, 3); c = rint(r, 1, 4); e = rint(r, 1, 3); q = mono(k, a, b) + ' · ' + mono(m, c, e); ans = mono(k * m, a + c, b + e);
        work = 'Multiply the coefficients (' + k + ' · ' + m + ' = ' + (k * m) + ') and add exponents of like bases.'; break;
      case 'fracpow': k = pick(r, [1, 2, 2, 3]); a = rint(r, 1, 3); b = rint(r, 1, 3); c = k === 3 ? 2 : rint(r, 2, 3); q = '(' + mono(k, a, 0) + '/' + pow('y', b) + ')' + sup(c); ans = monoAns(Math.pow(k, c), 1, a * c, -b * c); acc = monoAccepts(Math.pow(k, c), 1, a * c, -b * c);
        work = 'Raise numerator and denominator to the power ' + c + ': ' + mono(Math.pow(k, c), a * c, 0) + ' over ' + pow('y', b * c) + '.'; break;
      case 'negpow': a = rint(r, 1, 3); b = rint(r, 1, 3); c = rint(r, 2, 3); q = '(x' + sup(-a) + pow('y', b) + ')' + sup(-c); ans = monoAns(1, 1, a * c, -b * c); acc = monoAccepts(1, 1, a * c, -b * c);
        work = 'Multiply exponents: x' + sup(a * c) + ' y' + sup(-b * c) + ' = ' + ans + '.'; break;
      case 'coefneg': k = rint(r, 2, 3); a = rint(r, 1, 3); b = k === 3 ? 2 : rint(r, 2, 3); q = '(' + mono(k, a, 0) + ')' + sup(-b); ans = monoAns(1, Math.pow(k, b), -a * b, 0); acc = ['x^-' + (a * b) + '/' + Math.pow(k, b), '1/' + Math.pow(k, b) + 'x^' + (a * b)];
        work = '(' + mono(k, a, 0) + ')' + sup(-b) + ' = 1/(' + mono(k, a, 0) + ')' + sup(b) + ' = ' + ans + '.'; break;
      case 'quotneg': a = rint(r, 1, 4); b = rint(r, 1, 4); c = a + b + rint(r, 1, 4); q = pow('x', a) + ' · ' + pow('x', b) + '/' + pow('x', c); ans = monoAns(1, 1, a + b - c, 0); acc = monoAccepts(1, 1, a + b - c, 0);
        work = 'Exponent: ' + a + ' + ' + b + ' ' + MINUS + ' ' + c + ' = ' + N(a + b - c) + ', so x' + sup(a + b - c) + ' = ' + ans + '.'; break;
      case 'numneg': k = rint(r, 2, 5); a = rint(r, 1, 3); b = rint(r, 1, 3); e = b - a; if (e === 0) e = -1, a = b + 1;
        q = chance(r, 0.5) ? k + sup(-a) + ' · ' + k + sup(b) : k + sup(b) + '/' + k + sup(a);
        ans = e > 0 ? String(Math.pow(k, e)) : '1/' + Math.pow(k, -e); acc = e > 0 ? [k + '^' + e] : [String(+(Math.pow(k, e)).toFixed(4)), k + '^' + e]; work = 'Exponent: ' + N(b) + ' ' + MINUS + ' ' + a + ' = ' + N(e) + ', so ' + k + sup(e) + ' = ' + ans + '.'; break;
      default: { /* mixneg */ k = 2; a = rint(r, 2, 3); b = rint(r, 1, 2); c = rint(r, 2, 3); var dd = rint(r, 1, a * c - 1), ee = b * c - rint(r, 1, 3);
        q = '(' + mono(k, a, -b) + ')' + sup(c) + ' · ' + mono(1, -dd, ee); var ex = a * c - dd, ey = -b * c + ee; ans = monoAns(Math.pow(k, c), 1, ex, ey); acc = monoAccepts(Math.pow(k, c), 1, ex, ey);
        work = '(' + mono(k, a, -b) + ')' + sup(c) + ' = ' + mono(Math.pow(k, c), a * c, -b * c) + '; add exponents: x' + sup(ex) + ', y' + sup(ey) + '.'; }
    }
    return P(instr + q, ans, acc || [], work);
  }

  /* ================================================================ 5. sequences */
  function isArith(t) { var d = t[1] - t[0]; return t.every(function (v, i) { return i === 0 || v - t[i - 1] === d; }); }
  function isGeom(t) { if (t[0] === 0) return false; var q = t[1] / t[0]; return t.every(function (v, i) { return i === 0 || (t[i - 1] !== 0 && v / t[i - 1] === q); }); }
  function termsStr(t) { return t.map(N).join(', ') + ', …'; }
  function arithSeq(d, r) {
    var dd = d === 1 ? rint(r, 2, 9) * (chance(r, 0.25) ? -1 : 1) : rnz(r, -9, 9), a1 = d === 1 ? rint(r, 1, 20) : rint(r, -20, 20);
    var t = [0, 1, 2, 3].map(function (i) { return a1 + i * dd; });
    return { type: 'arithmetic', t: t, a1: a1, d: dd, t0: a1 - dd, nth: function (n) { return a1 + (n - 1) * dd; },
      formula: 't(n) = ' + lin(dd, a1 - dd, 'n'),
      accepts: [plain(lin(dd, a1 - dd, 'n')), 'a_n = ' + plain(lin(dd, a1 - dd, 'n')), plain(joinTerms([{ c: a1, v: '' }, { c: dd, v: '(n ' + MINUS + ' 1)' }])), plain(joinTerms([{ c: dd, v: '(n ' + MINUS + ' 1)' }, { c: a1, v: '' }]))],
      work: 'Common difference d = ' + N(dd) + '; t(0) = ' + N(a1) + ' ' + MINUS + ' ' + paren(dd) + ' = ' + N(a1 - dd) + ', so t(n) = ' + lin(dd, a1 - dd, 'n') + '.' };
  }
  function geomSeq(d, r) {
    var b, t0, bStr, bAlts;
    if (d === 3 && chance(r, 0.35)) { b = 0.5; t0 = pick(r, [96, 128, 160, 192, 256, 320]); bStr = '(1/2)'; bAlts = ['(1/2)', '(0.5)', '0.5']; }
    else { b = pick(r, d === 3 ? [2, 3, -2, -3, 4] : [2, 2, 3, 4, 5]); t0 = rint(r, 1, 6) * (d === 3 && chance(r, 0.25) ? -1 : 1); bStr = b < 0 ? '(' + N(b) + ')' : String(b); bAlts = b < 0 ? ['(' + b + ')'] : [String(b), '(' + b + ')']; }
    var t = [1, 2, 3, 4].map(function (n) { return t0 * Math.pow(b, n); }), t1 = t[0];
    var f = 't(n) = ' + (t0 === 1 ? '' : N(t0) + '·') + bStr + sup('n');
    var acc = [];
    bAlts.forEach(function (bs) {
      acc.push((t0 === 1 ? '' : t0 + '*') + bs + '^n'); acc.push(t1 + '*' + bs + '^(n-1)'); acc.push('a_n = ' + t1 + '*' + bs + '^(n-1)');
      if (bs[0] === '(') { acc.push(t0 + bs + '^n'); acc.push(t1 + bs + '^(n-1)'); } // 3(2)^n, but never 32^n
    });
    return { type: 'geometric', t: t, b: b, t0: t0, nth: function (n) { return t0 * Math.pow(b, n); }, formula: f, accepts: acc,
      work: 'Multiplier b = ' + N(t[1]) + '/' + paren(t[0]) + ' = ' + (b === 0.5 ? '1/2' : N(b)) + '; t(0) = ' + N(t1) + ' ÷ ' + (b === 0.5 ? '(1/2)' : paren(b)) + ' = ' + N(t0) + ', so ' + f + '.' };
  }
  function neitherSeq(r) {
    var t, k, a, b;
    for (var tries = 0; tries < 20; tries++) {
      switch (rint(r, 0, 3)) {
        case 0: k = rint(r, 1, 5); t = [k * k, (k + 1) * (k + 1), (k + 2) * (k + 2), (k + 3) * (k + 3)]; break;
        case 1: a = rint(r, 1, 9); b = rint(r, 1, 5); k = rnz(r, -3, 3); t = [a, a + b, a + 2 * b + k, a + 3 * b + 3 * k]; break;
        case 2: a = rint(r, 1, 5); b = rint(r, a, 7); t = [a, b, a + b, a + 2 * b]; break;
        default: k = rint(r, 1, 3); t = [k, 8 * k, 27 * k, 64 * k];
      }
      if (!isArith(t) && !isGeom(t)) return { type: 'neither', t: t, work: 'The differences are not constant and the ratios are not constant, so it is neither.' };
    }
    return { type: 'neither', t: [1, 4, 9, 16], work: 'The differences (3, 5, 7) are not constant and the ratios are not constant.' };
  }
  function genSequences(d, r) {
    var kinds = d === 1 ? ['next', 'next', 'formula', 'term', 'classify', 'classify']
      : d === 2 ? ['next', 'formula', 'formula', 'term', 'classify']
      : ['next', 'formula', 'formula', 'term', 'twoterms', 'classify'];
    var kind = pick(r, kinds), s;
    if (kind === 'classify') {
      var w = rint(r, 0, 2); s = w === 0 ? arithSeq(Math.min(d, 2), r) : w === 1 ? geomSeq(Math.min(d, 2), r) : neitherSeq(r);
      var why = s.type === 'arithmetic' ? 'Each term adds ' + N(s.d) + ' (constant difference), so it is arithmetic.' : s.type === 'geometric' ? 'Each term is multiplied by ' + N(s.b) + ' (constant ratio), so it is geometric.' : s.work;
      return P('Is the sequence ' + termsStr(s.t) + ' arithmetic, geometric, or neither?', s.type, [s.type + ' sequence', 'it is ' + s.type], why);
    }
    s = d === 1 ? arithSeq(1, r) : chance(r, 0.5) ? arithSeq(d, r) : geomSeq(d, r);
    var t5 = s.nth(5), t6 = s.nth(6);
    switch (kind) {
      case 'next': return P('Write the next two terms: ' + termsStr(s.t), N(t5) + ', ' + N(t6), [plain(N(t5)) + ',' + plain(N(t6))],
        s.type === 'arithmetic' ? 'Add ' + N(s.d) + ' each time: ' + N(s.t[3]) + ' + ' + paren(s.d) + ' = ' + N(t5) + ', then ' + N(t6) + '.' : 'Multiply by ' + (s.b === 0.5 ? '1/2' : N(s.b)) + ' each time: ' + N(t5) + ', then ' + N(t6) + '.');
      case 'formula': return P('Write the explicit formula t(n) for the sequence ' + termsStr(s.t) + ' (t(1) = ' + N(s.t[0]) + ').', s.formula, s.accepts, s.work);
      case 'term': { var n = s.type === 'arithmetic' ? (d === 1 ? 10 : pick(r, [12, 15, 20, 25, 50, 100])) : (Math.abs(s.b) >= 3 ? rint(r, 5, 7) : s.b === 0.5 ? rint(r, 5, 8) : rint(r, 6, 10)), v = s.nth(n);
        return P('For the sequence ' + termsStr(s.t) + ', find t(' + n + ').', N(v), [], s.formula + ', so t(' + n + ') = ' + (s.type === 'arithmetic' ? lin(s.d, s.t0, '(' + n + ')') : (s.t0 === 1 ? '' : N(s.t0) + '·') + (s.b === 0.5 ? '(1/2)' : paren(s.b)) + sup(n)) + ' = ' + N(v) + '.'); }
      case 'twoterms': { s = arithSeq(3, r); var i = rint(r, 1, 4), j = i + rint(r, 2, 6);
        if (chance(r, 0.5)) return P('In an arithmetic sequence, t(' + i + ') = ' + N(s.nth(i)) + ' and t(' + j + ') = ' + N(s.nth(j)) + '. Write the explicit formula t(n).', s.formula, s.accepts,
          'd = (' + N(s.nth(j)) + ' ' + MINUS + ' ' + paren(s.nth(i)) + ')/(' + j + ' ' + MINUS + ' ' + i + ') = ' + N(s.d) + '; t(0) = ' + N(s.nth(i)) + ' ' + MINUS + ' ' + i + '·' + paren(s.d) + ' = ' + N(s.t0) + '.');
        var n2 = pick(r, [15, 20, 30, 50]);
        return P('In an arithmetic sequence, t(' + i + ') = ' + N(s.nth(i)) + ' and t(' + j + ') = ' + N(s.nth(j)) + '. Find t(' + n2 + ').', N(s.nth(n2)), [], 'd = ' + N(s.d) + ', ' + s.formula + ', so t(' + n2 + ') = ' + N(s.nth(n2)) + '.'); }
    }
    return P('Write the next two terms: ' + termsStr(s.t), N(t5) + ', ' + N(t6), [], '');
  }

  /* ================================================================ 6. exponential growth & decay */
  function pct(p) { return N(p) + '%'; }
  function genExponential(d, r) {
    var kinds = d === 1 ? ['mult', 'mult', 'cd', 'pop', 'car', 'half', 'eq']
      : d === 2 ? ['mult', 'cd', 'pop', 'car', 'half', 'eq', 'pctfrom']
      : ['mult', 'cd', 'pop', 'car', 'half', 'eq', 'pctfrom', 'findb'];
    var kind = pick(r, kinds), p, P0, n, v, b, name = pick(r, ['Priyaan', 'Maya', 'Arjun', 'Zoe', 'Leo', 'Nina']);
    switch (kind) {
      case 'mult': { p = d === 1 ? rint(r, 1, 50) : d === 2 ? rint(r, 2, 60) / 2 : pick(r, [3.9, 4.25, 0.5, 1.75, 6.8, 12.5, 2.35, 7.2]); var inc = chance(r, 0.55); b = +(1 + (inc ? p : -p) / 100).toFixed(5);
        return P('What multiplier (as a decimal) represents a ' + pct(p) + ' ' + (inc ? 'increase' : 'decrease') + '?', N(b), [], (inc ? '100% + ' : '100% ' + MINUS + ' ') + pct(p) + ' = ' + pct(inc ? 100 + p : 100 - p) + ' = ' + N(b)); }
      case 'cd': { P0 = pick(r, [500, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000]); p = d === 1 ? rint(r, 2, 6) : pick(r, [2.5, 3.5, 4.25, 4.5, 5.2, 3.75, 4.8]); n = d === 1 ? rint(r, 1, 3) : rint(r, 2, 7); b = 1 + p / 100; v = P0 * Math.pow(b, n);
        return P('A savings CD pays ' + pct(p) + ' APY (interest once a year). ' + name + ' deposits $' + commas(P0) + '. How much is the CD worth after ' + n + ' year' + (n === 1 ? '' : 's') + '? Round to the nearest cent.', money(v), [Math.round(v * 100) / 100 + ''], commas(P0) + ' · ' + N(b) + sup(n) + ' = ' + money(v)); }
      case 'pop': { P0 = pick(r, [1200, 2500, 4000, 6500, 8000, 12000, 25000, 40000]); p = d === 1 ? rint(r, 1, 8) : pick(r, [1.5, 2.5, 3, 4, 5, 6.5]); n = d === 1 ? rint(r, 2, 5) : rint(r, 3, 10); b = 1 + p / 100; v = P0 * Math.pow(b, n);
        return P('A town of ' + commas(P0) + ' people grows ' + pct(p) + ' per year. Predict the population after ' + n + ' years. Round to the nearest whole number.', commas(v), [String(Math.round(v))], commas(P0) + ' · ' + N(b) + sup(n) + ' ≈ ' + commas(v)); }
      case 'car': { P0 = pick(r, [12000, 15000, 18000, 24000, 30000, 36000]); p = d === 1 ? pick(r, [10, 20, 25, 50]) : pick(r, [12, 15, 18, 22, 8]); n = rint(r, 2, 6); b = 1 - p / 100; v = P0 * Math.pow(b, n);
        return P('A car bought for $' + commas(P0) + ' loses ' + pct(p) + ' of its value every year. What is it worth after ' + n + ' years? Round to the nearest dollar.', '$' + commas(v), [String(Math.round(v))], commas(P0) + ' · ' + N(b) + sup(n) + ' ≈ $' + commas(v)); }
      case 'half': { if (chance(r, 0.5)) { P0 = pick(r, [100, 200, 400, 800, 1600]); var h = pick(r, [2, 3, 4, 6]), k = rint(r, 2, 6); v = P0 * Math.pow(0.5, k);
          return P('A dose of ' + P0 + ' mg of medicine is in the bloodstream. Half of it is eliminated every ' + h + ' hours. How much remains after ' + (h * k) + ' hours?', N(v) + ' mg', [plain(N(v))], (h * k) + '/' + h + ' = ' + k + ' halvings: ' + P0 + ' · (1/2)' + sup(k) + ' = ' + N(v) + ' mg'); }
        P0 = pick(r, [50, 100, 150, 200, 300, 500]); var mins = pick(r, [15, 20, 30]), hrs = rint(r, 1, 3), kk = hrs * 60 / mins; v = P0 * Math.pow(2, kk);
        return P('A bacteria culture starts with ' + P0 + ' cells and doubles every ' + mins + ' minutes. How many cells are there after ' + hrs + ' hour' + (hrs === 1 ? '' : 's') + '?', commas(v), [String(v)], hrs * 60 + '/' + mins + ' = ' + kk + ' doublings: ' + P0 + ' · 2' + sup(kk) + ' = ' + commas(v)); }
      case 'eq': { P0 = pick(r, [50, 120, 200, 350, 500, 800, 1000, 2400]); p = d === 1 ? rint(r, 1, 30) : pick(r, [2.5, 3, 4.5, 7, 12, 15, 20, 35]); var up = chance(r, 0.5); b = +(1 + (up ? p : -p) / 100).toFixed(5);
        return P('Write an equation of the form y = a·b' + sup('x') + ' for a quantity that starts at ' + commas(P0) + ' and ' + (up ? 'grows' : 'shrinks') + ' ' + pct(p) + ' each year (x = years).', 'y = ' + P0 + '(' + N(b) + ')' + sup('x'), ['y = ' + P0 + '*' + b + '^x', P0 + '(' + b + ')^x', P0 + '*' + b + '^x', 'y = ' + P0 + ' · ' + b + '^x'], 'a = starting value ' + commas(P0) + '; b = ' + (up ? '1 + ' : '1 ' + MINUS + ' ') + N(p / 100) + ' = ' + N(b)); }
      case 'pctfrom': { b = pick(r, [1.04, 1.07, 1.12, 1.25, 1.5, 0.94, 0.85, 0.7, 0.92, 1.035]); var yb = pick(r, [150, 300, 600, 2000]); var incr = b > 1; p = +(Math.abs(b - 1) * 100).toFixed(3);
        return P('The equation y = ' + yb + '(' + N(b) + ')' + sup('x') + ' models a population over x years. By what percent does it ' + (incr ? 'increase' : 'decrease') + ' each year?', pct(p), [String(p)], 'b = ' + N(b) + ' = ' + (incr ? '1 + ' : '1 ' + MINUS + ' ') + N(p / 100) + ', so ' + pct(p) + ' per year.'); }
      default: { /* findb */ var pairs = [[1.1, 100], [1.2, 25], [1.5, 4], [2, 1], [0.5, 4], [0.9, 100], [0.8, 25]], pr = pick(r, pairs); b = pr[0]; P0 = pr[1] * rint(r, 1, 12); v = P0 * b * b;
        return P('A population was ' + commas(P0) + ' in year 0 and ' + commas(v) + ' in year 2. What is the yearly multiplier b in y = a·b' + sup('x') + '?', N(b), ['b = ' + b], 'b' + sup(2) + ' = ' + commas(v) + '/' + commas(P0) + ' = ' + N(b * b) + ', so b = ' + N(b)); }
    }
  }

  /* ================================================================ 7. inequalities */
  var OPH = { '<': '&lt;', '>': '&gt;', '<=': '≤', '>=': '≥' };
  var OPT = { '<': '<', '>': '>', '<=': '≤', '>=': '≥' };
  function flip(op) { return { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[op]; }
  function ineqAnswer(op, k) { return P('', 'x ' + OPH[op] + ' ' + N(k), ['x ' + OPT[op] + ' ' + plain(N(k)), plain(N(k)) + ' ' + OPT[flip(op)] + ' x']); }
  function genInequalities(d, r) {
    var ops = ['<', '>', '<=', '>='], op = pick(r, ops), k = rnz(r, -9, 9), a, b, c, dd, q, work, ans, res;
    var kinds = d === 1 ? ['add', 'mul', 'two', 'two', 'div'] : d === 2 ? ['negcoef', 'negcoef', 'subneg', 'both', 'dist'] : ['compound', 'compound', 'compound', 'compneg', 'and', 'negcoef', 'both'];
    var kind = pick(r, kinds);
    switch (kind) {
      case 'add': b = rnz(r, -12, 12); q = lin(1, b) + ' ' + OPH[op] + ' ' + N(k + b); work = 'x ' + OPT[op] + ' ' + N(k + b) + (b > 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) + ' = ' + N(k); res = op; break;
      case 'mul': a = rint(r, 2, 9); q = a + 'x ' + OPH[op] + ' ' + N(a * k); work = 'Divide by ' + a + ': x ' + OPT[op] + ' ' + N(k); res = op; break;
      case 'div': a = rint(r, 2, 6); q = 'x/' + a + ' ' + OPH[op] + ' ' + N(k); k = a * k; work = 'Multiply by ' + a + ': x ' + OPT[op] + ' ' + N(k); res = op; break;
      case 'two': a = rint(r, 2, 9); b = rnz(r, -12, 12); q = lin(a, b) + ' ' + OPH[op] + ' ' + N(a * k + b); work = a + 'x ' + OPT[op] + ' ' + N(a * k) + ARROW + 'x ' + OPT[op] + ' ' + N(k); res = op; break;
      case 'negcoef': a = rint(r, 2, 9); b = rnz(r, -12, 12); q = lin(-a, b) + ' ' + OPH[op] + ' ' + N(-a * k + b); work = MINUS + a + 'x ' + OPT[op] + ' ' + N(-a * k) + ARROW + 'divide by ' + MINUS + a + ' and flip: x ' + OPT[flip(op)] + ' ' + N(k); res = flip(op); break;
      case 'subneg': a = rint(r, 2, 9); b = rnz(r, -12, 12); q = joinTerms([{ c: b, v: '' }, { c: -a, v: 'x' }]) + ' ' + OPH[op] + ' ' + N(-a * k + b); work = MINUS + a + 'x ' + OPT[op] + ' ' + N(-a * k) + ARROW + 'divide by ' + MINUS + a + ' and flip: x ' + OPT[flip(op)] + ' ' + N(k); res = flip(op); break;
      case 'both': a = rint(r, 2, 9); c = rex(r, -9, 9, [0, a]); b = rnz(r, -12, 12); dd = (a - c) * k + b; q = lin(a, b) + ' ' + OPH[op] + ' ' + lin(c, dd);
        res = a - c > 0 ? op : flip(op); work = coefTerm(a - c, 'x') + ' ' + OPT[op] + ' ' + N(dd - b) + (a - c === 1 ? '' : ARROW + (a - c > 0 ? '' : 'divide by a negative and flip: ') + 'x ' + OPT[res] + ' ' + N(k)); break;
      case 'dist': a = rex(r, -6, 6, [0, 1, -1]); b = rnz(r, -9, 9); q = coefTerm(a, '(' + lin(1, b) + ')') + ' ' + OPH[op] + ' ' + N(a * (k + b)); res = a > 0 ? op : flip(op);
        work = lin(a, a * b) + ' ' + OPT[op] + ' ' + N(a * (k + b)) + ARROW + coefTerm(a, 'x') + ' ' + OPT[op] + ' ' + N(a * k) + ARROW + (a > 0 ? '' : 'flip: ') + 'x ' + OPT[res] + ' ' + N(k); break;
      case 'compound': case 'compneg': case 'and': {
        var lo = rint(r, -6, 4), hi = lo + rint(r, 2, 8), o1 = pick(r, ['<', '<=']), o2 = pick(r, ['<', '<=']);
        a = rint(r, 2, 5) * (kind === 'compneg' ? -1 : 1); b = rnz(r, -9, 9);
        var L = a * lo + b, H = a * hi + b; // values of ax + b at the bounds
        var ansH = N(lo) + ' ' + OPH[o1] + ' x ' + OPH[o2] + ' ' + N(hi);
        var acc = [N(lo) + ' ' + OPT[o1] + ' x ' + OPT[o2] + ' ' + N(hi), N(hi) + ' ' + OPT[flip(o2)] + ' x ' + OPT[flip(o1)] + ' ' + N(lo), 'x ' + OPT[flip(o1)] + ' ' + N(lo) + ' and x ' + OPT[o2] + ' ' + N(hi), 'x ' + OPT[o2] + ' ' + N(hi) + ' and x ' + OPT[flip(o1)] + ' ' + N(lo)];
        if (kind === 'and') { q = lin(1, b) + ' ' + OPH[flip(o1)] + ' ' + N(lo + b) + ' and ' + lin(a, -b) + ' ' + OPH[o2] + ' ' + N(a * hi - b); work = 'x ' + OPT[flip(o1)] + ' ' + N(lo) + ' and ' + a + 'x ' + OPT[o2] + ' ' + N(a * hi) + ARROW + 'x ' + OPT[o2] + ' ' + N(hi) + '; together: ' + plain(ansH); }
        else if (a > 0) { q = N(L) + ' ' + OPH[o1] + ' ' + lin(a, b) + ' ' + OPH[o2] + ' ' + N(H); work = 'Subtract ' + N(b) + ': ' + N(L - b) + ' ' + OPT[o1] + ' ' + a + 'x ' + OPT[o2] + ' ' + N(H - b) + ARROW + 'divide by ' + a + ': ' + plain(ansH); }
        else { q = N(H) + ' ' + OPH[o2 === '<' ? '<' : '<='] + ' ' + lin(a, b) + ' ' + OPH[o1 === '<' ? '<' : '<='] + ' ' + N(L); // a<0: ax+b at hi is smaller
          work = 'Subtract ' + N(b) + ': ' + N(H - b) + ' ' + OPT[o2] + ' ' + MINUS + Math.abs(a) + 'x ' + OPT[o1] + ' ' + N(L - b) + ARROW + 'divide by ' + N(a) + ' and flip both signs: ' + N(hi) + ' ' + OPT[flip(o2)] + ' x ' + OPT[flip(o1)] + ' ' + N(lo) + ', i.e. ' + plain(ansH); }
        return P('Solve: ' + q, ansH, acc, escOps(work));
      }
    }
    ans = ineqAnswer(res, k);
    return P('Solve: ' + q, ans.answer, ans.accept, escOps(work));
  }
  function escOps(s) { return s.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ================================================================ 8. expressions */
  function genExpressions(d, r) {
    var kinds = d === 1 ? ['dist', 'dist', 'combine', 'combine', 'gcf'] : d === 2 ? ['binom', 'binom', 'binom2', 'distcomb', 'gcfx', 'square'] : ['factor', 'factor', 'factor', 'dsq', 'binom3', 'gcfx', 'square'];
    var kind = pick(r, kinds), a, b, c, dd, g, p, q;
    switch (kind) {
      case 'dist': a = rex(r, -6, 6, [0, 1, -1]); b = rint(r, 1, 5); c = rnz(r, -9, 9);
        return P('Distribute: ' + coefTerm(a, '(' + lin(b, c) + ')'), poly([a * b, a * c]), [], N(a) + '·' + coefTerm(b, 'x') + ' + ' + paren(a) + '·' + paren(c) + ' = ' + poly([a * b, a * c]));
      case 'combine': a = rnz(r, -9, 9); do { c = rnz(r, -9, 9); } while (a + c === 0); b = rnz(r, -12, 12); dd = rnz(r, -12, 12);
        return P('Combine like terms: ' + joinTerms([{ c: a, v: 'x' }, { c: b, v: '' }, { c: c, v: 'x' }, { c: dd, v: '' }]), poly([a + c, b + dd]), [], '(' + N(a) + ' + ' + paren(c) + ')x + (' + N(b) + ' + ' + paren(dd) + ') = ' + poly([a + c, b + dd]));
      case 'gcf': g = rint(r, 2, 6); do { p = rint(r, 1, 7); q = rnz(r, -9, 9); } while (gcd(p, q) !== 1);
        return P('Factor out the GCF: ' + poly([g * p, g * q]), g + '(' + lin(p, q) + ')', [g + '(' + plain(joinTerms([{ c: q, v: '' }, { c: p, v: 'x' }])) + ')'], 'GCF of ' + N(g * p) + ' and ' + N(g * q) + ' is ' + g + ': ' + g + '(' + lin(p, q) + ')');
      case 'binom': a = rnz(r, -9, 9); b = rnz(r, -9, 9);
        return P('Use a generic rectangle to multiply: (' + lin(1, a) + ')(' + lin(1, b) + ')', poly([1, a + b, a * b]), [], 'Four parts: ' + joinTerms([{ c: 1, v: 'x' + sup(2) }, { c: b, v: 'x' }, { c: a, v: 'x' }, { c: a * b, v: '' }]) + ' = ' + poly([1, a + b, a * b]));
      case 'binom2': case 'binom3': a = rint(r, 2, d === 3 ? 6 : 4); b = rnz(r, -7, 7); c = rint(r, d === 3 ? 2 : 1, d === 3 ? 6 : 4); dd = rnz(r, -7, 7);
        return P('Multiply: (' + lin(a, b) + ')(' + lin(c, dd) + ')', poly([a * c, a * dd + b * c, b * dd]), [], 'Four parts: ' + joinTerms([{ c: a * c, v: 'x' + sup(2) }, { c: a * dd, v: 'x' }, { c: b * c, v: 'x' }, { c: b * dd, v: '' }]) + ' = ' + poly([a * c, a * dd + b * c, b * dd]));
      case 'distcomb': a = rex(r, -5, 5, [0]); b = rint(r, 1, 5); c = rnz(r, -6, 6); dd = rex(r, -5, 5, [0]); var e = rint(r, 1, 5), f = rnz(r, -6, 6);
        while (a * b + dd * e === 0) dd = rex(r, -5, 5, [0]);
        return P('Simplify: ' + joinTerms([{ c: a, v: '(' + lin(b, c) + ')' }, { c: dd, v: '(' + lin(e, f) + ')' }]), poly([a * b + dd * e, a * c + dd * f]), [], poly([a * b, a * c]) + (dd * e < 0 ? ' ' + MINUS + ' ' : ' + ') + plain(poly([Math.abs(dd * e), dd * f * (dd * e < 0 ? -1 : 1)])).replace(/\^2/g, '') + ' = ' + poly([a * b + dd * e, a * c + dd * f]));
      case 'gcfx': g = rint(r, 2, 6); do { p = rint(r, 1, 6); q = rnz(r, -9, 9); } while (gcd(p, q) !== 1);
        return P('Factor out the GCF: ' + poly([g * p, g * q, 0]), g + 'x(' + lin(p, q) + ')', [g + 'x(' + plain(joinTerms([{ c: q, v: '' }, { c: p, v: 'x' }])) + ')'], 'GCF is ' + g + 'x: ' + g + 'x(' + lin(p, q) + ')');
      case 'square': a = rnz(r, -9, 9);
        return P('Expand: (' + lin(1, a) + ')' + sup(2), poly([1, 2 * a, a * a]), [], '(' + lin(1, a) + ')(' + lin(1, a) + ') = ' + poly([1, 2 * a, a * a]));
      case 'dsq': a = rint(r, 2, 12);
        return P('Factor: ' + poly([1, 0, -a * a]), '(x + ' + a + ')(x ' + MINUS + ' ' + a + ')', ['(x - ' + a + ')(x + ' + a + ')'], 'Difference of squares: x' + sup(2) + ' ' + MINUS + ' ' + a + sup(2) + ' = (x + ' + a + ')(x ' + MINUS + ' ' + a + ')');
      default: { /* factor trinomial, a = 1 */ p = rnz(r, -9, 9); q = rnz(r, -9, 9); if (p + q === 0) q = q + 1 || 1; if (p > q) { var t = p; p = q; q = t; }
        return P('Factor: ' + poly([1, p + q, p * q]), '(' + lin(1, p) + ')(' + lin(1, q) + ')', ['(' + plain(lin(1, q)) + ')(' + plain(lin(1, p)) + ')'], 'Two numbers with product ' + N(p * q) + ' and sum ' + N(p + q) + ': ' + N(p) + ' and ' + N(q) + '.'); }
    }
  }

  /* ================================================================ 9. functions */
  function genFunctions(d, r) {
    var kinds = d === 1 ? ['eval', 'eval', 'findx', 'domain', 'isfn'] : d === 2 ? ['eval', 'eval', 'findx', 'domain', 'range', 'isfn'] : ['eval', 'eval', 'findx', 'range', 'isfn', 'isfn2'];
    var kind = pick(r, kinds), f = pick(r, ['f', 'g', 'h']), a, b, c, k, def, val, work;
    switch (kind) {
      case 'eval': k = rint(r, -5, 9);
        if (d === 1) { a = rnz(r, -9, 9); b = rnz(r, -12, 12); def = lin(a, b); val = a * k + b; work = f + '(' + N(k) + ') = ' + N(a) + '·' + paren(k) + (b < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) + ' = ' + N(val); }
        else if (d === 2) { a = pick(r, [1, 1, -1, 2]); b = rnz(r, -6, 6); c = rnz(r, -9, 9); def = poly([a, b, c]); val = a * k * k + b * k + c; work = f + '(' + N(k) + ') = ' + coefTerm(a, paren(k) + sup(2)) + (b < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) + '·' + paren(k) + (c < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(c)) + ' = ' + N(val); }
        else { var w = rint(r, 0, 2);
          if (w === 0) { k = rint(r, 0, 6); c = rnz(r, -9, 9); def = '2' + sup('x') + (c < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(c)); val = Math.pow(2, k) + c; work = f + '(' + N(k) + ') = 2' + sup(k) + (c < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(c)) + ' = ' + N(val); }
          else if (w === 1) { a = rex(r, -3, 3, [0]); var h = rnz(r, -6, 6), kk = rnz(r, -9, 9); def = coefTerm(a, '(' + lin(1, -h) + ')' + sup(2)) + (kk < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(kk)); val = a * (k - h) * (k - h) + kk; work = f + '(' + N(k) + ') = ' + coefTerm(a, '(' + N(k - h) + ')' + sup(2)) + (kk < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(kk)) + ' = ' + N(val); }
          else { b = rnz(r, -9, 9); def = poly([-1, b, 0]); val = -k * k + b * k; work = f + '(' + N(k) + ') = ' + MINUS + paren(k) + sup(2) + (b < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) + '·' + paren(k) + ' = ' + N(val); } }
        return P('If ' + f + '(x) = ' + def + ', find ' + f + '(' + N(k) + ').', N(val), [f + '(' + plain(N(k)) + ') = ' + plain(N(val))], work);
      case 'findx': a = d === 1 ? rint(r, 2, 9) : rex(r, -9, 9, [0, 1]); b = rnz(r, -12, 12); k = rnz(r, -9, 9); val = a * k + b;
        return P('If ' + f + '(x) = ' + lin(a, b) + ', find x when ' + f + '(x) = ' + N(val) + '.', 'x = ' + N(k), [N(k)], lin(a, b) + ' = ' + N(val) + ARROW + coefTerm(a, 'x') + ' = ' + N(val - b) + ARROW + 'x = ' + N(k));
      case 'domain': case 'range': { var n = rint(r, 3, 5), xs = shuffle(r, [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].slice()).slice(0, n), ys = xs.map(function () { return rint(r, -6, 9); });
        if (kind === 'range' && chance(r, 0.6)) ys[n - 1] = ys[0]; // a repeated output
        var pts = '{' + xs.map(function (x, i) { return pt(x, ys[i]); }).join(', ') + '}';
        var dom = xs.slice().sort(function (p, q) { return p - q; }), ran = ys.filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort(function (p, q) { return p - q; });
        var set = kind === 'domain' ? dom : ran;
        return P('State the ' + kind + ' of the function ' + pts + '.', '{' + set.map(N).join(', ') + '}', [set.map(function (v) { return plain(N(v)); }).join(', ')], kind === 'domain' ? 'The domain is the set of inputs (x-values).' : 'The range is the set of outputs (y-values), each listed once.'); }
      default: { /* isfn / isfn2 */ var m = 4, xv = shuffle(r, [-3, -2, -1, 0, 1, 2, 3, 4, 5].slice()).slice(0, m), yv = xv.map(function () { return rint(r, -5, 9); }), isFn = chance(r, 0.5), why;
        if (!isFn) { var i = rint(r, 0, m - 2); xv[i + 1] = xv[i]; if (yv[i + 1] === yv[i]) yv[i + 1] = yv[i] + rnz(r, -4, 4); why = 'The input x = ' + N(xv[i]) + ' has two different outputs (' + N(yv[i]) + ' and ' + N(yv[i + 1]) + '), so it is not a function.'; }
        else { if (chance(r, 0.6)) yv[m - 1] = yv[0]; why = 'Every input has exactly one output (repeated outputs are fine), so it is a function.'; }
        var shown = kind === 'isfn2' || chance(r, 0.4) ? 'the relation {' + xv.map(function (x, j) { return pt(x, yv[j]); }).join(', ') + '}' : 'the table<br>x: ' + xv.map(N).join(', ') + '<br>y: ' + yv.map(N).join(', ');
        return P('Is ' + shown + ' a function? (yes/no)', isFn ? 'yes' : 'no', isFn ? ['yes, it is a function', 'function'] : ['no, it is not a function', 'not a function'], why); }
    }
  }

  /* ================================================================ 10. coordinate geometry */
  var TRIPLES = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17], [7, 24, 25], [9, 12, 15], [12, 9, 15]];
  var RADS = [[1, 2, 5], [2, 1, 5], [2, 3, 13], [3, 2, 13], [1, 4, 17], [4, 1, 17], [2, 5, 29], [1, 3, 10], [3, 1, 10], [3, 5, 34], [1, 1, 2], [4, 5, 41]];
  function genCoordinate(d, r) {
    var kinds = d === 1 ? ['dist', 'dist', 'mid', 'reflect', 'translate'] : d === 2 ? ['dist', 'mid', 'reflect', 'translate', 'endpoint'] : ['dist', 'dist', 'mid', 'reflect2', 'endpoint', 'perimeter'];
    var kind = pick(r, kinds), x1 = rint(r, -8, 8), y1 = rint(r, -8, 8), x2, y2, sx = chance(r, 0.5) ? -1 : 1, sy = chance(r, 0.5) ? -1 : 1, t;
    switch (kind) {
      case 'dist': { var rad = d === 3 && chance(r, 0.5); t = pick(r, rad ? RADS : TRIPLES); x2 = x1 + sx * t[0]; y2 = y1 + sy * t[1];
        var ans = rad ? '√' + t[2] : String(t[2]), acc = rad ? ['sqrt(' + t[2] + ')', 'sqrt' + t[2], String(+Math.sqrt(t[2]).toFixed(2))] : [];
        return P('Find the distance between ' + pt(x1, y1) + ' and ' + pt(x2, y2) + '.', ans, acc, 'd = √(' + t[0] + sup(2) + ' + ' + t[1] + sup(2) + ') = √' + (t[0] * t[0] + t[1] * t[1]) + (rad ? '' : ' = ' + t[2])); }
      case 'mid': { if (d === 3) { x2 = rint(r, -8, 8); y2 = rint(r, -8, 8); } else { x2 = x1 + 2 * rnz(r, -4, 4); y2 = y1 + 2 * rnz(r, -4, 4); }
        return P('Find the midpoint of the segment from ' + pt(x1, y1) + ' to ' + pt(x2, y2) + '.', pt((x1 + x2) / 2, (y1 + y2) / 2), [], 'Average the coordinates: ((' + N(x1) + ' + ' + paren(x2) + ')/2, (' + N(y1) + ' + ' + paren(y2) + ')/2) = ' + pt((x1 + x2) / 2, (y1 + y2) / 2)); }
      case 'reflect': case 'reflect2': { if (x1 === 0) x1 = 3; if (y1 === 0) y1 = -2; var w = kind === 'reflect' ? rint(r, 0, 1) : rint(r, 0, 4), res, desc, how;
        if (w === 0) { res = [x1, -y1]; desc = 'Reflect ' + pt(x1, y1) + ' across the x-axis.'; how = 'Reflecting across the x-axis keeps x and changes the sign of y.'; }
        else if (w === 1) { res = [-x1, y1]; desc = 'Reflect ' + pt(x1, y1) + ' across the y-axis.'; how = 'Reflecting across the y-axis changes the sign of x and keeps y.'; }
        else if (w === 2) { res = [y1, x1]; desc = 'Reflect ' + pt(x1, y1) + ' across the line y = x.'; how = 'Reflecting across y = x swaps the coordinates.'; }
        else if (w === 3) { res = [-x1, -y1]; desc = 'Rotate ' + pt(x1, y1) + ' 180° about the origin.'; how = 'A 180° rotation changes the sign of both coordinates.'; }
        else { res = [-y1, x1]; desc = 'Rotate ' + pt(x1, y1) + ' 90° counterclockwise about the origin.'; how = '(x, y) → (' + MINUS + 'y, x).'; }
        return P(desc + ' Give the image point.', pt(res[0], res[1]), [], how + ' Image: ' + pt(res[0], res[1])); }
      case 'translate': { var dx = rnz(r, -7, 7), dy = rnz(r, -7, 7);
        return P('Translate ' + pt(x1, y1) + ' ' + Math.abs(dx) + ' unit' + (Math.abs(dx) === 1 ? '' : 's') + ' ' + (dx < 0 ? 'left' : 'right') + ' and ' + Math.abs(dy) + ' unit' + (Math.abs(dy) === 1 ? '' : 's') + ' ' + (dy < 0 ? 'down' : 'up') + '.', pt(x1 + dx, y1 + dy), [], '(' + N(x1) + ' + ' + paren(dx) + ', ' + N(y1) + ' + ' + paren(dy) + ') = ' + pt(x1 + dx, y1 + dy)); }
      case 'endpoint': { var mx = rint(r, -6, 6), my = rint(r, -6, 6); x2 = 2 * mx - x1; y2 = 2 * my - y1;
        return P('M' + pt(mx, my) + ' is the midpoint of segment AB. If A = ' + pt(x1, y1) + ', find B.', pt(x2, y2), [], 'B = (2·' + paren(mx) + ' ' + MINUS + ' ' + paren(x1) + ', 2·' + paren(my) + ' ' + MINUS + ' ' + paren(y1) + ') = ' + pt(x2, y2)); }
      default: { /* perimeter */ t = pick(r, TRIPLES); var B = [x1 + sx * t[0], y1], C = [x1 + sx * t[0], y1 + sy * t[1]];
        return P('Find the perimeter of the triangle with vertices ' + pt(x1, y1) + ', ' + pt(B[0], B[1]) + ', and ' + pt(C[0], C[1]) + '.', String(t[0] + t[1] + t[2]), [], 'The legs are ' + t[0] + ' and ' + t[1] + '; the hypotenuse is √(' + t[0] + sup(2) + ' + ' + t[1] + sup(2) + ') = ' + t[2] + '. Perimeter = ' + (t[0] + t[1] + t[2])); }
    }
  }

  /* ================================================================ 11. two-variable data */
  var CONTEXTS = [
    { x: 'hours studied', xu: 'hour', y: 'test score', yu: 'points', m: [3.5, 4, 4.5, 5, 6], b: [55, 58, 60, 62, 65], xs: [2, 3, 4, 5, 6, 7, 8], money: false },
    { x: 'age of a used car in years', xu: 'year', y: 'value of the car', yu: 'dollars', m: [-1200, -1500, -1800, -2000, -2500], b: [18000, 21000, 24000, 30000], xs: [2, 3, 4, 5, 6, 7], money: true },
    { x: 'outside temperature in °F', xu: 'degree', y: 'number of hot chocolates sold', yu: 'cups', m: [-1.5, -2, -2.5, -3], b: [180, 200, 240, 260], xs: [20, 30, 40, 50, 60], money: false },
    { x: 'minutes of exercise', xu: 'minute', y: 'calories burned', yu: 'calories', m: [7, 8, 9.5, 10, 11], b: [20, 30, 40, 50], xs: [10, 15, 20, 30, 45], money: false },
    { x: 'weeks since planting', xu: 'week', y: 'height of the plant', yu: 'cm', m: [2.5, 3, 3.5, 4], b: [5, 8, 10, 12], xs: [3, 4, 5, 6, 8, 10], money: false },
    { x: 'number of toppings', xu: 'topping', y: 'price of a pizza', yu: 'dollars', m: [1.25, 1.5, 1.75, 2], b: [9, 10, 11, 12], xs: [1, 2, 3, 4, 5, 6], money: true },
    { x: 'years since 2010', xu: 'year', y: 'number of students at the school', yu: 'students', m: [25, 30, 40, 50], b: [400, 450, 520, 600], xs: [3, 4, 5, 6, 8, 10], money: false }
  ];
  function fmtY(ctx, v) { return ctx.money ? money(v) : N(v); }
  function genData(d, r) {
    var kinds = d === 1 ? ['predict', 'predict', 'assoc', 'mean', 'median'] : d === 2 ? ['predict', 'slope', 'intercept', 'assoc', 'residual', 'mean', 'median'] : ['predict', 'slope', 'intercept', 'assoc', 'residual', 'strongest', 'mean', 'median'];
    var kind = pick(r, kinds), ctx = pick(r, CONTEXTS), m = pick(r, ctx.m), b = pick(r, ctx.b), k = pick(r, ctx.xs);
    var line = 'The line of best fit for ' + ctx.x + ' (x) and ' + ctx.y + ' (y) is y = ' + lin(m, b) + '.';
    switch (kind) {
      case 'predict': { var v = +(m * k + b).toFixed(4);
        return P(line + ' Predict the ' + ctx.y + ' when x = ' + N(k) + '.', fmtY(ctx, v), [plain(N(v))], 'y = ' + N(m) + '·' + N(k) + (b < 0 ? ' ' + MINUS + ' ' : ' + ') + N(Math.abs(b)) + ' = ' + N(v)); }
      case 'slope': case 'intercept': { var up = m > 0, am = N(Math.abs(m));
        var bs = b >= 1000 ? commas(b) : N(b);
        var sCorrect = 'For each additional ' + ctx.xu + ', the ' + ctx.y + ' ' + (up ? 'increases' : 'decreases') + ' by about ' + am + ' ' + ctx.yu + '.';
        var iCorrect = 'When the ' + ctx.x + ' is 0, the predicted ' + ctx.y + ' is ' + bs + ' ' + ctx.yu + '.';
        var wrong1 = 'For each additional ' + ctx.xu + ', the ' + ctx.y + ' ' + (up ? 'decreases' : 'increases') + ' by about ' + am + ' ' + ctx.yu + '.';
        var wrong2 = 'The ' + ctx.x + ' is ' + bs + ' when the ' + ctx.y + ' is 0.';
        var opts = kind === 'slope' ? [sCorrect, iCorrect, wrong1] : [iCorrect, sCorrect, wrong2];
        var correct = opts[0]; shuffle(r, opts); var letter = 'abc'[opts.indexOf(correct)];
        return P(line + ' What does the ' + (kind === 'slope' ? 'slope' : 'y-intercept') + ' mean in this situation?<br>(a) ' + opts[0] + '<br>(b) ' + opts[1] + '<br>(c) ' + opts[2], letter, ['(' + letter + ')', letter + ')'],
          kind === 'slope' ? 'The slope ' + N(m) + ' is the change in y for each 1-unit increase in x.' : 'The y-intercept ' + N(b) + ' is the value of y when x = 0.'); }
      case 'assoc': { var strong = d === 3 ? rint(r, 0, 2) : rint(r, 0, 1), neg = chance(r, 0.5), rv;
        rv = strong === 0 ? pick(r, [0.82, 0.85, 0.88, 0.9, 0.93, 0.95, 0.97]) : strong === 1 ? pick(r, [0.08, 0.12, 0.15, 0.2, 0.25, 0.3]) : pick(r, [0.45, 0.5, 0.55, 0.6, 0.65]);
        var word = ['strong', 'weak', 'moderate'][strong], dir = neg ? 'negative' : 'positive';
        return P('A scatterplot has correlation coefficient r = ' + N(neg ? -rv : rv) + '. Describe the association (strength and direction).', word + ' ' + dir, [dir + ' ' + word, word + ', ' + dir, word + ' ' + dir + ' association'], 'The sign of r gives the direction (' + dir + '); |r| = ' + N(rv) + ' is ' + (strong === 0 ? 'close to 1, so strong.' : strong === 1 ? 'close to 0, so weak.' : 'in the middle, so moderate.')); }
      case 'residual': { var yk = +(m * k + b + rnz(r, -8, 8) * (ctx.money && Math.abs(m) > 100 ? 100 : 1)).toFixed(4), pred = +(m * k + b).toFixed(4), res = +(yk - pred).toFixed(4);
        return P(line + ' The actual ' + ctx.y + ' when x = ' + N(k) + ' was ' + fmtY(ctx, yk) + '. Find the residual (actual ' + MINUS + ' predicted).', fmtY(ctx, res), [plain(N(res))], 'Predicted y = ' + N(pred) + '; residual = ' + N(yk) + ' ' + MINUS + ' ' + N(pred) + ' = ' + N(res)); }
      case 'strongest': { var vals = shuffle(r, [0.15, 0.32, 0.48, 0.61, 0.77, 0.86, 0.93, 0.99].slice()).slice(0, 3).map(function (v) { return chance(r, 0.5) ? -v : v; }), best = vals.reduce(function (p, q) { return Math.abs(q) > Math.abs(p) ? q : p; });
        return P('Which correlation coefficient shows the strongest linear association: r = ' + vals.map(N).join(', r = ') + '?', N(best), ['r = ' + plain(N(best))], 'Strength depends on |r|; the value closest to 1 or ' + MINUS + '1 is ' + N(best) + '.'); }
      default: { /* mean / median */ var n = kind === 'mean' ? (d === 3 ? pick(r, [4, 6]) : 5) : (d === 1 ? 5 : pick(r, [5, 6, 7])), data = [], i, sum = 0;
        for (i = 0; i < n; i++) data.push(rint(r, 1, d === 1 ? 20 : 60));
        if (kind === 'mean') { sum = data.reduce(function (p, q) { return p + q; }, 0); if (d < 3) data[n - 1] += (n - sum % n) % n; sum = data.reduce(function (p, q) { return p + q; }, 0); var mean = +(sum / n).toFixed(2);
          return P('Find the mean of the data set: ' + data.map(N).join(', '), N(mean), [], 'Sum = ' + sum + '; ' + sum + ' ÷ ' + n + ' = ' + N(mean)); }
        var sorted = data.slice().sort(function (p, q) { return p - q; }), med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
        return P('Find the median of the data set: ' + data.map(N).join(', '), N(med), [], 'In order: ' + sorted.map(N).join(', ') + (n % 2 ? '; the middle value is ' + N(med) : '; average the two middle values: ' + N(med))); }
    }
  }

  var GEN = { linear: genLinear, slope: genSlope, systems: genSystems, exponents: genExponents, sequences: genSequences, exponential: genExponential, inequalities: genInequalities, expressions: genExpressions, functions: genFunctions, coordinate: genCoordinate, data: genData };

  /* ================================================================ generate */
  function normTopics(topics) {
    var list = Array.isArray(topics) ? topics : typeof topics === 'string' ? topics.split(',') : [];
    list = list.map(function (s) { return String(s).trim().toLowerCase(); }).filter(Boolean);
    if (!list.length) return TOPICS.map(function (t) { return t.id; });
    list.forEach(function (id) { if (!GEN[id]) throw new Error('Unknown topic "' + id + '". Known topics: ' + TOPICS.map(function (t) { return t.id; }).join(', ')); });
    return TOPICS.map(function (t) { return t.id; }).filter(function (id) { return list.indexOf(id) >= 0; }); // canonical order, no duplicates
  }
  function generate(opts) {
    opts = opts || {};
    var topics = normTopics(opts.topics);
    var rawCount = (opts.count == null || opts.count === '') ? 20 : Number(opts.count);
    var count = isFinite(rawCount) ? Math.min(60, Math.max(1, Math.round(rawCount))) : 20;
    var difficulty = [1, 2, 3].indexOf(Number(opts.difficulty)) >= 0 ? Number(opts.difficulty) : 2;
    var seed = opts.seed;
    if (seed == null || seed === '' || isNaN(Number(seed))) seed = Math.floor(Math.random() * 1e9);
    seed = Math.abs(Math.floor(Number(seed))) % 4294967296;
    var r = rng(seed);
    var order = shuffle(r, topics.slice()), base = Math.floor(count / topics.length), extra = count % topics.length;
    var seen = {}, problems = [];
    order.forEach(function (id, i) {
      var n = base + (i < extra ? 1 : 0);
      for (var k = 0; k < n; k++) {
        var p, tries = 0;
        do { p = GEN[id](difficulty, r); tries++; } while (seen[p.question] && tries < 200);
        seen[p.question] = true;
        problems.push({ id: '', topic: id, topicName: TOPIC_BY_ID[id].name, question: p.question, answer: p.answer, accept: p.accept, work: p.work });
      }
    });
    shuffle(r, problems);
    problems.forEach(function (p, i) { p.id = 'q' + (i + 1); });
    return { seed: seed, difficulty: difficulty, topics: topics, count: count, problems: problems };
  }

  /* ================================================================ answer checking */
  function norm(s) {
    s = String(s == null ? '' : s);
    s = s.replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
    s = s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&le;/g, '≤').replace(/&ge;/g, '≥').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
    s = s.toLowerCase();
    s = s.replace(/[−–—]/g, '-');
    s = s.replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/=</g, '<=').replace(/=>/g, '>=');
    s = s.replace(/[⁰¹²³⁴-⁹]/g, function (c) { return '^' + '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c); });
    s = s.replace(/[·×⋅]/g, '*').replace(/÷/g, '/');
    s = s.replace(/sqrt\(([^()]*)\)/g, '√$1').replace(/sqrt/g, '√').replace(/√\((\d+(?:\.\d+)?)\)/g, '√$1');
    s = s.replace(/\$/g, '').replace(/%/g, '');
    s = s.trim().replace(/\s+/g, ' ').replace(/\.$/, '');
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s.replace(/ /g, ''))) s = s.replace(/,/g, '');
    s = s.replace(/^x ?= ?(-?[\d./]+) ?, ?y ?= ?(-?[\d./]+)$/, '$1, $2');
    s = s.replace(/^(y|x|t\(n\)|a_n|a_\{n\}|an|a\(n\)|[fgh]\(-?[\d.a-z]*\)|m|b|r|slope|y-intercept|d) ?= ?/, '');
    s = s.replace(/ /g, '');
    s = s.replace(/^\+/, '');
    s = s.replace(/\((-?\d+\/\d+)\)(?=[a-z])/g, '$1');
    s = s.replace(/(\d)\((-?\d+(?:\.\d+)?(?:\/\d+)?)\)/g, '$1*$2');
    s = s.replace(/\*\((-?\d+(?:\.\d+)?(?:\/\d+)?)\)/g, '*$1');
    s = s.replace(/\^\((-?\d+)\)/g, '^$1');
    s = s.replace(/\*(?=[a-z(])/g, '').replace(/\)\*/g, ')');
    s = s.replace(/^\(([^()]*)\)$/, '$1');
    return s;
  }
  function pn(s) { // parse a plain number, fraction, or radical → Number or null
    if (s === '' || s == null) return null;
    var m;
    if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
    if ((m = s.match(/^(-?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/))) return (m[1] ? -1 : 1) * Number(m[2]) / Number(m[3]);
    if ((m = s.match(/^(-?\d*\.?\d*)√(\d+(?:\.\d+)?)$/))) { var c = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]); return c * Math.sqrt(Number(m[2])); }
    return null;
  }
  // 0.01 tolerance (so 2249.73 accepts 2249.72), except answers given to 3+ decimals such as a 1.039 multiplier, which must match to half their last place.
  function tol(a) { var m = String(a).match(/\.(\d+)$/); var k = m ? m[1].length : 0; return k >= 3 ? 0.51 * Math.pow(10, -k) : 0.01; }
  function numList(s) { var parts = s.replace(/^[\(\[\{]|[\)\]\}]$/g, '').split(','); var out = []; for (var i = 0; i < parts.length; i++) { var v = pn(parts[i]); if (v === null) return null; out.push(v); } return out; }
  function canonIneq(s) {
    var parts = s.split('and'), lo = null, hi = null, i, m;
    function bound(op, v) { if (op === '<' || op === '<=') { if (hi === null || v < hi.v) hi = { v: v, inc: op === '<=' }; } else { if (lo === null || v > lo.v) lo = { v: v, inc: op === '>=' }; } }
    for (i = 0; i < parts.length; i++) {
      var p = parts[i];
      if ((m = p.match(/^(-?[\d.\/]+)(<=|>=|<|>)x(<=|>=|<|>)(-?[\d.\/]+)$/))) { var A = pn(m[1]), B = pn(m[4]); if (A === null || B === null) return null; bound(flip(m[2]), A); bound(m[3], B); }
      else if ((m = p.match(/^x(<=|>=|<|>)(-?[\d.\/]+)$/))) { var v = pn(m[2]); if (v === null) return null; bound(m[1], v); }
      else if ((m = p.match(/^(-?[\d.\/]+)(<=|>=|<|>)x$/))) { var v2 = pn(m[1]); if (v2 === null) return null; bound(flip(m[2]), v2); }
      else return null;
    }
    return (lo ? lo.v + (lo.inc ? '<=' : '<') : '') + 'x' + (hi ? (hi.inc ? '<=' : '<') + hi.v : '');
  }
  function canonPoly(s) {
    if (!s || !/[a-z]/.test(s) || /[<>={}√]/.test(s)) return null;
    var prot = s.replace(/\^-/g, '^~').replace(/\/\(([^()]*)\)/g, '/{$1}');
    if (/[()]/.test(prot) || !/^[-+]?[\da-z.^*\/~{}]+([-+][\da-z.^*\/~{}]+)*$/.test(prot)) return null;
    var terms = prot.match(/[-+]?[^-+]+/g), map = {}, i;
    for (i = 0; i < terms.length; i++) {
      var t = parseTerm(terms[i]); if (!t) return null;
      map[t.sig] = (map[t.sig] || 0) + t.coef;
    }
    var keys = Object.keys(map).filter(function (k) { return Math.abs(map[k]) > 1e-9; });
    if (!keys.length) return '0';
    keys.sort(function (A, B) { return degree(B) - degree(A) || (A < B ? -1 : 1); });
    return keys.map(function (k) { return (+map[k].toFixed(6)) + '|' + k; }).join(';');
    function degree(sig) { var dg = 0; sig.replace(/[a-z]\^(-?\d+(?:\.\d+)?)/g, function (_, e) { dg += Number(e); }); return dg; }
    function factors(str, into, direction) { // parse k x^a y^b; direction +1 multiplies, -1 divides
      var m = str.match(/^(\d+(?:\.\d+)?)?(.*)$/), coef = m[1] ? Number(m[1]) : 1, rest = m[2], re = /([a-z])(?:\^(~?\d+(?:\.\d+)?))?/g, mm, consumed = 0;
      while ((mm = re.exec(rest))) { if (mm.index !== consumed) return null; consumed += mm[0].length; var e = mm[2] ? Number(mm[2].replace('~', '-')) : 1; into.vars[mm[1]] = (into.vars[mm[1]] || 0) + direction * e; }
      if (consumed !== rest.length) return null;
      into.coef = direction > 0 ? into.coef * coef : into.coef / coef;
      return into;
    }
    function parseTerm(t) {
      var sign = 1; if (t[0] === '-') { sign = -1; t = t.slice(1); } else if (t[0] === '+') t = t.slice(1);
      var parts = t.split('/'), acc = { coef: sign, vars: {} };
      if (!factors(parts[0].replace(/\*/g, ''), acc, 1)) return null;
      for (var j = 1; j < parts.length; j++) {
        var p = parts[j].replace(/\*/g, '');
        if (p[0] === '{') { if (!factors(p.slice(1, -1), acc, -1)) return null; }
        else if (/^\d/.test(p)) { var mm = p.match(/^(\d+(?:\.\d+)?)(.*)$/); acc.coef /= Number(mm[1]); if (mm[2] && !factors(mm[2], acc, 1)) return null; } // 2/3x means (2/3)x
        else if (!factors(p, acc, -1)) return null;
      }
      var sig = Object.keys(acc.vars).filter(function (v) { return acc.vars[v] !== 0; }).sort().map(function (v) { return v + '^' + acc.vars[v]; }).join('');
      return { coef: acc.coef, sig: sig };
    }
  }
  function matchOne(a, t) {
    if (a === t) return true;
    if (a === 'yes' || a === 'no') { if (/^(no|not|false|n$)/.test(t)) return a === 'no'; if (/^(yes|y$|true|function|isafunction)/.test(t)) return a === 'yes'; return false; }
    if (/^[a-d]$/.test(a)) return t.replace(/[().]/g, '') === a;
    var assoc = a.match(/^(strong|moderate|weak)(positive|negative)$/);
    if (assoc) return t.indexOf(assoc[1]) >= 0 && t.indexOf(assoc[2]) >= 0 && !/positive.*negative|negative.*positive/.test(t);
    if (a[0] === '{' || t[0] === '{') { var A = numList(a), T = numList(t); if (!A || !T) return false; var uniq = function (arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }).sort(function (p, q) { return p - q; }); }; A = uniq(A); T = uniq(T); return A.length === T.length && A.every(function (v, i) { return Math.abs(v - T[i]) < 1e-9; }); }
    if (/[<>]/.test(a) || /[<>]/.test(t)) { var ca = canonIneq(a); return ca !== null && ca === canonIneq(t); }
    var na = pn(a), nt = pn(t);
    if (na !== null && nt !== null) return Math.abs(na - nt) <= tol(a);
    if (na !== null || nt !== null) return false;
    var la = numList(a), lt = numList(t);
    if (la && lt) return la.length === lt.length && la.every(function (v, i) { return Math.abs(v - lt[i]) <= 0.011; });
    var pa = canonPoly(a), ptt = canonPoly(t);
    if (pa && ptt) return pa === ptt;
    return false;
  }
  function checkAnswer(problem, typed) {
    if (!problem || typed == null) return false;
    var t = norm(typed); if (!t) return false;
    var cands = [problem.answer].concat(Array.isArray(problem.accept) ? problem.accept : []);
    for (var i = 0; i < cands.length; i++) { var a = norm(cands[i]); if (a && matchOne(a, t)) return true; }
    return false;
  }

  /* ================================================================ worksheet HTML */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safe(html) { // escape everything, then re-allow the tags/entities the generators produce
    return esc(html).replace(/&lt;(\/?)sup&gt;/g, '<$1sup>').replace(/&lt;br&gt;/g, '<br>').replace(/&amp;(lt|gt|le|ge|amp|nbsp|deg|#\d+);/g, '&$1;');
  }
  function renderWorksheet(ws, o) {
    o = o || {};
    if (!ws || !Array.isArray(ws.problems)) throw new Error('renderWorksheet needs a worksheet from IM1.generate');
    var title = o.title || 'Integrated Math 1 Practice', name = o.name || '', showAnswers = o.showAnswers !== false;
    var topics = (ws.topics || []).map(function (id) { return TOPIC_BY_ID[id] ? TOPIC_BY_ID[id].name : id; });
    var n = ws.problems.length, boxH = n <= 8 ? 2.1 : n <= 12 ? 1.6 : n <= 20 ? 1.2 : n <= 30 ? 0.95 : 0.75;
    var diffName = ['', 'Warm-up', 'Standard', 'Challenge'][ws.difficulty] || '';
    var cmd = 'node make_worksheet.js --topics ' + (ws.topics || []).join(',') + ' --count ' + n + ' --difficulty ' + ws.difficulty + ' --seed ' + ws.seed;
    var css = [
      '@page{size:letter;margin:.5in .55in .55in}',
      '*{box-sizing:border-box}',
      'body{margin:0;color:#14161c;font:11pt/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
      '.page{max-width:8.5in;margin:0 auto;padding:.45in .5in}',
      '@media screen{body{background:#e9ebf0}.page{background:#fff;box-shadow:0 2px 18px rgba(16,24,40,.18);margin:22px auto;min-height:11in;border-radius:3px}}',
      'header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2.5px solid #14161c;padding-bottom:7px}',
      'h1{font-size:17pt;margin:0;letter-spacing:-.01em;line-height:1.15}',
      '.kicker{font-size:8.5pt;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#6b7280;margin-bottom:3px}',
      '.meta{font-size:8.5pt;color:#6b7280;text-align:right;line-height:1.5;white-space:nowrap}',
      '.idline{display:flex;gap:22px;margin:11px 0 16px;font-size:10.5pt;color:#374151}',
      '.idline span{display:flex;gap:6px;align-items:baseline;flex:1}',
      '.idline i{flex:1;border-bottom:1px solid #9aa0ab;min-width:1.3in;font-style:normal;color:#14161c}',
      'ol.problems{list-style:none;margin:0;padding:0;columns:2;column-gap:26px}',
      'li.prob{break-inside:avoid;page-break-inside:avoid;display:flex;gap:9px;margin:0 0 13px}',
      '.num{flex:none;width:19px;height:19px;border-radius:50%;background:#14161c;color:#fff;font-size:9.5pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}',
      '.body{flex:1;min-width:0}.t{overflow-wrap:anywhere}',
      '.work{height:' + boxH + 'in;border:1px dashed #c3c8d2;border-radius:5px;margin-top:6px}',
      '.key{page-break-before:always;break-before:page;padding-top:.15in}',
      '.key h2{font-size:12.5pt;margin:0 0 8px;border-bottom:1.5px solid #14161c;padding-bottom:4px}',
      '.key ol{list-style:none;margin:0;padding:0;columns:3;column-gap:22px;font-size:9.5pt}',
      '.key li{break-inside:avoid;display:flex;gap:7px;margin:0 0 7px;align-items:baseline}',
      '.key .n{flex:none;width:16px;height:16px;border-radius:50%;border:1px solid #9aa0ab;color:#4b5563;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center}',
      '.key .a{flex:1;font-weight:600;overflow-wrap:anywhere}',
      '.key .w{display:block;font-weight:400;color:#6b7280;font-size:8.8pt;margin-top:1px}',
      'footer{margin-top:16px;border-top:1px solid #d5d9e0;padding-top:5px;font-size:8pt;color:#8b919c;display:flex;justify-content:space-between;gap:1em;flex-wrap:wrap}',
      'footer code{font-family:Menlo,Consolas,monospace;font-size:7.5pt}',
      'sup{font-size:.72em;line-height:0}',
      '@media print{.page{box-shadow:none;margin:0;padding:0;max-width:none;min-height:0}}',
      '@media (max-width:600px){ol.problems,.key ol{columns:1}.page{padding:.4in .35in}}'
    ].join('');
    var head = '<header><div><div class="kicker">Practice worksheet</div><h1>' + esc(title) + '</h1></div>' +
      '<div class="meta">' + n + ' problems · level ' + esc(ws.difficulty) + (diffName ? ' ' + diffName : '') + '<br>' + esc(topics.join(' · ')) + '</div></header>' +
      '<div class="idline"><span>Name <i>' + esc(name) + '</i></span><span>Date <i></i></span><span>Score <i></i></span></div>';
    var items = ws.problems.map(function (p, i) {
      return '<li class="prob"><span class="num">' + (i + 1) + '</span><div class="body"><div class="t">' + safe(p.question) + '</div><div class="work"></div></div></li>';
    }).join('');
    var hub = esc(o.hub || 'Practice Hub');
    var foot = '<footer><span>Seed ' + esc(ws.seed) + ' · ' + hub + '</span><span>Regenerate: <code>' + esc(cmd) + '</code></span></footer>';
    var key = showAnswers ? '<section class="key"><h2>Answer key — ' + esc(title) + ' (seed ' + esc(ws.seed) + ')</h2><ol>' +
      ws.problems.map(function (p, i) {
        return '<li><span class="n">' + (i + 1) + '</span><span class="a">' + safe(p.answer) + (p.work ? '<span class="w">' + safe(p.work) + '</span>' : '') + '</span></li>';
      }).join('') + '</ol><footer><span>' + esc(title) + ' · answer key</span><span>' + hub + '</span></footer></section>' : '';
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(title) + ' — seed ' + esc(ws.seed) + '</title>\n<style>' + css + '</style>\n</head>\n<body>\n<div class="page">\n' + head + '\n<ol class="problems">\n' + items + '\n</ol>\n' + foot + '\n' + key + '\n</div>\n</body>\n</html>\n';
  }

  return { TOPICS: TOPICS, topic: function (id) { return TOPIC_BY_ID[id] || null; }, generate: generate, checkAnswer: checkAnswer, normalise: norm, renderWorksheet: renderWorksheet, rng: rng, MINUS: MINUS };
});
