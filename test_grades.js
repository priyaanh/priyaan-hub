#!/usr/bin/env node
/* test_grades.js — self-test for the by-grade generators in grades.js. Exit 1 on any failure.
   Generates hundreds of problems per topic per level, checks them for junk and duplicates, verifies
   the answers computationally wherever the question can be re-solved, and exercises checkAnswer. */
'use strict';
const path = require('path');
const G = require(path.join(__dirname, 'grades.js'));

let failures = 0, checks = 0;
const shown = new Set();
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; const key = msg.slice(0, 55); if (!shown.has(key)) { shown.add(key); console.log('  FAIL: ' + msg); } }
  return !!cond;
}
const near = (a, b, t) => Math.abs(a - b) <= (t == null ? 1e-6 : t);
const plain = h => String(h).replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<br\s*\/?>/g, ' | ').replace(/<[^>]+>/g, '')
  .replace(/[−–]/g, '-').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
const numbersIn = s => (plain(s).replace(/,(\d{3})/g, '$1').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const val = s => {                                   // "x = -4", "44 cm^2", "$14.00", "3/4", "10%" -> a number
  let t = plain(s).replace(/^[a-z]\s*=\s*/i, '').replace(/[$,%\s]/g, '')
    .replace(/(cm|m|units?|degrees|°)(\^\(?[23]\)?)?$/i, '').replace(/[°]/g, '');
  const f = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/); if (f) return Number(f[1]) / Number(f[2]);
  let n = Number(t);
  if (isNaN(n)) { t = t.replace(/[a-z^()²³]+$/i, ''); n = Number(t); }   // "12miles" -> 12
  return isNaN(n) ? null : n; };

/* junk that should never reach a worksheet */
const junk = /NaN|undefined|Infinity|null|\+ -|\+ −|(^|[^\d.])1x\b|x \+ 0\b|[+−-] 0\b|−−|--/;

const verify = {
  integers(q, a) {
    const p = plain(q);
    let m;
    if ((m = /^Work out: (-?\d+) \+ \(?(-?\d+)\)?$/.exec(p))) return near(val(a), Number(m[1]) + Number(m[2]));
    if ((m = /^Work out: (-?\d+) - \((-?\d+)\)$/.exec(p))) return near(val(a), Number(m[1]) - Number(m[2]));
    if ((m = /^What is \|(-?\d+)\|\?$/.exec(p))) return near(val(a), Math.abs(Number(m[1])));
    if ((m = /^Which is greater: (-?\d+) or (-?\d+)\?$/.exec(p))) return near(val(a), Math.max(Number(m[1]), Number(m[2])));
    return null;
  },
  fractions(q, a) {
    const p = plain(q);
    let m = /: (\d+)\/(\d+) ([+\-×÷]) (\d+)\/(\d+)$/.exec(p);
    if (!m) return null;
    const [, n1, d1, op, n2, d2] = m;
    const x = Number(n1) / Number(d1), y = Number(n2) / Number(d2);
    const want = op === '+' ? x + y : op === '-' ? x - y : op === '×' ? x * y : x / y;
    return near(val(a), want, 1e-9);
  },
  decimals(q, a) {
    const p = plain(q); const m = /^Work out: (\d+(?:\.\d+)?) ([+×÷]) (\d+(?:\.\d+)?)$/.exec(p);
    if (!m) return null;
    const x = Number(m[1]), y = Number(m[3]);
    const want = m[2] === '+' ? x + y : m[2] === '×' ? x * y : x / y;
    return near(val(a), want, 0.051);
  },
  ratios(q, a) {
    const p = plain(q); let m;
    if ((m = /pays \$(\d+(?:\.\d+)?) for (\d+) notebook/.exec(p))) return near(val(a), Number(m[1]) / Number(m[2]), 0.005);
    if ((m = /(\d+) : (\d+) = (\d+) : ___/.exec(p))) return near(val(a), Number(m[2]) * Number(m[3]) / Number(m[1]));
    if ((m = /travels (\d+) miles in (\d+) hours? .*? in (\d+) hours?\?/.exec(p)))
      return near(val(a), Number(m[1]) / Number(m[2]) * Number(m[3]));
    return null;
  },
  percents(q, a) {
    const p = plain(q); let m;
    if ((m = /^What is (\d+)% of (\d+)\?$/.exec(p))) return near(val(a), Number(m[1]) / 100 * Number(m[2]), 1e-6);
    if ((m = /^Write ([\d.]+) as a percent\.$/.exec(p))) return near(val(a), Number(m[1]) * 100, 1e-6);
    if ((m = /^Write (\d+)\/(\d+) as a percent\.$/.exec(p))) return near(val(a), Number(m[1]) / Number(m[2]) * 100, 1e-6);
    return null;
  },
  expressions6(q, a) {
    const p = plain(q); let m;
    if ((m = /^Evaluate (\d+)n \+ (\d+) when n = (\d+)\.$/.exec(p))) return near(val(a), Number(m[1]) * Number(m[3]) + Number(m[2]));
    if ((m = /^Solve for x:  x \+ (\d+) = (\d+)$/.exec(p))) return near(val(a), Number(m[2]) - Number(m[1]));
    if ((m = /^Solve for x:  (\d+)x = (\d+)$/.exec(p))) return near(val(a), Number(m[2]) / Number(m[1]));
    return null;
  },
  geometry6(q, a) {
    const p = plain(q); const n = numbersIn(p);
    if (/rectangle is/.test(p)) return near(val(a), n[0] * n[1]);
    if (/triangle has base/.test(p)) return near(val(a), n[0] * n[1] / 2);
    if (/parallelogram has base/.test(p)) return near(val(a), n[0] * n[1]);
    if (/box is/.test(p)) return near(val(a), n[0] * n[1] * n[2]);
    return null;
  },
  data6(q, a) {
    const p = plain(q); const m = /: (.+)$/.exec(p); if (!m) return null;
    const set = m[1].split(',').map(Number).filter(n => !isNaN(n)).sort((x, y) => x - y);
    if (/mean/.test(p)) return near(val(a), set.reduce((s, v) => s + v, 0) / set.length, 1e-9);
    if (/median/.test(p)) return near(val(a), set[(set.length - 1) / 2]);
    if (/range/.test(p)) return near(val(a), set[set.length - 1] - set[0]);
    return null;
  },
  rational(q, a) {
    const p = plain(q); let m;
    if ((m = /^Work out: (-?\d+) × \(?(-?\d+)\)?$/.exec(p))) return near(val(a), Number(m[1]) * Number(m[2]));
    if ((m = /^Work out: (-?\d+) ÷ \(?(-?\d+)\)?$/.exec(p))) return near(val(a), Number(m[1]) / Number(m[2]));
    if ((m = /simplify: -(\d+)\/(\d+) \+ (\d+)\/(\d+)$/.exec(p)))
      return near(val(a), -Number(m[1]) / Number(m[2]) + Number(m[3]) / Number(m[4]), 1e-9);
    return null;
  },
  proportions(q, a) {
    const p = plain(q); let m;
    if ((m = /y = (\d+) when x = (\d+)/.exec(p))) return near(val(a), Number(m[1]) / Number(m[2]));
    if ((m = /(\d+)\/(\d+) = x\/(\d+)$/.exec(p))) return near(val(a), Number(m[1]) * Number(m[3]) / Number(m[2]));
    if ((m = /scale of 1 : (\d+).*?is (\d+) cm/.exec(p))) return near(val(a), Number(m[1]) * Number(m[2]));
    return null;
  },
  percentapp(q, a) {
    const p = plain(q); let m;
    if ((m = /costs \$(\d+(?:\.\d+)?) and is (\d+)% off/.exec(p))) return near(val(a), Number(m[1]) * (100 - Number(m[2])) / 100, 0.005);
    if ((m = /meal costs \$(\d+(?:\.\d+)?)\. With a (\d+)% tip/.exec(p))) return near(val(a), Number(m[1]) * (100 + Number(m[2])) / 100, 0.005);
    if ((m = /rises from \$(\d+(?:\.\d+)?) to \$(\d+(?:\.\d+)?)/.exec(p))) return near(val(a), Math.round((Number(m[2]) - Number(m[1])) / Number(m[1]) * 100), 0.5);
    if ((m = /\$(\d+(?:\.\d+)?) in an account paying (\d+)% simple interest.*?after (\d+)/.exec(p)))
      return near(val(a), Number(m[1]) * Number(m[2]) / 100 * Number(m[3]), 0.005);
    return null;
  },
  equations7(q, a) {
    const p = plain(q).replace(/^Solve for x:\s*/, '');
    const x = val(a); if (x === null) return false;
    let m = /^(-?\d*)x ([+-]) (\d+) = (-?\d+)$/.exec(p);
    if (m) { const coef = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
      return near(coef * x + (m[2] === '+' ? 1 : -1) * Number(m[3]), Number(m[4])); }
    m = /^x\/(\d+) \+ (-?\d+) = (-?[\d.]+)$/.exec(p);
    if (m) return near(x / Number(m[1]) + Number(m[2]), Number(m[3]), 1e-9);
    return null;
  },
  inequalities7(q, a) {
    const p = plain(q).replace(/^Solve:\s*/, '');
    const m = /^(-?\d*)x ([+-]) (\d+) ([<>]=?|≥|≤) (-?\d+)$/.exec(p);
    if (!m) return null;
    const coef = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const c = (m[2] === '+' ? 1 : -1) * Number(m[3]), rel = m[4].replace('≥', '>=').replace('≤', '<='), rhs = Number(m[5]);
    const ans = plain(a).replace(/\s/g, '').replace(/≥/g, '>=').replace(/≤/g, '<=');
    const am = /^x(>=|<=|>|<)(-?[\d.]+)$/.exec(ans);
    if (!am) return false;
    const bound = Number(am[2]);
    const holds = (v, r, t) => r === '>' ? v > t : r === '<' ? v < t : r === '>=' ? v >= t : v <= t;
    for (const v of [bound - 2, bound - 0.5, bound, bound + 0.5, bound + 2]) {
      if (holds(coef * v + c, rel, rhs) !== holds(v, am[1], bound)) return false;
    }
    return true;
  },
  expressions7(q, a) {
    const p = plain(q);
    const evalLin = s => {                                    // "3x - 4" -> {m, c}
      let m = 0, c = 0;
      (s.replace(/\s/g, '').match(/[+-]?[^+-]+/g) || []).forEach(t => {
        if (/x$/.test(t)) { const co = t.slice(0, -1); m += co === '' || co === '+' ? 1 : co === '-' ? -1 : Number(co); }
        else if (t) c += Number(t);
      });
      return { m, c };
    };
    let mm;
    if ((mm = /^Expand: (-?\d+)\(x ([+-]) (\d+)\)$/.exec(p))) {
      const k = Number(mm[1]), b = (mm[2] === '+' ? 1 : -1) * Number(mm[3]);
      const got = evalLin(plain(a)); return got.m === k && got.c === k * b;
    }
    if ((mm = /^Simplify: (.+)$/.exec(p))) {
      const got = evalLin(plain(a)), want = evalLin(mm[1]); return got.m === want.m && got.c === want.c;
    }
    if ((mm = /^Factor: (\d+)x \+ (\d+)$/.exec(p))) {
      const am2 = /^(\d+)\((\d+)x \+ (\d+)\)$/.exec(plain(a));
      return !!am2 && Number(am2[1]) * Number(am2[2]) === Number(mm[1]) && Number(am2[1]) * Number(am2[3]) === Number(mm[2]);
    }
    return null;
  },
  geometry7(q, a) {
    const p = plain(q), n = numbersIn(p);
    if (/circumference/.test(p)) return val(plain(a).replace('π', '')) === 2 * n[0];
    if (/circle has radius.*area/s.test(p)) return val(plain(a).replace('π', '')) === n[0] * n[0];
    if (/complementary/.test(p)) return near(val(a), 90 - n[0]);
    if (/supplementary/.test(p)) return near(val(a), 180 - n[0]);
    if (/surface area/.test(p)) return near(val(a), 2 * (n[0] * n[1] + n[0] * n[2] + n[1] * n[2]));
    return null;
  },
  probability(q, a) {
    const p = plain(q), n = numbersIn(p);
    if (/P\(red\)/.test(p)) return near(val(a), n[0] / (n[0] + n[1]), 1e-9);
    if (/both times/.test(p)) return near(val(a), 1 / (n[0] * n[0]), 1e-9);
    if (/how many wins/.test(p)) return near(val(a), n[2] * n[0] / n[1], 1e-9);
    return null;
  },
  exponents8(q, a) {
    const p = plain(q); let m;
    if ((m = /^Simplify: (\d+)\^\((\d+)\) × \1\^\((\d+)\)$/.exec(p))) return plain(a) === m[1] + '^(' + (Number(m[2]) + Number(m[3])) + ')';
    if ((m = /^Simplify: (\d+)\^\((\d+)\) ÷ \1\^\((\d+)\)$/.exec(p))) return plain(a) === m[1] + '^(' + (Number(m[2]) - Number(m[3])) + ')';
    if (/scientific notation/.test(p)) { const n = numbersIn(p), an = numbersIn(a);
      return an.length === 3 && near(an[0] * Math.pow(10, an[2]), n[0], Math.max(1, n[0] * 1e-9)); }
    if ((m = /^Simplify: \((\d+)x\^\(2\)\)\^\((\d+)\)$/.exec(p)))
      return plain(a) === String(Math.pow(Number(m[1]), Number(m[2]))) + 'x^(' + (2 * Number(m[2])) + ')';
    return null;
  },
  linear8(q, a) {
    const p = plain(q).replace(/^Solve for x:\s*/, '');
    const m = /^(-?\d*)x ([+-]) (\d+) = (-?\d*)x ([+-]) (\d+)$/.exec(p);
    if (!m) return null;
    const c1 = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const k1 = (m[2] === '+' ? 1 : -1) * Number(m[3]);
    const c2 = m[4] === '' ? 1 : m[4] === '-' ? -1 : Number(m[4]);
    const k2 = (m[5] === '+' ? 1 : -1) * Number(m[6]);
    const x = val(a);
    return x !== null && near(c1 * x + k1, c2 * x + k2, 1e-9);
  },
  slope8(q, a) {
    const p = plain(q); let m;
    if ((m = /through \((-?\d+), (-?\d+)\) and \((-?\d+), (-?\d+)\)/.exec(p)))
      return near(val(a), (Number(m[4]) - Number(m[2])) / (Number(m[3]) - Number(m[1])), 1e-9);
    if (/Write it as y = mx \+ b/.test(p)) { const n = numbersIn(p); return /^y = /.test(plain(a)); }
    if ((m = /^For y = (-?\d*)x ([+-]) (\d+), find y when x = (-?\d+)\.$/.exec(p))) {
      const c = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
      return near(val(a), c * Number(m[4]) + (m[2] === '+' ? 1 : -1) * Number(m[3]));
    }
    return null;
  },
  systems8(q, a) {
    const p = plain(q);
    const eqs = p.split('|').map(s => /(-?\d*)x ([+-]) (\d+)y = (-?\d+)/.exec(s)).filter(Boolean);
    if (eqs.length !== 2) return null;
    const pt = /\((-?\d+), (-?\d+)\)/.exec(plain(a)); if (!pt) return false;
    const x = Number(pt[1]), y = Number(pt[2]);
    return eqs.every(e => {
      const A = e[1] === '' ? 1 : e[1] === '-' ? -1 : Number(e[1]);
      const B = (e[2] === '+' ? 1 : -1) * Number(e[3]);
      return near(A * x + B * y, Number(e[4]));
    });
  },
  pythagorean(q, a) {
    const n = numbersIn(q), got = val(a);
    if (/hypotenuse\?$/.test(plain(q))) return near(got, Math.hypot(n[0], n[1]));
    if (/other leg/.test(plain(q))) return near(got, Math.sqrt(n[1] * n[1] - n[0] * n[0]) ) || near(got, Math.sqrt(Math.abs(n[0] * n[0] - n[1] * n[1])));
    if (/How far apart/.test(plain(q))) return near(got, Math.hypot(n[2] - n[0], n[3] - n[1]));
    return null;
  },
  transformations(q, a) {
    const p = plain(q), n = numbersIn(p), pt = /\((-?\d+), (-?\d+)\)/.exec(plain(a));
    if (!pt) return false;
    const [ax, ay] = [Number(pt[1]), Number(pt[2])], [x, y] = [n[0], n[1]];
    if (/Translate/.test(p)) { const dx = /left/.test(p) ? -n[2] : n[2], dy = /down/.test(p) ? -n[3] : n[3];
      return ax === x + dx && ay === y + dy; }
    if (/across the x-axis/.test(p)) return ax === x && ay === -y;
    if (/across the y-axis/.test(p)) return ax === -x && ay === y;
    if (/180°/.test(p)) return ax === -x && ay === -y;
    if (/Dilate/.test(p)) return ax === x * n[2] && ay === y * n[2];
    return null;
  },
  volume8(q, a) {
    const p = plain(q), n = numbersIn(p), got = val(plain(a).replace('π', ''));
    if (/cylinder/.test(p)) return near(got, n[0] * n[0] * n[1]);
    if (/cone/.test(p)) return near(got, n[0] * n[0] * n[1] / 3);
    if (/sphere/.test(p)) return near(got, 4 * Math.pow(n[0], 3) / 3);
    return null;
  },
  functions8(q, a) {
    const p = plain(q);
    if (/Is this relation a function/.test(p)) {
      const pts = [...p.matchAll(/\((\d+), (\d+)\)/g)].map(m => [Number(m[1]), Number(m[2])]);
      const xs = pts.map(v => v[0]);
      const isFn = xs.every((x, i) => xs.every((x2, j) => x !== x2 || pts[i][1] === pts[j][1]));
      return plain(a) === (isFn ? 'yes' : 'no');
    }
    let m;
    if ((m = /f\((\d+)\) = (-?\d+) and f\((\d+)\) = (-?\d+)/.exec(p)))
      return near(val(a), (Number(m[4]) - Number(m[2])) / (Number(m[3]) - Number(m[1])));
    if ((m = /^For f\(x\) = (-?\d*)x ([+-]) (\d+), find f\((-?\d+)\)\.$/.exec(p))) {
      const c = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
      return near(val(a), c * Number(m[4]) + (m[2] === '+' ? 1 : -1) * Number(m[3]));
    }
    return null;
  }
};

console.log('test_grades: generating and verifying …');
const table = {};
for (const level of G.LEVELS) {
  for (const topic of level.topics) {
    const row = table[level.id + '/' + topic.id] = { made: 0, verified: 0, unchecked: 0, before: failures };
    for (const difficulty of [1, 2, 3]) {
      for (const seed of [11, 22, 33, 44, 55]) {
        const ws = G.generate({ grade: level.id, topics: [topic.id], count: 40, difficulty, seed });
        assert(ws.problems.length === 40, topic.id + ': count honoured (got ' + ws.problems.length + ')');
        for (const p of ws.problems) {
          row.made++;
          assert(!junk.test(p.question), topic.id + ' d' + difficulty + ': junk in question "' + plain(p.question) + '"');
          assert(!junk.test(p.answer) && !junk.test(p.work), topic.id + ' d' + difficulty + ': junk in answer "' + plain(p.answer) + '" / "' + plain(p.work) + '"');
          assert(p.question && p.answer && typeof p.work === 'string', topic.id + ': fields present');
          assert(!/<(?!\/?sup>|br>)/.test(p.question + p.answer + p.work), topic.id + ': stray "<" in ' + plain(p.question));
          assert(G.checkAnswer(p, p.answer), topic.id + ': checkAnswer accepts its own answer "' + plain(p.answer) + '"');
          (p.accept || []).forEach(alt => assert(G.checkAnswer(p, alt), topic.id + ': accepts variant "' + alt + '" of "' + plain(p.answer) + '"'));
          assert(!G.checkAnswer(p, 'zzz9'), topic.id + ': rejects nonsense');
          const v = verify[topic.id] ? verify[topic.id](p.question, p.answer) : null;
          if (v === null) row.unchecked++; else { row.verified++; assert(v, topic.id + ': wrong answer for "' + plain(p.question) + '" -> "' + plain(p.answer) + '"'); }
        }
        const again = G.generate({ grade: level.id, topics: [topic.id], count: 40, difficulty, seed });
        assert(JSON.stringify(again) === JSON.stringify(ws), topic.id + ' d' + difficulty + ': deterministic for seed ' + seed);
      }
      const mixed = G.generate({ grade: level.id, topics: [topic.id], count: 25, difficulty, seed: 909 });
      assert(new Set(mixed.problems.map(p => p.question)).size >= 20, topic.id + ' d' + difficulty + ': mostly distinct questions in a sheet');
    }
    row.failures = failures - row.before;
  }
  // a whole-grade sheet spreads across topics
  const full = G.generate({ grade: level.id, count: 40, difficulty: 2, seed: 5 });
  const per = {}; full.problems.forEach(p => { per[p.topic] = (per[p.topic] || 0) + 1; });
  assert(Object.keys(per).length === level.topics.length, level.id + ': every topic appears in a full sheet');
  assert(Math.max(...Object.values(per)) - Math.min(...Object.values(per)) <= 1, level.id + ': even spread ' + JSON.stringify(per));
  assert(full.problems.every((p, i) => p.id === 'q' + (i + 1)), level.id + ': ids in order');
}
/* degenerate questions that once slipped through */
for (const [grade, topic, re, why] of [['6', 'ratios', /(\b\d+) : \1\b/, 'a ratio of equal terms'],
                                       ['7', 'proportions', /(\b\d+)\/\1 =/, 'a proportion of equal terms']]) {
  for (let seed = 1; seed <= 30; seed++) {
    const ws = G.generate({ grade, topics: [topic], count: 40, difficulty: 2, seed });
    ws.problems.forEach(p => assert(!re.test(plain(p.question)), topic + ': ' + why + ' in "' + plain(p.question) + '"'));
  }
}
assert(G.generate({ grade: '7', count: 0 }).problems.length === 1, 'count clamps to 1');
assert(G.generate({ grade: '7', count: 500 }).problems.length === 60, 'count clamps to 60');
assert(G.generate({ grade: 'nope', count: 5 }).grade === '7', 'unknown grade falls back to 7');
assert(G.generate({ grade: '8', count: 5, difficulty: 9 }).difficulty === 2, 'bad difficulty falls back to 2');
[['x = 5', '5'], ['x = −5', 'x=-5'], ['(2, −3)', '2,-3'], ['12π', '12 pi'], ['$14.00', '14'], ['3/4', '3/4']]
  .forEach(([ans, typed]) => assert(G.checkAnswer({ answer: ans, accept: [] }, typed), 'checkAnswer("' + ans + '", "' + typed + '")'));

/* An answer that normalises away to nothing must not pass. norm() strips $ , ( ) so all of these once
   became the empty string, and Number('') is 0, which marked them right for any zero answer. */
[['0', '$'], ['0', '()'], ['0', ','], ['0', '  '], ['12', 'zzz12']]
  .forEach(([ans, typed]) => assert(!G.checkAnswer({ answer: ans, accept: [] }, typed),
    'checkAnswer must reject "' + typed + '" for "' + ans + '"'));
/* A label is only wrong when the question named a different one. */
assert(G.checkAnswer({ answer: 'x = 3', accept: ['3'] }, 'x = 3'), 'the named variable is accepted');
assert(!G.checkAnswer({ answer: 'x = 3', accept: ['3'] }, 'y = 3'), 'a different variable is refused');
assert(G.checkAnswer({ answer: '8', accept: ['k = 8'] }, 'k = 8'), 'a variant the question lists is accepted');
assert(G.checkAnswer({ answer: '(1, 4)', accept: ['x=1, y=4'] }, 'x=1, y=4'), 'a system written out is accepted');

/* Wording and workings that a person would notice but a value check never would. */
{
  const rng = G.rng || (seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  const hcf = (a, b) => { while (b) { const t = a % b; a = b; b = t; } return a; };
  let factored = 0;
  for (const level of G.LEVELS) for (const topic of level.topics) {
    for (let seed = 1; seed <= 120; seed++) {
      let p; try { p = topic.gen(rng(seed * 7919 + level.id.charCodeAt(0)), 2); } catch (e) { continue; }
      if (!p) continue;
      const q = plain(p.question), hint = plain(p.hint || '');
      assert(!/(^|[^0-9a-z])1[a-z]\b/.test(q), level.id + '/' + topic.id + ': a coefficient of 1 written out in "' + q + '"');
      assert(!/\bAdd \d+ from both sides/.test(hint), level.id + '/' + topic.id + ': "add N from both sides" in "' + hint + '"');
      const m = /^Factor: (\d+)x \+ (\d+)$/.exec(q);
      if (m) {
        factored++;
        const outer = /^(\d+)\(/.exec(String(p.answer));
        assert(outer && Number(outer[1]) === hcf(Number(m[1]), Number(m[2])),
          topic.id + ': "' + q + '" answered "' + p.answer + '" is not fully factored');
      }
    }
  }
  assert(factored > 20, 'the factoring questions were actually exercised (' + factored + ')');
}
/* The topic is named for the mode, so it has to ask for one. */
{
  const rng = G.rng || (seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  const topic = G.LEVELS.filter(l => l.id === '6')[0].topics.filter(t => t.id === 'data6')[0];
  const asked = {};
  for (let seed = 1; seed <= 600; seed++) {
    const m = /Find the (\w+)/.exec(plain(topic.gen(rng(seed * 7919), 2).question));
    if (m) asked[m[1]] = 1;
  }
  ['mean', 'median', 'mode', 'range'].forEach(k => assert(asked[k], 'Grade 6 statistics never asks for the ' + k));
}

console.log('\n  topic                     made  verified  unchecked  failures');
Object.keys(table).forEach(k => { const r = table[k];
  console.log('  ' + k.padEnd(24) + String(r.made).padStart(6) + String(r.verified).padStart(10) + String(r.unchecked).padStart(11) + String(r.failures).padStart(10)); });
console.log('\n' + checks + ' checks, ' + failures + ' failure' + (failures === 1 ? '' : 's') + (failures ? '' : ' — all good'));
process.exit(failures ? 1 : 0);
