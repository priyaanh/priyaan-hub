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
/* "[+-] 0" means a pointless term like "x + 0"; "0.63" is an ordinary decimal, so do not flag it */
const junk = /NaN|undefined|Infinity|null|\+ -|\+ −|(^|[^\d.])1x\b|x \+ 0\b|[+−-] 0(?![.\d])|−−|--/;

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
  },

  /* ---------------- grade 4 ---------------- */
  place4(q, a) {
    const p = plain(q); let m;
    if ((m = /^Round ([\d,]+) to the nearest (ten|hundred|thousand)\.$/.exec(p))) {
      const to = { ten: 10, hundred: 100, thousand: 1000 }[m[2]];
      return near(val(a), Math.round(Number(m[1].replace(/,/g, '')) / to) * to);
    }
    if ((m = /^In ([\d,]+), what is the digit (\d) worth\?$/.exec(p))) {
      const n = m[1].replace(/,/g, ''), at = n.indexOf(m[2]);
      return near(val(a), Number(m[2]) * Math.pow(10, n.length - 1 - at));
    }
    if ((m = /^Which is greater: ([\d,]+) or ([\d,]+)\?$/.exec(p)))
      return near(val(a), Math.max(Number(m[1].replace(/,/g, '')), Number(m[2].replace(/,/g, ''))));
    return null;
  },
  mult4(q, a) { const m = /^Work out: ([\d,]+) × ([\d,]+)$/.exec(plain(q));
    return m ? near(val(a), Number(m[1].replace(/,/g, '')) * Number(m[2].replace(/,/g, ''))) : null; },
  div4(q, a) { return divRem(q, a); },
  divide5(q, a) { return divRem(q, a); },
  frac4(q, a) {
    const p = plain(q); let m;
    if ((m = /^Fill in the missing number: (\d+)\/(\d+) = \?\/(\d+)$/.exec(p)))
      return near(val(a), Number(m[1]) * Number(m[3]) / Number(m[2]));
    if ((m = /^Which is greater: (\d+)\/(\d+) or (\d+)\/(\d+)\?$/.exec(p)))
      return near(val(a), Math.max(Number(m[1]) / Number(m[2]), Number(m[3]) / Number(m[4])));
    if ((m = /^What is (\d+)\/(\d+) of (\d+)\?$/.exec(p)))
      return near(val(a), Number(m[3]) / Number(m[2]) * Number(m[1]));
    return null;
  },
  addfrac4(q, a) {
    const m = /^Work out: (\d+)\/(\d+) ([+-]) (\d+)\/(\d+) \(simplify\)$/.exec(plain(q));
    if (!m) return null;
    const v = m[3] === '+' ? Number(m[1]) / Number(m[2]) + Number(m[4]) / Number(m[5])
                           : Number(m[1]) / Number(m[2]) - Number(m[4]) / Number(m[5]);
    return near(val(a), v);
  },
  dec4(q, a) {
    const p = plain(q); let m;
    if ((m = /^Work out: ([\d.]+) \+ ([\d.]+)$/.exec(p))) return near(val(a), Number(m[1]) + Number(m[2]), 1e-9);
    if ((m = /^Which is greater: ([\d.]+) or ([\d.]+)\?$/.exec(p))) return near(val(a), Math.max(Number(m[1]), Number(m[2])));
    if ((m = /^Write (0\.\d) as a fraction in its simplest form\.$/.exec(p))) return near(val(a), Number(m[1]));
    return null;
  },
  area4(q, a) {
    const p = plain(q); let m;
    if ((m = /is (\d+) cm by (\d+) cm\. What is its area\?$/.exec(p))) return near(val(a), Number(m[1]) * Number(m[2]));
    if ((m = /is (\d+) cm by (\d+) cm\. What is its perimeter\?$/.exec(p))) return near(val(a), 2 * (Number(m[1]) + Number(m[2])));
    if ((m = /area ([\d,]+) cm\^2 and one side (\d+) cm/.exec(p))) return near(val(a), Number(m[1].replace(/,/g, '')) / Number(m[2]));
    return null;
  },
  measure4(q, a) {
    const p = plain(q); let m;
    const per = { m: 1000, g: 1000, cm: 100, mL: 1000, minutes: 60, seconds: 60 };
    if ((m = /^How many (\w+) are in ([\d.]+) (\w+)\?$/.exec(p)) && per[m[1]]) return near(val(a), Number(m[2]) * per[m[1]]);
    if ((m = /holds (\d+) kg (\d+) g/.exec(p))) return near(val(a), Number(m[1]) * 1000 + Number(m[2]));
    if ((m = /starts at (\d+):(\d+) and ends at (\d+):(\d+)/.exec(p))) {
      let mins = (Number(m[3]) * 60 + Number(m[4])) - (Number(m[1]) * 60 + Number(m[2]));
      while (mins <= 0) mins += 720;
      return near(val(a), mins);
    }
    return null;
  },
  factors4(q, a) {
    const p = plain(q); let m;
    if ((m = /^List every factor of (\d+)\.$/.exec(p))) {
      const n = Number(m[1]), fs = [];
      for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i);
      return plain(a).replace(/\s/g, '') === fs.join(',');
    }
    if ((m = /^What is the (\d+)\w\w multiple of (\d+)\?$/.exec(p))) return near(val(a), Number(m[1]) * Number(m[2]));
    if ((m = /^Is (\d+) prime or composite\?$/.exec(p))) {
      const n = Number(m[1]);
      let prime = n > 1;
      for (let i = 2; i * i <= n; i++) if (n % i === 0) { prime = false; break; }
      return plain(a).trim() === (prime ? 'prime' : 'composite');
    }
    return null;
  },
  patterns4(q, a) {
    const m = /^What comes next\? ([\d, ]+), \?$/.exec(plain(q));
    if (!m) return null;
    const seq = m[1].split(',').map(x => Number(x.trim()));
    const diff = seq[1] - seq[0];
    const arithmetic = seq.every((v, i) => i === 0 || v - seq[i - 1] === diff);
    return near(val(a), arithmetic ? seq[seq.length - 1] + diff : seq[seq.length - 1] * (seq[1] / seq[0]));
  },

  /* ---------------- grade 5 ---------------- */
  dec5(q, a) {
    const m = /^Work out: ([\d.]+) ([+×÷-]) ([\d.]+)$/.exec(plain(q).replace(/[−–]/g, '-'));
    if (!m) return null;
    const x = Number(m[1]), y = Number(m[3]);
    const v = m[2] === '+' ? x + y : m[2] === '-' ? x - y : m[2] === '×' ? x * y : x / y;
    return near(val(a), v, 1e-6);
  },
  frac5(q, a) {
    const m = /^Work out: (\d+)\/(\d+) ([+-]) (\d+)\/(\d+) \(simplify\)$/.exec(plain(q));
    if (!m) return null;
    const x = Number(m[1]) / Number(m[2]), y = Number(m[4]) / Number(m[5]);
    return near(val(a), m[3] === '+' ? x + y : x - y);
  },
  multfrac5(q, a) {
    const p = plain(q); let m;
    if ((m = /^What is (\d+)\/(\d+) of (\d+)\?$/.exec(p))) return near(val(a), Number(m[3]) / Number(m[2]) * Number(m[1]));
    if ((m = /^Work out: (\d+)\/(\d+) × (\d+)\/(\d+) \(simplify\)$/.exec(p)))
      return near(val(a), Number(m[1]) * Number(m[3]) / (Number(m[2]) * Number(m[4])));
    return null;
  },
  vol5(q, a) {
    const p = plain(q); let m;
    if ((m = /is (\d+) cm long, (\d+) cm wide and (\d+) cm high/.exec(p))) return near(val(a), Number(m[1]) * Number(m[2]) * Number(m[3]));
    if ((m = /volume ([\d,]+) cm\^3.*base is (\d+) cm by (\d+) cm/.exec(p)))
      return near(val(a), Number(m[1].replace(/,/g, '')) / (Number(m[2]) * Number(m[3])));
    return null;
  },
  ops5(q, a) {
    const m = /^Work out: (.+)$/.exec(plain(q));
    if (!m) return null;
    const expr = m[1].replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-');
    if (!/^[-+*/()\d\s.]+$/.test(expr)) return null;
    return near(val(a), eval(expr), 1e-9);            // the expression is digits and operators only
  },
  coord5(q, a) {
    const p = plain(q); let m;
    if ((m = /^How far is it from \((\d+), (\d+)\) to \((\d+), (\d+)\)\?$/.exec(p))) return near(val(a), Math.abs(Number(m[3]) - Number(m[1])));
    if ((m = /^Start at \((\d+), (\d+)\), move (\d+) right and (\d+) up\. Where are you\?$/.exec(p))) {
      const want = '(' + (Number(m[1]) + Number(m[3])) + ', ' + (Number(m[2]) + Number(m[4])) + ')';
      return plain(a).replace(/\s/g, '') === want.replace(/\s/g, '');
    }
    return null;
  },
  powers5(q, a) {
    const m = /^Work out: ([\d,.]+) ([×÷]) ([\d,]+)$/.exec(plain(q));
    if (!m) return null;
    const x = Number(m[1].replace(/,/g, '')), y = Number(m[3].replace(/,/g, ''));
    return near(val(a), m[2] === '×' ? x * y : x / y, 1e-6);
  },
  convert5(q, a) {
    const p = plain(q); let m;
    const per = { cm: 100, m: 1000, g: 1000, mL: 1000, mm: 10 };
    if ((m = /^How many (\w+) are in ([\d.]+) (\w+)\?$/.exec(p)) && per[m[1]]) return near(val(a), Number(m[2]) * per[m[1]], 1e-6);
    if ((m = /^Write ([\d,.]+) (\w+) in (\w+)\.$/.exec(p)) && per[m[2]]) return near(val(a), Number(m[1].replace(/,/g, '')) / per[m[2]], 1e-6);
    return null;
  },
  average5(q, a) {
    const p = plain(q); let m;
    if ((m = /^Find the mean of: ([\d, ]+)$/.exec(p))) {
      const v = m[1].split(',').map(Number);
      return near(val(a), v.reduce((x, y) => x + y, 0) / v.length, 1e-6);
    }
    if ((m = /^Find the range of: ([\d, ]+)$/.exec(p))) {
      const v = m[1].split(',').map(Number);
      return near(val(a), Math.max(...v) - Math.min(...v));
    }
    return null;
  },

  /* ---------------- Integrated Math 2 ---------------- */
  quadfactor(q, a) {
    /* multiply the factored answer back out and compare it with the quadratic that was asked */
    const qq = plain(q).replace(/^Factor: /, '');
    const f = plain(a).match(/^\((\-?\d*)x?\s*([+-])\s*(\d+)\)\((\-?\d*)x?\s*([+-])\s*(\d+)\)$/);
    if (!f) return null;
    const a1 = f[1] === '' ? 1 : Number(f[1]), b1 = (f[2] === '-' ? -1 : 1) * Number(f[3]);
    const a2 = f[4] === '' ? 1 : Number(f[4]), b2 = (f[5] === '-' ? -1 : 1) * Number(f[6]);
    const A = a1 * a2, B = a1 * b2 + a2 * b1, C = b1 * b2;
    const want = polyText(A, B, C);
    return qq.replace(/\s/g, '') === want.replace(/\s/g, '');
  },
  quadsolve(q, a) {
    const roots = (plain(a).match(/-?\d+/g) || []).map(Number);
    if (roots.length !== 2) return null;
    const p = plain(q);
    let m = /^Solve: x\^2\s*(.*?)\s*= 0$/.exec(p);
    if (m) {
      const rest = m[1].replace(/\s/g, '');
      const mm = /^([+-])?(\d*)x([+-]\d+)?$/.exec(rest) || /^([+-]\d+)$/.exec(rest);
      /* substitute both roots into the quadratic built from the question's own numbers */
      const nums = (rest.match(/[+-]?\d*x|[+-]\d+/g) || []);
      let B = 0, C = 0;
      nums.forEach(t => {
        if (/x$/.test(t)) { const c = t.replace('x', ''); B = c === '' || c === '+' ? 1 : c === '-' ? -1 : Number(c); }
        else C = Number(t);
      });
      return roots.every(x => Math.abs(x * x + B * x + C) < 1e-9);
    }
    m = /^Solve: \(x\s*([+-])\s*(\d+)\)\(x\s*([+-])\s*(\d+)\) = 0$/.exec(p);
    if (m) {
      const r1 = (m[1] === '-' ? 1 : -1) * Number(m[2]), r2 = (m[3] === '-' ? 1 : -1) * Number(m[4]);
      return roots.slice().sort((x, y) => x - y).join(',') === [r1, r2].sort((x, y) => x - y).join(',');
    }
    return null;
  },
  transform2(q, a) {
    const p = plain(q);
    const pt = /\((-?\d+), (-?\d+)\)/.exec(p);
    if (!pt) return null;
    const x = Number(pt[1]), y = Number(pt[2]);
    let want = null;
    if (/reflected in the x-axis/.test(p)) want = [x, -y];
    else if (/reflected in the y-axis/.test(p)) want = [-x, y];
    else if (/reflected in the line y = x/.test(p)) want = [y, x];
    else if (/rotated 180/.test(p)) want = [-x, -y];
    else if (/rotated 90° counter-clockwise/.test(p)) want = [-y, x];
    else if (/rotated 90° clockwise/.test(p)) want = [y, -x];
    else {
      const t = /translated (\d+) (right|left) and (\d+) (up|down)/.exec(p);
      if (!t) return null;
      want = [x + Number(t[1]) * (t[2] === 'right' ? 1 : -1), y + Number(t[3]) * (t[4] === 'up' ? 1 : -1)];
    }
    return plain(a).replace(/\s/g, '') === ('(' + want[0] + ',' + want[1] + ')');
  },
  solids2(q, a) {
    const p = plain(q); let m;
    if ((m = /prism is (\d+) cm × (\d+) cm × (\d+) cm\. What is its volume\?$/.exec(p)))
      return near(val(a), Number(m[1]) * Number(m[2]) * Number(m[3]));
    if ((m = /prism is (\d+) cm × (\d+) cm × (\d+) cm\. What is its surface area\?$/.exec(p))) {
      const [x, y, z] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return near(val(a), 2 * (x * y + x * z + y * z));
    }
    if ((m = /cylinder has radius (\d+) cm and height (\d+) cm\. What is its volume/.exec(p)))
      return near(piCoef(a), Number(m[1]) * Number(m[1]) * Number(m[2]));
    if ((m = /cylinder has radius (\d+) cm and height (\d+) cm\. What is its curved surface area/.exec(p)))
      return near(piCoef(a), 2 * Number(m[1]) * Number(m[2]));
    return null;
  },
  circles2(q, a) {
    const p = plain(q); let m;
    if ((m = /radius (\d+) cm\. What is its circumference/.exec(p))) return near(piCoef(a), 2 * Number(m[1]));
    if ((m = /radius (\d+) cm\. What is its area/.exec(p))) return near(piCoef(a), Number(m[1]) * Number(m[1]));
    if ((m = /diameter (\d+) cm\. What is its area/.exec(p))) return near(piCoef(a), Math.pow(Number(m[1]) / 2, 2));
    if ((m = /circumference (\d+)π cm\. What is its radius\?$/.exec(p))) return near(val(a), Number(m[1]) / 2);
    if ((m = /radius (\d+) cm\. What is the length of an arc of (\d+)°/.exec(p)))
      return near(piCoef(a), 2 * Number(m[1]) * Number(m[2]) / 360, 1e-9);
    if ((m = /radius (\d+) cm\. What is the area of a sector of (\d+)°/.exec(p)))
      return near(piCoef(a), Number(m[1]) * Number(m[1]) * Number(m[2]) / 360, 1e-9);
    return null;
  },
  trig2(q, a) {
    const p = plain(q); let m;
    if ((m = /^A right triangle has legs (\d+) and (\d+)\. How long is the hypotenuse\?$/.exec(p)))
      return near(val(a), Math.sqrt(Number(m[1]) ** 2 + Number(m[2]) ** 2), 1e-9);
    m = /opposite angle A is (\d+), the side next to it is (\d+), and the hypotenuse is (\d+)\. Find (sin|cos|tan)\(A\)/.exec(p);
    if (!m) return null;
    const [opp, adj, hyp] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const want = m[4] === 'sin' ? opp / hyp : m[4] === 'cos' ? adj / hyp : opp / adj;
    return near(val(a), want, 1e-6);
  },
  special2(q, a) {
    const p = plain(q); let m;
    if ((m = /45°-45°-90° triangle one leg is (\d+)\. How long is the other leg\?$/.exec(p))) return near(val(a), Number(m[1]));
    if ((m = /45°-45°-90° triangle the hypotenuse is (\d+)√2\. How long is each leg\?$/.exec(p))) return near(val(a), Number(m[1]));
    if ((m = /30°-60°-90° triangle the hypotenuse is (\d+)\. How long is the side opposite the 30° angle\?$/.exec(p))) return near(val(a), Number(m[1]) / 2);
    if ((m = /30°-60°-90° triangle the side opposite the 30° angle is (\d+)\. How long is the hypotenuse\?$/.exec(p))) return near(val(a), Number(m[1]) * 2);
    return null;
  },
  similar2(q, a) {
    const p = plain(q); let m;
    if ((m = /matching sides of (\d+) cm and (\d+) cm/.exec(p))) return near(val(a), Number(m[2]) / Number(m[1]));
    if ((m = /scale factor (\d+)\. A side of the smaller is (\d+) cm/.exec(p))) return near(val(a), Number(m[1]) * Number(m[2]));
    if ((m = /scale factor (\d+)\. The smaller has area (\d+) cm\^2/.exec(p))) return near(val(a), Number(m[2]) * Number(m[1]) ** 2);
    return null;
  },
  prob2(q, a) {
    const p = plain(q); let m;
    if ((m = /holds (\d+) red and (\d+) blue counters.*P\(red\)/.exec(p))) return near(val(a), Number(m[1]) / (Number(m[1]) + Number(m[2])), 1e-6);
    if ((m = /chance of rain tomorrow is (\d+)\/(\d+)\. What is the chance it does not rain\?$/.exec(p)))
      return near(val(a), 1 - Number(m[1]) / Number(m[2]), 1e-6);
    if ((m = /P\(A\) = 1\/(\d+) and P\(B\) = 1\/(\d+)/.exec(p))) return near(val(a), 1 / (Number(m[1]) * Number(m[2])), 1e-6);
    if ((m = /(\d+) boys and \d+ girls answered\. (\d+) of the boys said yes/.exec(p)))
      return near(val(a), Number(m[2]) / Number(m[1]), 1e-6);
    return null;
  },
  expo2(q, a) {
    const p = plain(q); let m;
    if ((m = /^A quantity (grows|falls) by (\d+)% each year\. What is the multiplier\?$/.exec(p)))
      return near(val(a), m[1] === 'grows' ? (100 + Number(m[2])) / 100 : (100 - Number(m[2])) / 100, 1e-9);
    if ((m = /population of ([\d,]+) (grows|falls) by (\d+)% each year\. What is it after (one year|\d+ years)\?$/.exec(p))) {
      /* the same whole-number arithmetic the generator used, so no rounding can creep in */
      const base = Number(m[1].replace(/,/g, '')), f = m[2] === 'grows' ? 100 + Number(m[3]) : 100 - Number(m[3]);
      const n = m[4] === 'one year' ? 1 : Number(m[4].split(' ')[0]);
      const num = base * Math.pow(f, n), den = Math.pow(100, n);
      return num % den === 0 && near(val(a), num / den, 1e-9);
    }
    return null;
  }
};

/* shared by the two "divide with a remainder" topics */
function divRem(q, a) {
  const m = /^Work out: ([\d,]+) ÷ (\d+)/.exec(plain(q));
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, '')), d = Number(m[2]);
  const t = plain(a).replace(/\s|remainder/g, '').replace('r', ' ').trim().split(/\s+/).map(Number);
  return t.length === 2 ? (t[0] === Math.floor(n / d) && t[1] === n % d) : near(val(a), n / d);
}
/* the number in front of π, so "36π cm^2" verifies as 36 */
function piCoef(a) {
  const t = plain(a).replace(/[^\d./π-]/g, '');
  const m = /^(-?[\d./]*)π/.exec(t);
  if (!m) return NaN;
  if (m[1] === '' || m[1] === '-') return m[1] === '-' ? -1 : 1;
  const f = m[1].split('/');
  return f.length === 2 ? Number(f[0]) / Number(f[1]) : Number(m[1]);
}
/* "x^2 + 3x - 4" the way grades.js writes it, for comparing a factorisation multiplied back out */
function polyText(A, B, C) {
  const t = v => (v < 0 ? ' - ' : ' + ') + (Math.abs(v) === 1 ? '' : Math.abs(v));
  let s = (A === 1 ? '' : A) + 'x^2';
  if (B) s += t(B) + 'x';
  if (C) s += (C < 0 ? ' - ' : ' + ') + Math.abs(C);
  return s;
}

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
