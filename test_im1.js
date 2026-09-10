#!/usr/bin/env node
/* test_im1.js — self-test for the Integrated Math 1 generators in im1.js. Exit code 1 on any failure.
   Generates hundreds of problems per topic and difficulty, checks them for junk, determinism, duplicates and
   even topic spread, verifies answers computationally where the question can be re-solved, and exercises checkAnswer. */
'use strict';
const path = require('path');
const IM1 = require(path.join(__dirname, 'im1.js'));

let failures = 0, checks = 0;
const shown = new Set();
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; const key = msg.slice(0, 60); if (!shown.has(key) || failures <= 40) { shown.add(key); if (failures <= 60) console.log('  FAIL: ' + msg); } }
  return !!cond;
}
const near = (a, b, t) => Math.abs(a - b) <= (t == null ? 1e-6 : t);

/* ---------------------------------------------------------------- tiny expression evaluator for verification */
function toPlain(html) {
  return String(html).replace(/<sup>([^<]*)<\/sup>/g, '^($1)').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/[−–]/g, '-').replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/√/g, 'sqrt').replace(/≤/g, '<=').replace(/≥/g, '>=');
}
function tokenize(src) {
  const toks = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[\d.]/.test(c)) { let j = i; while (j < src.length && /[\d.]/.test(src[j])) j++; toks.push(Number(src.slice(i, j))); i = j; continue; }
    if (src.startsWith('sqrt', i)) { toks.push('sqrt'); i += 4; continue; }
    if (/[a-z]/.test(c)) { toks.push(c); i++; continue; }
    if ('+-*/^()'.includes(c)) { toks.push(c); i++; continue; }
    throw new Error('bad char "' + c + '" in ' + src);
  }
  return toks;
}
function evalExpr(src, vars) {
  const toks = tokenize(src); let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const op = next(), r = term(); v = op === '+' ? v + r : v - r; } return v; }
  function term() {
    let v = unary();
    for (;;) {
      const t = peek();
      if (t === '*' || t === '/') { next(); const r = unary(); v = t === '*' ? v * r : v / r; }
      else if (t !== undefined && t !== '+' && t !== '-' && t !== ')' && t !== '^') v = v * unary(); // implicit multiplication
      else break;
    }
    return v;
  }
  function unary() { if (peek() === '-') { next(); return -unary(); } if (peek() === '+') { next(); return unary(); } return power(); }
  function power() { const base = atom(); if (peek() === '^') { next(); return Math.pow(base, unary()); } return base; }
  function atom() {
    const t = next();
    if (t === '(') { const v = expr(); if (next() !== ')') throw new Error('missing ) in ' + src); return v; }
    if (t === 'sqrt') return Math.sqrt(unary());
    if (typeof t === 'number') return t;
    if (typeof t === 'string' && /^[a-z]$/.test(t)) { if (!(t in vars)) throw new Error('unknown variable ' + t + ' in ' + src); return vars[t]; }
    throw new Error('unexpected token ' + t + ' in ' + src);
  }
  const v = expr();
  if (i !== toks.length) throw new Error('trailing tokens in ' + src);
  return v;
}
function num(s) { // plain answer text → number (handles fractions, radicals, $ and commas)
  s = toPlain(s).replace(/^[a-z]\s*=\s*/, '').replace(/[$,]/g, '').replace(/\s*(mg|cells|cups|points|calories|cm)$/, '').replace(/%$/, '').trim();
  const f = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(s); if (f) return Number(f[1]) / Number(f[2]);
  const r = /^(-?\d*)sqrt\(?(\d+)\)?$/.exec(s); if (r) return (r[1] === '' ? 1 : r[1] === '-' ? -1 : Number(r[1])) * Math.sqrt(Number(r[2]));
  const v = Number(s); return isNaN(v) ? null : v;
}
function points(s) { const out = []; const re = /\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g; let m; while ((m = re.exec(s))) out.push([Number(m[1]), Number(m[2])]); return out; }
function numbers(s) { return (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number); }
function rhs(answer) { return toPlain(answer).replace(/^\s*(y|t\(n\)|x)\s*=\s*/, ''); }
function evalIneq(src, x) { // "a < 2x + 1 <= 7" or "x + 2 > 1 and 3x <= 9" → boolean
  return src.split(/\band\b/).every(part => {
    const pieces = part.split(/(<=|>=|<|>)/);
    for (let k = 1; k < pieces.length; k += 2) {
      const L = evalExpr(pieces[k - 1], { x }), R = evalExpr(pieces[k + 1], { x }), op = pieces[k];
      if (!(op === '<' ? L < R : op === '<=' ? L <= R : op === '>' ? L > R : L >= R)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------- per-topic verification */
const verify = {
  linear(p, x) {
    const q = toPlain(p.question).replace(/^Solve for x:\s*/, ''), sides = q.split('=');
    if (!assert(sides.length === 2, 'linear: one "=" in ' + q)) return;
    const v = num(p.answer);
    assert(v !== null && Number.isInteger(v), 'linear: integer answer ' + p.answer);
    assert(near(evalExpr(sides[0], { x: v }), evalExpr(sides[1], { x: v }), 1e-6), 'linear: x = ' + v + ' does not satisfy ' + q);
  },
  slope(p) {
    const q = toPlain(p.question), pts = points(q), a = toPlain(p.answer);
    // f(x, y) = lhs - rhs for whatever equation appears in the question
    const eqm = /line ((?:[^?,.]|\.\d)+?)(?:[?,]| in y = mx)/.exec(q.replace(/^Rewrite /, 'line ')); let f = null;
    if (eqm && eqm[1].includes('=')) { const s = eqm[1].split('='); f = (x, y) => evalExpr(s[0], { x, y }) - evalExpr(s[1], { x, y }); }
    const yAt = x => { if (!f) return null; const f0 = f(x, 0), f1 = f(x, 1); return -f0 / (f1 - f0); };
    if (/^Find the slope of the line through/.test(q)) {
      const [A, B] = pts; if (A[0] === B[0]) return assert(a === 'undefined', 'slope: vertical → undefined, got ' + a);
      assert(near(num(a), (B[1] - A[1]) / (B[0] - A[0])), 'slope between ' + q + ' → ' + a);
    } else if (/^Write the equation of the line through/.test(q)) {
      pts.forEach(P => assert(near(evalExpr(rhs(a), { x: P[0] }), P[1]), 'slope twopts: ' + a + ' misses ' + P));
    } else if (/^A line has slope/.test(q)) {
      const m = num(/slope (\S+) and/.exec(q)[1]), P = pts[0], r = rhs(a);
      assert(near(evalExpr(r, { x: P[0] }), P[1]) && near(evalExpr(r, { x: P[0] + 1 }) - P[1], m), 'slope point-slope: ' + q + ' → ' + a);
    } else if (/^What is the slope/.test(q)) {
      assert(f && near(num(a), yAt(1) - yAt(0)), 'slope from equation: ' + q + ' → ' + a);
    } else if (/^What is the y-intercept/.test(q)) {
      assert(f && near(num(a), yAt(0)), 'intercept from equation: ' + q + ' → ' + a);
    } else if (/^Rewrite/.test(q)) {
      assert(f && [0, 1, 2].every(x => near(f(x, evalExpr(rhs(a), { x })), 0)), 'rewrite: ' + q + ' → ' + a);
    } else if (/find y when x = /.test(q)) {
      const k = num(/x = (-?[\d.]+)/.exec(q)[1]); assert(f && near(yAt(k), num(a)), 'find y: ' + q + ' → ' + a);
    } else if (/find x when y = /.test(q)) {
      const k = num(/y = (-?[\d.]+)\.$/.exec(q)[1]); assert(f && near(yAt(num(a)), k), 'find x: ' + q + ' → ' + a);
    } else assert(false, 'slope: unrecognised question ' + q);
  },
  systems(p) {
    const lines = toPlain(p.question).split('\n').slice(1), sol = points(toPlain(p.answer))[0];
    if (!assert(lines.length === 2 && sol, 'systems: two equations and a pair in ' + p.question)) return;
    lines.forEach(eq => { const s = eq.split('='); assert(near(evalExpr(s[0], { x: sol[0], y: sol[1] }), evalExpr(s[1], { x: sol[0], y: sol[1] })), 'systems: ' + sol + ' fails ' + eq); });
    assert(Number.isInteger(sol[0]) && Number.isInteger(sol[1]), 'systems: integer solution ' + p.answer);
  },
  exponents(p) {
    const q = toPlain(p.question).replace(/^[^:]*:\s*/, ''), a = toPlain(p.answer);
    [{ x: 2, y: 3 }, { x: 3, y: 2 }, { x: 1.5, y: 0.5 }].forEach(v => { const L = evalExpr(q, v), R = evalExpr(a, v); assert(near(L, R, Math.abs(L) * 1e-9 + 1e-9), 'exponents: ' + q + ' ≠ ' + a + ' at ' + JSON.stringify(v)); });
    assert(!/\^\(?-/.test(a), 'exponents: answer has a negative exponent ' + a);
  },
  sequences(p) {
    const q = toPlain(p.question), a = toPlain(p.answer);
    const seqm = /sequence:?\s*(-?[\d.]+(?:,\s*-?[\d.]+){3}),\s*…/.exec(q) || /terms:\s*(-?[\d.]+(?:,\s*-?[\d.]+){3}),\s*…/.exec(q);
    if (seqm) {
      const t = seqm[1].split(',').map(Number), d = t[1] - t[0], r = t[1] / t[0];
      const arith = t.every((v, i) => !i || near(v - t[i - 1], d)), geom = t[0] !== 0 && t.every((v, i) => !i || near(v / t[i - 1], r));
      const nth = n => arith ? t[0] + (n - 1) * d : t[0] * Math.pow(r, n - 1);
      if (/next two terms/.test(q)) { const got = numbers(a); assert(arith || geom, 'sequences: next terms need a pattern ' + q); assert(got.length === 2 && near(got[0], nth(5)) && near(got[1], nth(6)), 'sequences next: ' + q + ' → ' + a); }
      else if (/explicit formula/.test(q)) { assert(arith || geom, 'sequences: formula needs a pattern ' + q); [1, 2, 3, 4].forEach(n => assert(near(evalExpr(rhs(a), { n }), t[n - 1], 1e-6), 'sequences formula ' + a + ' fails at n=' + n + ' for ' + q)); }
      else if (/find t\((\d+)\)/.test(q)) { const n = Number(/find t\((\d+)\)/.exec(q)[1]); assert(near(num(a), nth(n), 1e-6), 'sequences term: ' + q + ' → ' + a); }
      else if (/arithmetic, geometric, or neither/.test(q)) { const want = arith ? 'arithmetic' : geom ? 'geometric' : 'neither'; assert(a === want, 'sequences classify: ' + q + ' → ' + a + ' (want ' + want + ')'); }
      else assert(false, 'sequences: unrecognised ' + q);
    } else if (/^In an arithmetic sequence/.test(q)) {
      const m = /t\((\d+)\) = (-?\d+) and t\((\d+)\) = (-?\d+)/.exec(q), i = +m[1], ti = +m[2], j = +m[3], tj = +m[4], d = (tj - ti) / (j - i);
      if (/Write the explicit formula/.test(q)) assert(near(evalExpr(rhs(a), { n: i }), ti) && near(evalExpr(rhs(a), { n: j }), tj), 'sequences twoterms: ' + q + ' → ' + a);
      else { const k = Number(/Find t\((\d+)\)/.exec(q)[1]); assert(near(num(a), ti + (k - i) * d), 'sequences twoterms term: ' + q + ' → ' + a); }
    } else assert(false, 'sequences: unrecognised ' + q);
  },
  exponential(p) {
    const q = toPlain(p.question), a = toPlain(p.answer), n = numbers(q.replace(/,(\d{3})/g, '$1')), v = num(a);
    let m;
    if ((m = /a ([\d.]+)% (increase|decrease)\?$/.exec(q))) assert(near(v, 1 + (m[2] === 'increase' ? 1 : -1) * Number(m[1]) / 100, 1e-9), 'multiplier: ' + q + ' → ' + a);
    else if ((m = /pays ([\d.]+)% APY.*deposits \$([\d,]+)\. .* after (\d+) year/.exec(q))) assert(near(v, Number(m[2].replace(/,/g, '')) * Math.pow(1 + Number(m[1]) / 100, Number(m[3])), 0.0051), 'CD: ' + q + ' → ' + a);
    else if ((m = /A town of ([\d,]+) people grows ([\d.]+)% per year.* after (\d+) years/.exec(q))) assert(near(v, Math.round(Number(m[1].replace(/,/g, '')) * Math.pow(1 + Number(m[2]) / 100, Number(m[3])))), 'population: ' + q + ' → ' + a);
    else if ((m = /bought for \$([\d,]+) loses ([\d.]+)% .* after (\d+) years/.exec(q))) assert(near(v, Math.round(Number(m[1].replace(/,/g, '')) * Math.pow(1 - Number(m[2]) / 100, Number(m[3])))), 'car: ' + q + ' → ' + a);
    else if ((m = /A dose of (\d+) mg .* every (\d+) hours.* after (\d+) hours/.exec(q))) assert(near(v, Number(m[1]) * Math.pow(0.5, Number(m[3]) / Number(m[2])), 1e-9), 'halving: ' + q + ' → ' + a);
    else if ((m = /starts with (\d+) cells and doubles every (\d+) minutes.* after (\d+) hour/.exec(q))) assert(near(v, Number(m[1]) * Math.pow(2, Number(m[3]) * 60 / Number(m[2]))), 'doubling: ' + q + ' → ' + a);
    else if ((m = /starts at ([\d,]+) and (grows|shrinks) ([\d.]+)%/.exec(q))) { const a0 = Number(m[1].replace(/,/g, '')), b = 1 + (m[2] === 'grows' ? 1 : -1) * Number(m[3]) / 100; assert(near(evalExpr(rhs(a), { x: 0 }), a0) && near(evalExpr(rhs(a), { x: 1 }), a0 * b, 1e-6), 'equation: ' + q + ' → ' + a); }
    else if ((m = /y = \d+\(([\d.]+)\)\^\(x\) models.*percent does it (increase|decrease)/.exec(q))) assert(near(v, Math.abs(Number(m[1]) - 1) * 100, 1e-6), 'percent from b: ' + q + ' → ' + a);
    else if ((m = /was ([\d,]+) in year 0 and ([\d,]+) in year 2/.exec(q))) assert(near(v * v, Number(m[2].replace(/,/g, '')) / Number(m[1].replace(/,/g, '')), 1e-6), 'find b: ' + q + ' → ' + a);
    else assert(false, 'exponential: unrecognised ' + q);
    assert(n.length > 0, 'exponential: numbers in question');
  },
  inequalities(p) {
    const q = toPlain(p.question).replace(/^Solve:\s*/, ''), a = IM1.normalise(p.answer);
    const bounds = numbers(a.replace(/x/g, ' ')), tests = [];
    bounds.forEach(b => tests.push(b - 0.5, b, b + 0.5, b - 3, b + 3));
    if (!assert(bounds.length >= 1 && bounds.length <= 2, 'inequalities: bounds in ' + a)) return;
    tests.forEach(x => { const want = evalIneq(q, x), got = evalIneq(a, x); assert(want === got, 'inequalities: ' + q + ' → ' + a + ' disagree at x = ' + x); });
  },
  expressions(p) {
    const q = toPlain(p.question).replace(/^[^:]*:\s*/, ''), a = toPlain(p.answer);
    [2, 3, 7, -1, 0.5].forEach(x => { const L = evalExpr(q, { x }), R = evalExpr(a, { x }); assert(near(L, R, 1e-6), 'expressions: ' + q + ' ≠ ' + a + ' at x = ' + x); });
    const bare = a.replace(/\^\([^)]*\)/g, '^');   // ^(2) comes from <sup>, not from factoring
    if (/^Factor/.test(toPlain(p.question))) assert(/\(/.test(bare), 'expressions: factored answer has parentheses ' + a);
    else assert(!/\(/.test(bare), 'expressions: simplified answer has no parentheses ' + a);
  },
  functions(p) {
    const q = toPlain(p.question), a = toPlain(p.answer); let m;
    if ((m = /^If ([fgh])\(x\) = (.*), find [fgh]\((-?\d+)\)\.$/.exec(q))) assert(near(evalExpr(m[2], { x: Number(m[3]) }), num(a)), 'functions eval: ' + q + ' → ' + a);
    else if ((m = /^If ([fgh])\(x\) = (.*), find x when [fgh]\(x\) = (-?\d+)\.$/.exec(q))) assert(near(evalExpr(m[2], { x: num(a) }), Number(m[3])), 'functions findx: ' + q + ' → ' + a);
    else if ((m = /^State the (domain|range) of the function/.exec(q))) { const pts = points(q), idx = m[1] === 'domain' ? 0 : 1, want = [...new Set(pts.map(P => P[idx]))].sort((u, v) => u - v), got = numbers(a).sort((u, v) => u - v); assert(want.join() === got.join(), 'functions ' + m[1] + ': ' + q + ' → ' + a); }
    else if (/a function\? \(yes\/no\)$/.test(q)) {
      let xs, ys; if (/^Is the relation/.test(q)) { const pts = points(q); xs = pts.map(P => P[0]); ys = pts.map(P => P[1]); }
      else { const rows = q.split('\n'); xs = numbers(rows[1]); ys = numbers(rows[2]); }
      const isFn = xs.every((x, i) => xs.every((x2, j) => x !== x2 || ys[i] === ys[j]));
      assert(a === (isFn ? 'yes' : 'no'), 'functions isfn: ' + q.replace(/\n/g, ' | ') + ' → ' + a);
    } else assert(false, 'functions: unrecognised ' + q);
  },
  coordinate(p) {
    const q = toPlain(p.question), a = toPlain(p.answer), pts = points(q), ans = points(a)[0];
    const dist = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]); let m;
    if (/^Find the distance/.test(q)) assert(near(num(a), dist(pts[0], pts[1]), 1e-9), 'distance: ' + q + ' → ' + a);
    else if (/^Find the midpoint/.test(q)) assert(ans && near(ans[0], (pts[0][0] + pts[1][0]) / 2) && near(ans[1], (pts[0][1] + pts[1][1]) / 2), 'midpoint: ' + q + ' → ' + a);
    else if (/^Reflect .* x-axis/.test(q)) assert(ans && ans[0] === pts[0][0] && ans[1] === -pts[0][1], 'reflect x: ' + q + ' → ' + a);
    else if (/^Reflect .* y-axis/.test(q)) assert(ans && ans[0] === -pts[0][0] && ans[1] === pts[0][1], 'reflect y: ' + q + ' → ' + a);
    else if (/^Reflect .* y = x/.test(q)) assert(ans && ans[0] === pts[0][1] && ans[1] === pts[0][0], 'reflect y=x: ' + q + ' → ' + a);
    else if (/180°/.test(q)) assert(ans && ans[0] === -pts[0][0] && ans[1] === -pts[0][1], 'rotate 180: ' + q + ' → ' + a);
    else if (/90° counterclockwise/.test(q)) assert(ans && ans[0] === -pts[0][1] && ans[1] === pts[0][0], 'rotate 90: ' + q + ' → ' + a);
    else if ((m = /^Translate .* (\d+) units? (left|right) and (\d+) units? (up|down)/.exec(q))) { const dx = (m[2] === 'left' ? -1 : 1) * +m[1], dy = (m[4] === 'down' ? -1 : 1) * +m[3]; assert(ans && ans[0] === pts[0][0] + dx && ans[1] === pts[0][1] + dy, 'translate: ' + q + ' → ' + a); }
    else if (/is the midpoint of segment AB/.test(q)) { const [M, A] = pts; assert(ans && near((A[0] + ans[0]) / 2, M[0]) && near((A[1] + ans[1]) / 2, M[1]), 'endpoint: ' + q + ' → ' + a); }
    else if (/^Find the perimeter/.test(q)) assert(near(num(a), dist(pts[0], pts[1]) + dist(pts[1], pts[2]) + dist(pts[2], pts[0]), 1e-9), 'perimeter: ' + q + ' → ' + a);
    else assert(false, 'coordinate: unrecognised ' + q);
  },
  data(p) {
    const q = toPlain(p.question), a = toPlain(p.answer); let m;
    const line = /is y = (.+?)\.(?=\s|$)/.exec(q);
    if ((m = /Predict the .* when x = (-?[\d.]+)\.$/.exec(q))) assert(near(num(a), evalExpr(line[1], { x: Number(m[1]) }), 1e-6), 'data predict: ' + q + ' → ' + a);
    else if (/What does the (slope|y-intercept) mean/.test(q)) {
      const kind = /What does the (slope|y-intercept)/.exec(q)[1], slope = evalExpr(line[1], { x: 1 }) - evalExpr(line[1], { x: 0 }), opts = q.split('\n').slice(1);
      const want = 'abc'[opts.findIndex(o => kind === 'slope' ? new RegExp('^\\(.\\) For each additional .* ' + (slope > 0 ? 'increases' : 'decreases')).test(o) : /^\(.\) When the .* is 0, the predicted/.test(o))];
      assert(a === want, 'data interpret: ' + q.replace(/\n/g, ' | ') + ' → ' + a + ' (want ' + want + ')');
    } else if ((m = /r = (-?[\d.]+)\. Describe/.exec(q))) { const r = Number(m[1]), want = (Math.abs(r) >= 0.7 ? 'strong' : Math.abs(r) <= 0.35 ? 'weak' : 'moderate') + ' ' + (r < 0 ? 'negative' : 'positive'); assert(a === want, 'data assoc: ' + q + ' → ' + a); }
    else if ((m = /when x = (-?[\d.]+) was \$?([\d,.]+)\. Find the residual/.exec(q))) assert(near(num(a), Number(m[2].replace(/,/g, '')) - evalExpr(line[1], { x: Number(m[1]) }), 1e-6), 'data residual: ' + q + ' → ' + a);
    else if (/strongest linear association/.test(q)) { const rs = numbers(q.replace(/^.*: /, '')); assert(near(num(a), rs.reduce((u, v) => Math.abs(v) > Math.abs(u) ? v : u)), 'data strongest: ' + q + ' → ' + a); }
    else if ((m = /^Find the (mean|median) of the data set: (.*)$/.exec(q))) { const d = m[2].split(',').map(Number).sort((u, v) => u - v), n = d.length, want = m[1] === 'mean' ? d.reduce((u, v) => u + v, 0) / n : n % 2 ? d[(n - 1) / 2] : (d[n / 2 - 1] + d[n / 2]) / 2; assert(near(num(a), want, 0.0051), 'data ' + m[1] + ': ' + q + ' → ' + a); }
    else assert(false, 'data: unrecognised ' + q);
  }
};

/* ---------------------------------------------------------------- run */
const table = {};
const junk = /NaN|undefined|Infinity|null|\+ -|\+ −|(^|[^\d.])1x\b|x \+ 0(?![.\d])|−−|--/;
console.log('test_im1: generating and verifying …');
for (const topic of IM1.TOPICS) {
  const row = table[topic.id] = { generated: 0, verified: 0, failuresBefore: failures };
  for (const difficulty of [1, 2, 3]) {
    for (const seed of [1, 2, 3, 4, 5, 6, 7]) {
      let ws;
      try { ws = IM1.generate({ topics: [topic.id], count: 60, difficulty, seed }); }
      catch (e) { assert(false, topic.id + ' d' + difficulty + ' seed ' + seed + ' threw: ' + e.message); continue; }
      assert(ws.problems.length === 60, topic.id + ': count honoured');
      for (const p of ws.problems) {
        row.generated++;
        const isUndefinedSlope = topic.id === 'slope' && p.answer === 'undefined';
        assert(p.question && p.answer && typeof p.work === 'string', topic.id + ': fields present');
        assert(!junk.test(p.question) && (isUndefinedSlope || (!junk.test(p.answer) && !junk.test(p.work))), topic.id + ' d' + difficulty + ': junk in "' + p.question + '" / "' + p.answer + '" / "' + p.work + '"');
        assert(!/<(?!\/?sup>|br>)/.test(p.question + p.answer + p.work), topic.id + ': raw "<" outside <sup>/<br> in ' + p.question + ' | ' + p.answer + ' | ' + p.work);
        assert(Array.isArray(p.accept), topic.id + ': accept is an array');
        assert(IM1.checkAnswer(p, p.answer), topic.id + ': checkAnswer accepts its own answer "' + p.answer + '"');
        p.accept.forEach(alt => assert(IM1.checkAnswer(p, alt), topic.id + ': checkAnswer accepts variant "' + alt + '" for "' + p.answer + '"'));
        assert(!IM1.checkAnswer(p, 'zzz9'), topic.id + ': rejects garbage');
        try { verify[topic.id](p); row.verified++; }
        catch (e) { assert(false, topic.id + ': verifier threw "' + e.message + '" for ' + p.question + ' → ' + p.answer); }
      }
      // determinism
      const again = IM1.generate({ topics: [topic.id], count: 60, difficulty, seed });
      assert(JSON.stringify(again) === JSON.stringify(ws), topic.id + ' d' + difficulty + ': deterministic for seed ' + seed);
    }
    // no duplicates in a 30-problem sheet
    for (const seed of [101, 202, 303]) {
      const ws = IM1.generate({ topics: [topic.id], count: 30, difficulty, seed }), qs = new Set(ws.problems.map(p => p.question));
      assert(qs.size === 30, topic.id + ' d' + difficulty + ' seed ' + seed + ': ' + (30 - qs.size) + ' duplicate question(s) in a 30-problem sheet');
    }
  }
  row.failures = failures - row.failuresBefore;
}

/* mixed sheets: count honoured, even spread, ids, shuffle */
for (const [topics, count] of [[['linear', 'systems', 'exponents'], 20], [null, 60], [['slope', 'data'], 1], [['sequences', 'functions', 'coordinate', 'inequalities'], 7]]) {
  const ws = IM1.generate({ topics, count, difficulty: 2, seed: 42 });
  assert(ws.problems.length === count, 'mixed: count ' + count + ' honoured (got ' + ws.problems.length + ')');
  const per = {}; ws.problems.forEach(p => { per[p.topic] = (per[p.topic] || 0) + 1; });
  const vals = Object.values(per);
  assert(Math.max(...vals) - Math.min(...vals) <= 1 && Object.keys(per).length === Math.min(count, ws.topics.length), 'mixed: even spread ' + JSON.stringify(per));
  assert(ws.problems.every((p, i) => p.id === 'q' + (i + 1) && p.topicName), 'mixed: ids and topic names');
  assert(new Set(ws.problems.map(p => p.question)).size === count, 'mixed: no duplicate questions');
}
assert(IM1.generate({ topics: 'linear,systems', count: 200, seed: 1 }).problems.length === 60, 'count clamps to 60');
assert(IM1.generate({ topics: 'linear', count: 0, seed: 1 }).problems.length === 1, 'count clamps to 1');
assert(IM1.generate({ topics: 'linear', count: 5, difficulty: 9, seed: 1 }).difficulty === 2, 'bad difficulty falls back to 2');
assert((() => { try { IM1.generate({ topics: 'nope' }); return false; } catch (e) { return /Unknown topic/.test(e.message); } })(), 'unknown topic throws');
{ const a = IM1.generate({ topics: null, count: 20, difficulty: 2 }), b = IM1.generate({ topics: null, count: 20, difficulty: 2 }); assert(typeof a.seed === 'number' && (a.seed !== b.seed || JSON.stringify(a) === JSON.stringify(b)), 'random seed is reported'); }

/* renderWorksheet */
{
  const ws = IM1.generate({ topics: ['linear', 'systems', 'exponents'], count: 20, difficulty: 2, seed: 42 });
  const html = IM1.renderWorksheet(ws, { title: 'Test sheet', name: 'Priyaan' });
  assert(/^<!DOCTYPE html>/.test(html) && /<\/html>\s*$/.test(html), 'render: complete document');
  assert((html.match(/class="prob"/g) || []).length === 20, 'render: 20 problems');
  assert(/Answer key/.test(html) && /page-break-before/.test(html), 'render: answer key on a new page');
  assert(!/NaN|undefined/.test(html), 'render: no NaN/undefined');
  assert(/Priyaan/.test(html) && /Test sheet/.test(html) && /--seed 42/.test(html), 'render: name, title, regenerate command');
  assert(!/<link|<script|https?:/.test(html), 'render: self-contained, no external resources');
  assert(!/Answer key/.test(IM1.renderWorksheet(ws, { showAnswers: false })), 'render: showAnswers false omits the key');
  assert(IM1.renderWorksheet(ws) === IM1.renderWorksheet(IM1.generate({ topics: ['linear', 'systems', 'exponents'], count: 20, difficulty: 2, seed: 42 })), 'render: byte-identical for same seed');
  const evil = { seed: 1, difficulty: 2, topics: ['linear'], problems: [{ id: 'q1', topic: 'linear', topicName: 'x', question: '<script>alert(1)</script> 2<sup>3</sup>', answer: '<img src=x>', accept: [], work: '' }] };
  const out = IM1.renderWorksheet(evil); assert(!/<script>|<img/.test(out) && /2<sup>3<\/sup>/.test(out), 'render: escapes everything except <sup>');
}

/* checkAnswer variants */
const variants = [
  ['x = 5', '5', true], ['x = 5', 'x=5', true], ['x = 5', 'X = 5', true], ['x = 5', '6', false], ['x = 5', '', false],
  ['−3', '-3', true], ['−3', '3', false], ['−3', '-3.0', true],
  ['(2, −3)', '2,-3', true], ['(2, −3)', '(2,-3)', true], ['(2, −3)', 'x=2, y=-3', true], ['(2, −3)', '(-3, 2)', false],
  ['x<sup>2</sup> + 5x + 6', 'x^2+5x+6', true], ['x<sup>2</sup> + 5x + 6', 'x^2 + 5x + 6', true], ['x<sup>2</sup> + 5x + 6', '6 + 5x + x^2', true], ['x<sup>2</sup> + 5x + 6', 'x²+5x+6', true], ['x<sup>2</sup> + 5x + 6', 'x^2+6x+5', false],
  ['27x<sup>6</sup>y<sup>3</sup>', '27x^6y^3', true], ['27x<sup>6</sup>y<sup>3</sup>', '27 y^3 x^6', true], ['27x<sup>6</sup>y<sup>3</sup>', '9x^6y^3', false],
  ['1/x<sup>3</sup>', 'x^-3', true], ['1/x<sup>3</sup>', 'x^(-3)', true], ['8x<sup>6</sup>/y<sup>3</sup>', '8x^6y^-3', true], ['1/(4x<sup>6</sup>)', 'x^-6/4', true],
  ['x &gt; 4', 'x>4', true], ['x &gt; 4', '4 < x', true], ['x &gt; 4', 'x >= 4', false], ['x &gt; 4', 'x < 4', false],
  ['x ≤ −2', 'x<=-2', true], ['x ≤ −2', '-2 >= x', true], ['−5 &lt; x ≤ 3', '-5<x<=3', true], ['−5 &lt; x ≤ 3', '3 >= x > -5', true], ['−5 &lt; x ≤ 3', 'x > -5 and x <= 3', true], ['−5 &lt; x ≤ 3', '-5<=x<=3', false],
  ['t(n) = 3n + 2', '3n+2', true], ['t(n) = 3n + 2', 'a_n = 3n + 2', true], ['t(n) = 3n + 2', 't(n)=2+3n', true], ['t(n) = 3n + 2', '3n+5', false],
  ['t(n) = 3·2<sup>n</sup>', '3*2^n', true], ['t(n) = 3·2<sup>n</sup>', 't(n) = 3(2)^n', true],
  ['y = (2/3)x + 1', 'y=2/3x+1', true], ['y = (2/3)x + 1', '2x/3 + 1', true], ['y = (2/3)x + 1', 'y = 3/2x + 1', false], ['y = −(2/3)x + 1', 'y=-2/3x+1', true],
  ['2/3', '0.67', true], ['2/3', '0.6', false], ['$2,249.73', '2249.73', true], ['$2,249.73', '2249.7', false], ['1.039', '1.039', true], ['1.039', '1.04', false], ['0.85', '0.85', true],
  ['√13', 'sqrt(13)', true], ['√13', '3.61', true], ['√13', '13', false], ['(2.5, −1)', '(5/2, -1)', true],
  ['{1, 2, 4}', '1, 2, 4', true], ['{1, 2, 4}', '{4,2,1}', true], ['{1, 2, 4}', '1,2', false],
  ['yes', 'Yes', true], ['yes', 'no', false], ['no', 'not a function', true], ['a', '(a)', true], ['a', 'b', false],
  ['strong negative', 'negative, strong', true], ['strong negative', 'strong positive', false],
  ['6(7x − 5)', '6(7x-5)', true], ['24, 26', '24,26', true], ['7%', '7', true], ['undefined', 'Undefined', true],
  ['y = 500(1.06)<sup>x</sup>', 'y=500*1.06^x', true], ['y = 500(1.06)<sup>x</sup>', '500(1.06)^x', true]
];
variants.forEach(([answer, typed, want]) => assert(IM1.checkAnswer({ answer, accept: [] }, typed) === want, 'checkAnswer("' + answer + '", "' + typed + '") should be ' + want));

/* ---------------------------------------------------------------- summary */
console.log('\n  topic          generated  verified  failures');
for (const id of Object.keys(table)) { const r = table[id]; console.log('  ' + id.padEnd(15) + String(r.generated).padStart(9) + String(r.verified).padStart(10) + String(r.failures).padStart(10)); }
console.log('\n' + checks + ' checks, ' + failures + ' failure' + (failures === 1 ? '' : 's') + (failures ? '' : ' — all good'));
process.exit(failures ? 1 : 0);
